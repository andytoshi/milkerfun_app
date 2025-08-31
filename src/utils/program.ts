import { Connection, PublicKey, SystemProgram } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, getAssociatedTokenAddress, createAssociatedTokenAccountInstruction, getAccount } from '@solana/spl-token';
import { BN } from '@coral-xyz/anchor';
import { GAME_CONFIG } from '../constants/solana';
import type { ConfigAccount, FarmAccount, GameCalculations } from '../types/program';

import { sha256 } from '@noble/hashes/sha256';

// Generate proper Anchor method discriminators
const getMethodDiscriminator = (methodName: string): Buffer => {
  const hash = sha256(`global:${methodName}`);
  return Buffer.from(hash.slice(0, 8));
};

// Calculate actual discriminators
export const BUY_COWS_DISCRIMINATOR = getMethodDiscriminator('buy_cows');
export const WITHDRAW_MILK_DISCRIMINATOR = getMethodDiscriminator('withdraw_milk');
export const COMPOUND_COWS_DISCRIMINATOR = getMethodDiscriminator('compound_cows');

console.log('Method discriminators:', {
  buy_cows: Array.from(BUY_COWS_DISCRIMINATOR).map(b => '0x' + b.toString(16).padStart(2, '0')).join(' '),
  withdraw_milk: Array.from(WITHDRAW_MILK_DISCRIMINATOR).map(b => '0x' + b.toString(16).padStart(2, '0')).join(' '),
  compound_cows: Array.from(COMPOUND_COWS_DISCRIMINATOR).map(b => '0x' + b.toString(16).padStart(2, '0')).join(' '),
});

// Program instruction discriminators (first 8 bytes of instruction data)
const INSTRUCTION_DISCRIMINATORS = {
  BUY_COWS: BUY_COWS_DISCRIMINATOR,
  WITHDRAW_MILK: WITHDRAW_MILK_DISCRIMINATOR,
  COMPOUND_COWS: COMPOUND_COWS_DISCRIMINATOR,
};

export const findProgramAddresses = (programId: PublicKey, userPubkey?: PublicKey) => {
  const [configPda] = PublicKey.findProgramAddressSync(
    [Buffer.from('config')],
    programId
  );

  const [poolAuthorityPda] = PublicKey.findProgramAddressSync(
    [Buffer.from('pool_authority'), configPda.toBuffer()],
    programId
  );

  let farmPda: PublicKey | undefined;
  if (userPubkey) {
    [farmPda] = PublicKey.findProgramAddressSync(
      [Buffer.from('farm'), userPubkey.toBuffer()],
      programId
    );
  }

  return { configPda, poolAuthorityPda, farmPda };
};

export const deserializeConfig = (data: Buffer): ConfigAccount => {
  // Skip 8-byte discriminator
  let offset = 8;
  
  const admin = new PublicKey(data.slice(offset, offset + 32));
  offset += 32;
  
  const milkMint = new PublicKey(data.slice(offset, offset + 32));
  offset += 32;
  
  const baseMilkPerCowPerMin = new BN(data.slice(offset, offset + 8), 'le');
  offset += 8;
  
  const cowInitialCost = new BN(data.slice(offset, offset + 8), 'le');
  offset += 8;
  
  const startTime = new BN(data.slice(offset, offset + 8), 'le');
  
  return {
    admin,
    milkMint,
    baseMilkPerCowPerMin,
    cowInitialCost,
    startTime,
  };
};

export const deserializeFarm = (data: Buffer): FarmAccount => {
  // Skip 8-byte discriminator
  let offset = 8;
  
  const owner = new PublicKey(data.slice(offset, offset + 32));
  offset += 32;
  
  const cows = new BN(data.slice(offset, offset + 8), 'le');
  offset += 8;
  
  const lastUpdateTime = new BN(data.slice(offset, offset + 8), 'le');
  offset += 8;
  
  const accumulatedRewards = new BN(data.slice(offset, offset + 8), 'le');
  
  return {
    owner,
    cows,
    lastUpdateTime,
    accumulatedRewards,
  };
};

