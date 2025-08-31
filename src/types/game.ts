export interface FarmData {
  owner: string;
  cows: number;
  lastUpdateTime: number;
  accumulatedRewards: number;
}

export interface ConfigData {
  admin: string;
  milkMint: string;
  baseMilkPerCowPerMin: number;
  cowInitialCost: number;
  startTime: number;
}

export interface GameStats {
  currentCowPrice: number;
  currentRewardRate: number;
  daysElapsed: number;
  hoursElapsed: number;
  halvingPeriod: number;
  timeToNextHalving: number;
  timeToNextPriceUpdate: number;
  priceMultiplier: number;
}

export interface UserStats {
  walletAddress: string;
  cows: number;
  accumulatedRewards: number;
  milkBalance: number;
  estimatedPendingRewards: number;
  totalRewards: number;
}

export interface WithdrawalHistory {
  timestamp: number;
  amount: number;
  signature: string;
}