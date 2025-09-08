import { PublicKey } from '@solana/web3.js';

export const NETWORKS = {
  devnet: {
    name: 'Devnet',
    rpcUrl: 'https://api.devnet.solana.com',
    programId: new PublicKey('AQcStgNbBkLKDQNtQkKYvj8rtHMqeeynfHePXVYghqRS'),
    milkMint: new PublicKey('4LQuKpg99cDBkcidswiHnUA4gVD8jvu5Azo8tnveAr5d'),
    cowMint: new PublicKey('FQ26GfkMphHmX1qpEnU4vJoTdhkAZdPFWxmn35i5Hfrw'),
    configPda: new PublicKey('dT475H4f4MGsrAuUbtfSsbpGTdTCKyMPbU3gm6xW6wt'),
    poolAuthorityPda: new PublicKey('3L617e49AeCz86KYomPPFYpjwHkZH5iEAov44AT5D6G5'),
    cowMintAuthorityPda: new PublicKey('BVf7pkG631knKb57GLLLLGTRWNwTA3jV3m4cs8LZQjsK'),
    poolTokenAccount: new PublicKey('g7nrhnMhVig513fQnxnSXyP189VYjPxqHSzu96xhQQG'),
    explorerUrl: 'https://explorer.solana.com',
  },
  mainnet: {
    name: 'Mainnet',
    rpcUrl: 'https://necessary-frosty-mansion.solana-mainnet.quiknode.pro/876c6f89b2ae0e4d6c5fe31fe64c710cb609f6f0/',
    programId: new PublicKey('11111111111111111111111111111111'),
    milkMint: new PublicKey('11111111111111111111111111111111'),
    cowMint: new PublicKey('11111111111111111111111111111111'),
    configPda: new PublicKey('11111111111111111111111111111111'),
    poolAuthorityPda: new PublicKey('11111111111111111111111111111111'),
    cowMintAuthorityPda: new PublicKey('11111111111111111111111111111111'),
    poolTokenAccount: new PublicKey('11111111111111111111111111111111'),
    explorerUrl: 'https://explorer.solana.com',
  }
} as const;

export type NetworkType = keyof typeof NETWORKS;

// Check if mainnet is properly configured (not placeholder)
export const isMainnetConfigured = (): boolean => {
  return NETWORKS.mainnet.programId.toString() !== '11111111111111111111111111111111';
};

export const isMainnetMilkConfigured = (): boolean => {
  return NETWORKS.mainnet.milkMint.toString() !== '11111111111111111111111111111111';
};

// Get default network based on mainnet configuration
export const getDefaultNetwork = (): NetworkType => {
  return (isMainnetConfigured() && isMainnetMilkConfigured()) ? 'mainnet' : 'devnet';
};

// Get available networks based on configuration
export const getAvailableNetworks = (): NetworkType[] => {
  return (isMainnetConfigured() && isMainnetMilkConfigured()) ? ['mainnet', 'devnet'] : ['devnet'];
};

export const GAME_CONFIG = {
  // Economic constants matching smart contract
  COW_BASE_PRICE: 6000, // 6,000 MILK base price
  PRICE_PIVOT: 2500.0, // C_pivot for pricing curve
  PRICE_STEEPNESS: 2.5, // α for pricing curve
  REWARD_BASE: 25000, // 25,000 MILK base reward per day
  REWARD_SENSITIVITY: 0.5, // α_reward for TVL sensitivity
  TVL_NORMALIZATION: 100000, // 100,000 MILK normalization factor
  MIN_REWARD_PER_DAY: 1000, // 1,000 MILK minimum per cow per day
  GREED_MULTIPLIER: 8.0, // β for early adopter bonus
  GREED_DECAY_PIVOT: 1500.0, // C₀ for greed decay
  INITIAL_TVL: 100000000000, // 100M MILK initial TVL (with 6 decimals)
  MAX_HALVING_PERIODS: 10, // Maximum halving periods (legacy)
  MIN_REWARD_RATE: 10, // Minimum reward rate (legacy display)
  MAX_COWS_PER_TRANSACTION: 50, // Maximum cows per buy transaction
  MILK_DECIMALS: 6,
  COW_DECIMALS: 6, // COW tokens also have 6 decimals
} as const;

export const SOCIAL_LINKS = {
  twitter: 'https://x.com/i/communities/1962235115448279104',
  github: 'https://github.com/andytoshi/milkerfun',
  tradeMilk: '',
} as const;