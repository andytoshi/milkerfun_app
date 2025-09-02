import { useCallback } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { Transaction, TransactionInstruction, SystemProgram } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { useNetwork } from './useNetwork';
import { 
  createWithdrawMilkInstruction,
  ensureTokenAccount,
  findProgramAddresses,
  BUY_COWS_DISCRIMINATOR
} from '../utils/program';

export const useSolanaTransactions = () => {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const { networkConfig } = useNetwork();

  const buyCows = useCallback(async (numCows: number) => {
    if (!publicKey || !sendTransaction) {
      throw new Error('Wallet not connected');
    }

    let signature: string | undefined;

    try {
      console.log('Starting buy cows transaction...', { numCows, publicKey: publicKey.toString() });
      console.log('Network config:', {
        programId: networkConfig.programId.toString(),
        milkMint: networkConfig.milkMint.toString(),
        poolTokenAccount: networkConfig.poolTokenAccount.toString()
      });
      
      // Ensure user has a token account
      const { tokenAccount: userTokenAccount, instruction: createTokenAccountIx } = 
        await ensureTokenAccount(connection, publicKey, networkConfig.milkMint);

      console.log('User token account:', userTokenAccount.toString());
      console.log('Pool token account:', networkConfig.poolTokenAccount.toString());

      // Check user's token balance
      try {
        const { getAccount } = await import('@solana/spl-token');
        const tokenAccountInfo = await getAccount(connection, userTokenAccount);
        const balance = Number(tokenAccountInfo.amount) / 1_000_000;
        console.log('Current MILK balance:', balance);
      } catch (balanceError) {
        console.log('Could not check balance (account may not exist yet):', 
          balanceError instanceof Error ? balanceError.message : String(balanceError));
      }

      // Get PDAs
      const { configPda, poolAuthorityPda, farmPda } = findProgramAddresses(networkConfig.programId, publicKey);
      
      console.log('PDAs:', {
        configPda: configPda.toString(),
        poolAuthorityPda: poolAuthorityPda.toString(),
        farmPda: farmPda!.toString()
      });

      // Create instruction manually with proper format
      console.log('Creating buy cows instruction...');
      const instructionData = Buffer.alloc(16);
      
      // Use the actual buy_cows discriminator
      BUY_COWS_DISCRIMINATOR.copy(instructionData, 0);
      
      // Number of cows as little-endian u64 (next 8 bytes)
      const numCowsBuffer = Buffer.alloc(8);
      numCowsBuffer.writeBigUInt64LE(BigInt(numCows), 0);
      numCowsBuffer.copy(instructionData, 8);
      
      console.log('Instruction data:', {
        discriminator: Array.from(instructionData.slice(0, 8)).map(b => '0x' + b.toString(16).padStart(2, '0')).join(' '),
        numCows: instructionData.readBigUInt64LE(8).toString(),
        totalLength: instructionData.length
      });

      // Create instruction
      const buyCowsInstruction = new TransactionInstruction({
        keys: [
          { pubkey: configPda, isSigner: false, isWritable: true },
          { pubkey: farmPda!, isSigner: false, isWritable: true },
          { pubkey: publicKey, isSigner: true, isWritable: true },
          { pubkey: userTokenAccount, isSigner: false, isWritable: true },
          { pubkey: networkConfig.poolTokenAccount, isSigner: false, isWritable: true },
          { pubkey: poolAuthorityPda, isSigner: false, isWritable: false },
          { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
          { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
        ],
        programId: networkConfig.programId,
        data: instructionData,
      });

      const transaction = new Transaction();
      
      // Add create token account instruction if needed
      if (createTokenAccountIx) {
        console.log('Adding create token account instruction');
        transaction.add(createTokenAccountIx);
      }
      
      // Add buy cows instruction
      transaction.add(buyCowsInstruction);

      console.log('Transaction created with', transaction.instructions.length, 'instructions');
      
      // Get recent blockhash
      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;
      
      console.log('Transaction details:', {
        recentBlockhash: transaction.recentBlockhash,
        feePayer: transaction.feePayer?.toString(),
        instructionCount: transaction.instructions.length
      });
      
      console.log('Sending transaction...');

      // Send transaction
      signature = await sendTransaction(transaction, connection, {
        skipPreflight: true, // Skip preflight to get better error messages
        preflightCommitment: 'confirmed',
      });

      console.log('Transaction sent:', signature);

      // Wait for confirmation
      console.log('Waiting for confirmation...');
      await connection.confirmTransaction(signature, 'confirmed');
      
      console.log('Transaction confirmed:', signature);
      return signature;
    } catch (error) {
      console.error('Error buying cows:', error);
      console.error('Error type:', error instanceof Error ? error.constructor.name : typeof error);
      console.error('Error message:', error instanceof Error ? error.message : String(error));
      
      // Try to get transaction details for better error info
      if (signature) {
        try {
          console.log('Getting transaction details for signature:', signature);
          const txDetails = await connection.getTransaction(signature, {
            commitment: 'confirmed',
            maxSupportedTransactionVersion: 0
          });
          
          if (txDetails) {
            console.log('Transaction status:', txDetails.meta?.err ? 'FAILED' : 'SUCCESS');
            if (txDetails.meta?.err) {
              console.log('Transaction error:', txDetails.meta.err);
            }
            if (txDetails.meta?.logMessages) {
              console.log('📋 Program Logs:');
              txDetails.meta.logMessages.forEach((log, i) => {
                console.log(`  ${i + 1}. ${log}`);
              });
            }
          } else {
            console.log('No transaction details found');
          }
        } catch (txError) {
          console.log('Failed to get transaction details:', txError);
        }
      }
      
      if (error && typeof error === 'object' && 'code' in error) {
        console.error('Error code:', (error as any).code);
      }
      
       // Try to get more detailed error information
       if (error && typeof error === 'object') {
         console.error('Full error object:', error);
         if ('cause' in error) {
           console.error('Error cause:', (error as any).cause);
         }
         if ('stack' in error) {
           console.error('Error stack:', (error as any).stack);
         }
       }
       
      throw error;
    }
  }, [connection, publicKey, sendTransaction, networkConfig]);

  const withdrawMilk = useCallback(async () => {
    if (!publicKey || !sendTransaction) {
      throw new Error('Wallet not connected');
    }

    try {
      console.log('Starting withdraw milk transaction...', { publicKey: publicKey.toString() });
      
      // Ensure user has a token account
      const { tokenAccount: userTokenAccount, instruction: createTokenAccountIx } = 
        await ensureTokenAccount(connection, publicKey, networkConfig.milkMint);

      console.log('User token account:', userTokenAccount.toString());

      // Create withdraw instruction
      const withdrawIx = await createWithdrawMilkInstruction(
        networkConfig.programId,
        publicKey,
        userTokenAccount,
        networkConfig.poolTokenAccount
      );

      console.log('Created withdraw instruction');

      const transaction = new Transaction();
      
      // Add create token account instruction if needed
      if (createTokenAccountIx) {
        console.log('Adding create token account instruction');
        transaction.add(createTokenAccountIx);
      }
      
      // Add withdraw instruction
      transaction.add(new TransactionInstruction(withdrawIx));

      console.log('Sending transaction...');

      // Send transaction
      const signature = await sendTransaction(transaction, connection, {
        skipPreflight: false,
        preflightCommitment: 'confirmed',
      });

      console.log('Transaction sent:', signature);

      // Wait for confirmation
      await connection.confirmTransaction(signature, 'confirmed');
      
      console.log('Transaction confirmed:', signature);
      return signature;
    } catch (error) {
      console.error('Error withdrawing milk:', error);
      if (error && typeof error === 'object' && 'logs' in error) {
        console.error('Transaction logs:', (error as any).logs);
      }
      throw error;
    }
  }, [connection, publicKey, sendTransaction, networkConfig]);

  const compoundCows = useCallback(async (numCows: number) => {
    if (!publicKey || !sendTransaction) {
      throw new Error('Wallet not connected');
    }

    try {
      console.log('Starting compound cows transaction...', { numCows, publicKey: publicKey.toString() });
      
      // Get PDAs
      const { configPda, farmPda } = findProgramAddresses(networkConfig.programId, publicKey);
      
      console.log('PDAs for compound:', {
        configPda: configPda.toString(),
        farmPda: farmPda!.toString(),
        poolTokenAccount: networkConfig.poolTokenAccount.toString()
      });

      // Create instruction manually with proper format
      console.log('Creating compound cows instruction...');
      const instructionData = Buffer.alloc(16);
      
      // Use the actual compound_cows discriminator
      const { COMPOUND_COWS_DISCRIMINATOR } = await import('../utils/program');
      COMPOUND_COWS_DISCRIMINATOR.copy(instructionData, 0);
      
      // Number of cows as little-endian u64 (next 8 bytes)
      const numCowsBuffer = Buffer.alloc(8);
      numCowsBuffer.writeBigUInt64LE(BigInt(numCows), 0);
      numCowsBuffer.copy(instructionData, 8);
      
      console.log('Compound instruction data:', {
        discriminator: Array.from(instructionData.slice(0, 8)).map(b => '0x' + b.toString(16).padStart(2, '0')).join(' '),
        numCows: instructionData.readBigUInt64LE(8).toString(),
        totalLength: instructionData.length
      });

      // Create instruction
      const compoundInstruction = new TransactionInstruction({
        keys: [
          { pubkey: configPda, isSigner: false, isWritable: true },
          { pubkey: farmPda!, isSigner: false, isWritable: true },
          { pubkey: networkConfig.poolTokenAccount, isSigner: false, isWritable: false },
          { pubkey: publicKey, isSigner: true, isWritable: false },
        ],
        programId: networkConfig.programId,
        data: instructionData,
      });

      const transaction = new Transaction();
      transaction.add(compoundInstruction);

      console.log('Transaction created with', transaction.instructions.length, 'instructions');
      
      // Get recent blockhash
      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;

      console.log('Sending transaction...');

      // Send transaction
      const signature = await sendTransaction(transaction, connection, {
        skipPreflight: true, // Skip preflight to get better error messages
        preflightCommitment: 'confirmed',
      });

      console.log('Transaction sent:', signature);

      // Wait for confirmation
      console.log('Waiting for confirmation...');
      await connection.confirmTransaction(signature, 'confirmed');
      
      console.log('Transaction confirmed:', signature);
      return signature;
    } catch (error) {
      console.error('Error compounding cows:', error);
      console.error('Error type:', error instanceof Error ? error.constructor.name : typeof error);
      console.error('Error message:', error instanceof Error ? error.message : String(error));
      
      if (error && typeof error === 'object') {
        console.error('Full error object:', error);
        if ('logs' in error) {
          console.error('Transaction logs:', (error as any).logs);
        }
      }
      
      throw error;
    }
  }, [connection, publicKey, sendTransaction, networkConfig]);

  return {
    buyCows,
    withdrawMilk,
    compoundCows,
  };
};