import { PublicKey } from '@solana/web3.js';
import { BN } from '@coral-xyz/anchor';

export interface ConfigAccount {
  admin: PublicKey;
  milkMint: PublicKey;
  cowMint: PublicKey;
  poolTokenAccount: PublicKey;
  startTime: BN;
  globalCowsCount: BN;
  initialTvl: BN;
}

export interface FarmAccount {
  owner: PublicKey;
  cows: BN;
  lastUpdateTime: BN;
  accumulatedRewards: BN;
  lastRewardRate: BN;
  lastWithdrawTime: BN;
}

export interface GameCalculations {
  currentCowPrice: number;
  currentRewardRate: number;
  pendingRewards: number;
  timeToNextHalving: number;
  timeToNextPriceUpdate: number;
  daysElapsed: number;
  hoursElapsed: number;
  halvingPeriod: number;
  priceMultiplier: number;
  greedMultiplier: number;
}