export const calculateGameStats = (config: ConfigAccount): GameCalculations => {
  const currentTime = Math.floor(Date.now() / 1000);
  const elapsedSeconds = currentTime - config.startTime.toNumber();
  const daysElapsed = Math.floor(elapsedSeconds / 86400);
  const hoursElapsed = Math.floor(elapsedSeconds / 3600);
  
  // Calculate current cow price (doubles every hour for first 4 hours)
  const priceHours = Math.min(hoursElapsed, GAME_CONFIG.PRICE_ESCALATION_HOURS);
  const priceMultiplier = Math.pow(2, priceHours);
  const currentCowPrice = (config.cowInitialCost.toNumber() * priceMultiplier) / Math.pow(10, GAME_CONFIG.MILK_DECIMALS);
  
  // Calculate current reward rate (halves every 10 days)
  const halvingPeriod = Math.floor(daysElapsed / GAME_CONFIG.HALVING_INTERVAL_DAYS);
  const currentRewardRate = Math.max(
    config.baseMilkPerCowPerMin.toNumber() / Math.pow(2, halvingPeriod),
    GAME_CONFIG.MIN_REWARD_RATE * Math.pow(10, GAME_CONFIG.MILK_DECIMALS)
  ) / Math.pow(10, GAME_CONFIG.MILK_DECIMALS);
  
  // Time calculations
  const nextHalvingTime = config.startTime.toNumber() + ((halvingPeriod + 1) * GAME_CONFIG.HALVING_INTERVAL_DAYS * 86400);
  const timeToNextHalving = Math.max(0, nextHalvingTime - currentTime);
  
  const nextPriceUpdateTime = config.startTime.toNumber() + ((Math.floor(elapsedSeconds / 3600) + 1) * 3600);
  const timeToNextPriceUpdate = Math.max(0, nextPriceUpdateTime - currentTime);

  return {
    currentCowPrice,
    currentRewardRate,
    pendingRewards: 0, // Will be calculated separately with farm data
    timeToNextHalving,
    timeToNextPriceUpdate,
    daysElapsed,
    hoursElapsed,
    halvingPeriod,
    priceMultiplier,
  };
};

export const calculatePendingRewards = (farm: FarmAccount, config: ConfigAccount): number => {
  if (farm.cows.isZero()) return 0;
  
  const currentTime = Math.floor(Date.now() / 1000);
  const timeSinceUpdate = currentTime - farm.lastUpdateTime.toNumber();
  const gameStats = calculateGameStats(config);
  
  // Calculate rewards: cows * rate * time_in_minutes
  const rewardsPerSecond = (farm.cows.toNumber() * gameStats.currentRewardRate) / 60;
  return rewardsPerSecond * timeSinceUpdate;
};

