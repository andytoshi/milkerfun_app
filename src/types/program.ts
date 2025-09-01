import { PublicKey } from '@solana/web3.js';
import { BN } from '@coral-xyz/anchor';

export interface ConfigAccount {
  admin: PublicKey;
  milkMint: PublicKey;
  baseMilkPerCowPerMin: BN;
  cowInitialCost: BN;
  startTime: BN;
}

export interface FarmAccount {
  owner: PublicKey;
  cows: BN;
  lastUpdateTime: BN;
  accumulatedRewards: BN;
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