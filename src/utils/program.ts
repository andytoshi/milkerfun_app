import { Connection, PublicKey, SystemProgram } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, getAssociatedTokenAddress, createAssociatedTokenAccountInstruction, getAccount} from '@solana/spl-token';
import { BN } from '@coral-xyz/anchor';
import { GAME_CONFIG } from '../constants/solana';
import type { ConfigAccount, FarmAccount, GameCalculations } from '../types/program';

// New economic calculation functions matching smart contract
export const calculateDynamicCowPrice = (globalCows: number): number => {
  if (globalCows === 0) {
    return GAME_CONFIG.COW_BASE_PRICE;
  }

  const ratio = globalCows / GAME_CONFIG.PRICE_PIVOT;
  const powerTerm = Math.pow(ratio, GAME_CONFIG.PRICE_STEEPNESS);
  const multiplier = 1.0 + powerTerm;
  
  return GAME_CONFIG.COW_BASE_PRICE * multiplier;
};

export const calculateDynamicRewardRate = (globalCows: number, tvl: number): number => {
  if (globalCows === 0) {
    return GAME_CONFIG.MIN_REWARD_PER_DAY;
  }

  // Calculate TVL per cow ratio
  const tvlPerCow = tvl / globalCows;
  const normalizedRatio = tvlPerCow / (GAME_CONFIG.TVL_NORMALIZATION * 1_000_000);
  
  // Calculate base reward with decay
  const denominator = 1.0 + (GAME_CONFIG.REWARD_SENSITIVITY * normalizedRatio);
  const baseReward = GAME_CONFIG.REWARD_BASE / denominator;
  
  // Apply greed multiplier: G(C) = 1 + β * e^(-C/C₀)
  const greedDecay = Math.exp(-globalCows / GAME_CONFIG.GREED_DECAY_PIVOT);
  const greedMultiplier = 1.0 + (GAME_CONFIG.GREED_MULTIPLIER * greedDecay);
  
  // Calculate final reward rate
  const rewardWithGreed = baseReward * greedMultiplier;
  return Math.max(rewardWithGreed, GAME_CONFIG.MIN_REWARD_PER_DAY);
};

export const calculateGreedMultiplier = (globalCows: number): number => {
  const greedDecay = Math.exp(-globalCows / GAME_CONFIG.GREED_DECAY_PIVOT);
  return 1.0 + (GAME_CONFIG.GREED_MULTIPLIER * greedDecay);
};

export const calculateWithdrawalPenalty = (hoursSinceLastWithdraw: number): { penaltyRate: number; isPenaltyFree: boolean } => {
  const isPenaltyFree = hoursSinceLastWithdraw >= 24 || hoursSinceLastWithdraw === 0;
  const penaltyRate = isPenaltyFree ? 0 : 0.5; // 50% penalty
  return { penaltyRate, isPenaltyFree };
};

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
export const EXPORT_COWS_DISCRIMINATOR = getMethodDiscriminator('export_cows');
export const IMPORT_COWS_DISCRIMINATOR = getMethodDiscriminator('import_cows');


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

  const [cowMintAuthorityPda] = PublicKey.findProgramAddressSync(
    [Buffer.from('cow_mint_authority'), configPda.toBuffer()],
    programId
  );

  let farmPda: PublicKey | undefined;
  if (userPubkey) {
    [farmPda] = PublicKey.findProgramAddressSync(
      [Buffer.from('farm'), userPubkey.toBuffer()],
      programId
    );
  }

  return { configPda, poolAuthorityPda, cowMintAuthorityPda, farmPda };
};

export const deserializeConfig = (data: Buffer): ConfigAccount => {
  // Skip 8-byte discriminator
  let offset = 8;
  
  const admin = new PublicKey(data.slice(offset, offset + 32));
  offset += 32;
  
  const milkMint = new PublicKey(data.slice(offset, offset + 32));
  offset += 32;
  
  const cowMint = new PublicKey(data.slice(offset, offset + 32));
  offset += 32;
  
  const poolTokenAccount = new PublicKey(data.slice(offset, offset + 32));
  offset += 32;
  
  const startTime = new BN(data.slice(offset, offset + 8), 'le');
  offset += 8;
  
  const globalCowsCount = new BN(data.slice(offset, offset + 8), 'le');
  offset += 8;
  
  const initialTvl = new BN(data.slice(offset, offset + 8), 'le');
  
  return {
    admin,
    milkMint,
    cowMint,
    poolTokenAccount,
    startTime,
    globalCowsCount,
    initialTvl,
  };
};

// Helper function to deserialize farm account data
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
  offset += 8;
  
  const lastRewardRate = new BN(data.slice(offset, offset + 8), 'le');
  offset += 8;
  
  const lastWithdrawTime = new BN(data.slice(offset, offset + 8), 'le');
  
  return {
    owner,
    cows,
    lastUpdateTime,
    accumulatedRewards,
    lastRewardRate,
    lastWithdrawTime,
  };
};