export const createBuyCowsInstruction = async (
  programId: PublicKey,
  userPubkey: PublicKey,
  userTokenAccount: PublicKey,
  poolTokenAccount: PublicKey,
  numCows: number
): Promise<{ keys: any[], programId: PublicKey, data: Buffer }> => {
  console.log('🔧 Creating buy cows instruction with params:', {
    programId: programId.toString(),
    userPubkey: userPubkey.toString(),
    userTokenAccount: userTokenAccount.toString(),
    poolTokenAccount: poolTokenAccount.toString(),
    numCows
  });
  
  const { configPda, poolAuthorityPda, farmPda } = findProgramAddresses(programId, userPubkey);
  
  console.log('🔧 Derived PDAs:', {
    configPda: configPda.toString(),
    poolAuthorityPda: poolAuthorityPda.toString(),
    farmPda: farmPda!.toString()
  });
  
  // Create instruction data: 8-byte discriminator + 8-byte num_cows
  const data = Buffer.alloc(16);
  // Use proper Anchor method discriminator
  INSTRUCTION_DISCRIMINATORS.BUY_COWS.copy(data, 0);
  // Number of cows as little-endian u64
  new BN(numCows).toArrayLike(Buffer, 'le', 8).copy(data, 8);
  
  console.log('🔧 Instruction data:', {
    discriminator: Array.from(data.slice(0, 8)).map(b => '0x' + b.toString(16).padStart(2, '0')).join(' '),
    numCows: new BN(data.slice(8, 16), 'le').toString(),
    totalLength: data.length
  });

  const keys = [
    { pubkey: configPda, isSigner: false, isWritable: false },
    { pubkey: farmPda!, isSigner: false, isWritable: true },
    { pubkey: userPubkey, isSigner: true, isWritable: true },
    { pubkey: userTokenAccount, isSigner: false, isWritable: true },
    { pubkey: poolTokenAccount, isSigner: false, isWritable: true },
    { pubkey: poolAuthorityPda, isSigner: false, isWritable: false },
    { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
    { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
  ];
  
  console.log('🔧 Instruction accounts:', keys.length);

  return {
    keys,
    programId,
    data,
  };
};

export const createWithdrawMilkInstruction = async (
  programId: PublicKey,
  userPubkey: PublicKey,
  userTokenAccount: PublicKey,
  poolTokenAccount: PublicKey
): Promise<{ keys: any[], programId: PublicKey, data: Buffer }> => {
  const { configPda, poolAuthorityPda, farmPda } = findProgramAddresses(programId, userPubkey);
  
  // Create instruction data: 8-byte discriminator only
  const data = Buffer.alloc(8);
  INSTRUCTION_DISCRIMINATORS.WITHDRAW_MILK.copy(data, 0);

  const keys = [
    { pubkey: configPda, isSigner: false, isWritable: false },
    { pubkey: farmPda!, isSigner: false, isWritable: true },
    { pubkey: userPubkey, isSigner: true, isWritable: false },
    { pubkey: userTokenAccount, isSigner: false, isWritable: true },
    { pubkey: poolTokenAccount, isSigner: false, isWritable: true },
    { pubkey: poolAuthorityPda, isSigner: false, isWritable: false },
    { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
  ];

  return {
    keys,
    programId,
    data,
  };
};

export const createCompoundCowsInstruction = async (
  programId: PublicKey,
  userPubkey: PublicKey,
  numCows: number
): Promise<{ keys: any[], programId: PublicKey, data: Buffer }> => {
  const { configPda, farmPda } = findProgramAddresses(programId, userPubkey);
  
  // Create instruction data: 8-byte discriminator + 8-byte num_cows
  const data = Buffer.alloc(16);
  // Use proper Anchor method discriminator
  INSTRUCTION_DISCRIMINATORS.COMPOUND_COWS.copy(data, 0);
  // Number of cows as little-endian u64
  new BN(numCows).toArrayLike(Buffer, 'le', 8).copy(data, 8);

  const keys = [
    { pubkey: configPda, isSigner: false, isWritable: false },
    { pubkey: farmPda!, isSigner: false, isWritable: true },
    { pubkey: userPubkey, isSigner: true, isWritable: false },
  ];

  return {
    keys,
    programId,
    data,
  };
};

export const ensureTokenAccount = async (
  connection: Connection,
  userPubkey: PublicKey,
  mintPubkey: PublicKey
): Promise<{ tokenAccount: PublicKey; instruction?: any }> => {
  const associatedTokenAccount = await getAssociatedTokenAddress(mintPubkey, userPubkey);
  
  try {
    await getAccount(connection, associatedTokenAccount);
    return { tokenAccount: associatedTokenAccount };
  } catch (error) {
    // Account doesn't exist, need to create it
    const instruction = createAssociatedTokenAccountInstruction(
      userPubkey, // payer
      associatedTokenAccount, // associated token account
      userPubkey, // owner
      mintPubkey // mint
    );
    
    return { tokenAccount: associatedTokenAccount, instruction };
  }
};

// Calculate total players and cows by scanning all farm accounts
export const calculateTotalStats = async (
  connection: Connection,
  programId: PublicKey
): Promise<{ totalPlayers: number; totalCows: number }> => {
  try {
    console.log('Fetching total stats (rate limited to prevent 429 errors)...');
    
    // Get all accounts owned by the program
    const accounts = await connection.getProgramAccounts(programId, {
      filters: [
        {
          dataSize: 8 + 32 + 8 + 8 + 8, // discriminator + FarmAccount struct size
        },
      ],
      commitment: 'confirmed', // Use confirmed commitment to reduce load
    });

    console.log(`Found ${accounts.length} program accounts`);

    let totalPlayers = 0;
    let totalCows = 0;

    for (const account of accounts) {
      try {
        // Check if this is a farm account by checking the discriminator
        
        // Skip if not a farm account (could be config account)
        if (account.account.data.length !== 8 + 32 + 8 + 8 + 8) {
          continue;
        }

        const farm = deserializeFarm(account.account.data);
        
        // Only count accounts that have been initialized (owner is not default)
        if (!farm.owner.equals(PublicKey.default)) {
          totalPlayers++;
          totalCows += farm.cows.toNumber();
        }
      } catch (error) {
        // Skip accounts that can't be deserialized as farm accounts
        console.log('Skipping account that is not a farm:', account.pubkey.toString());
        continue;
      }
    }

    console.log(`📊 Total stats: ${totalPlayers} players, ${totalCows} cows`);
    return { totalPlayers, totalCows };
  } catch (error) {
    console.error('⚠️ Error calculating total stats (likely rate limited):', error);
    // Return cached/default values instead of throwing to prevent UI errors
    return { totalPlayers: 0, totalCows: 0 };
  }
};