export const calculateGameStats = (config: ConfigAccount): GameCalculations => {
  const currentTime = Math.floor(Date.now() / 1000);
  const elapsedSeconds = currentTime - config.startTime.toNumber();
  const daysElapsed = Math.floor(elapsedSeconds / 86400);
  const hoursElapsed = Math.floor(elapsedSeconds / 3600);
  
  // These will be calculated with actual global data
  const currentCowPrice = GAME_CONFIG.COW_BASE_PRICE; // Default, will be updated with real data
  const currentRewardRate = GAME_CONFIG.REWARD_BASE; // Default, will be updated with real data
  const priceMultiplier = 1.0; // Will be calculated based on global cows
  const greedMultiplier = 9.0; // Default maximum greed multiplier, will be updated with real data

  return {
    currentCowPrice,
    currentRewardRate,
    pendingRewards: 0, // Will be calculated separately with farm data
    timeToNextHalving: 0, // Not applicable in new model
    timeToNextPriceUpdate: 0, // Not applicable in new model
    daysElapsed,
    hoursElapsed,
    halvingPeriod: 0, // Not applicable in new model
    priceMultiplier,
    greedMultiplier,
  };
};

export const calculatePendingRewards = (farm: FarmAccount): number => {
  if (farm.cows.isZero()) return 0;
  
  const currentTime = Math.floor(Date.now() / 1000);
  const timeSinceUpdate = currentTime - farm.lastUpdateTime.toNumber();
  
  // Use stored reward rate if available, otherwise calculate current rate
  const storedRate = farm.lastRewardRate ? farm.lastRewardRate.toNumber() : 0;
  const rewardRate = storedRate > 0 ? storedRate : GAME_CONFIG.REWARD_BASE * 1_000_000; // Convert to raw tokens
  
  // Calculate rewards: cows * rate * time_in_minutes
  const rewardsPerSecond = (farm.cows.toNumber() * rewardRate) / (86400 * 1_000_000); // per day to per second, accounting for decimals
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
  poolTokenAccount: PublicKey,
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
    { pubkey: configPda, isSigner: false, isWritable: true },
    { pubkey: farmPda!, isSigner: false, isWritable: true },
    { pubkey: poolTokenAccount, isSigner: false, isWritable: false },
    { pubkey: userPubkey, isSigner: true, isWritable: false },
  ];

  return {
    keys,
    programId,
    data,
  };
};

export const createExportCowsInstruction = async (
  programId: PublicKey,
  userPubkey: PublicKey,
  cowMint: PublicKey,
  userCowTokenAccount: PublicKey,
  poolTokenAccount: PublicKey,
  numCows: number
): Promise<{ keys: any[], programId: PublicKey, data: Buffer }> => {
  const { configPda, cowMintAuthorityPda, farmPda } = findProgramAddresses(programId, userPubkey);
  
  // Create instruction data: 8-byte discriminator + 8-byte num_cows
  const data = Buffer.alloc(16);
  EXPORT_COWS_DISCRIMINATOR.copy(data, 0);
  new BN(numCows).toArrayLike(Buffer, 'le', 8).copy(data, 8);

  const keys = [
    { pubkey: configPda, isSigner: false, isWritable: false },
    { pubkey: farmPda!, isSigner: false, isWritable: true },
    { pubkey: cowMint, isSigner: false, isWritable: true },
    { pubkey: cowMintAuthorityPda, isSigner: false, isWritable: false },
    { pubkey: userCowTokenAccount, isSigner: false, isWritable: true },
    { pubkey: poolTokenAccount, isSigner: false, isWritable: false },
    { pubkey: userPubkey, isSigner: true, isWritable: false },
    { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
  ];

  return {
    keys,
    programId,
    data,
  };
};

export const createImportCowsInstruction = async (
  programId: PublicKey,
  userPubkey: PublicKey,
  cowMint: PublicKey,
  userCowTokenAccount: PublicKey,
  poolTokenAccount: PublicKey,
  numCows: number
): Promise<{ keys: any[], programId: PublicKey, data: Buffer }> => {
  const { configPda, farmPda } = findProgramAddresses(programId, userPubkey);
  
  // Create instruction data: 8-byte discriminator + 8-byte num_cows
  const data = Buffer.alloc(16);
  IMPORT_COWS_DISCRIMINATOR.copy(data, 0);
  new BN(numCows).toArrayLike(Buffer, 'le', 8).copy(data, 8);

  const keys = [
    { pubkey: configPda, isSigner: false, isWritable: true },
    { pubkey: farmPda!, isSigner: false, isWritable: true },
    { pubkey: cowMint, isSigner: false, isWritable: true },
    { pubkey: userCowTokenAccount, isSigner: false, isWritable: true },
    { pubkey: poolTokenAccount, isSigner: false, isWritable: false },
    { pubkey: userPubkey, isSigner: true, isWritable: false },
    { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
    { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
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
    console.log('Fetching total stats from blockchain...');
    
    // Get all accounts owned by the program
    const accounts = await connection.getProgramAccounts(programId, {
      filters: [
        {
          dataSize: 8 + 32 + 8 + 8 + 8, // discriminator + FarmAccount struct size
        },
      ],
      commitment: 'confirmed', // Use confirmed commitment to reduce load
    });

    console.log(`Found ${accounts.length} farm accounts on-chain`);

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
        continue;
      }
    }

    console.log(`📊 Real blockchain stats: ${totalPlayers} players, ${totalCows} cows`);
    return { totalPlayers, totalCows };
  } catch (error) {
    console.error('⚠️ Error fetching blockchain stats:', error);
    // Return cached/default values instead of throwing to prevent UI errors
    return { totalPlayers: 0, totalCows: 0 };
  }
};