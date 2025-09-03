import { PublicKey } from '@solana/web3.js';

export const NETWORKS = {
  devnet: {
    name: 'Devnet',
    rpcUrl: 'https://api.devnet.solana.com',
    programId: new PublicKey('8zmgozhMKcA5a8YmnZUju59A8qhwCnwrocK9iWLZHoZ3'),
    milkMint: new PublicKey('ErGaHLayDmovrt2ttBrwmrrYyjuaqojABWEuPiYgtZvj'),
    configPda: new PublicKey('2xZqPHEVovbtzBq18NUQHz21f7kuXWmMEcmSQFrC9WHH'),
    poolAuthorityPda: new PublicKey('BrBsT3bw4c4gjRiGCQPRJqVVAgZCazUDFhTN6RhuESp1'),
    poolTokenAccount: new PublicKey('8sB1HGWAcxy3omuosxvxvJxqQBF8tWxYXybELoLKbX6T'),
    explorerUrl: 'https://explorer.solana.com',
  },
  mainnet: {
    name: 'Mainnet',
    rpcUrl: 'https://patient-morning-forest.solana-mainnet.quiknode.pro/e5360c42c26cc7972c3921a997078c86e3e723c2/',
    programId: new PublicKey('11111111111111111111111111111111'),
    milkMint: new PublicKey('11111111111111111111111111111111'),
    configPda: new PublicKey('11111111111111111111111111111111'),
    poolAuthorityPda: new PublicKey('11111111111111111111111111111111'),
    poolTokenAccount: new PublicKey('11111111111111111111111111111111'),
    explorerUrl: 'https://explorer.solana.com',
  }
} as const;

export type NetworkType = keyof typeof NETWORKS;

export const GAME_CONFIG = {
  // Economic constants matching smart contract
  COW_BASE_PRICE: 6000, // 6,000 MILK base price
  PRICE_PIVOT: 3000.0, // C_pivot for pricing curve
  PRICE_STEEPNESS: 1.5, // α for pricing curve
  REWARD_BASE: 25000, // 25,000 MILK base reward per day
  REWARD_SENSITIVITY: 0.5, // α_reward for TVL sensitivity
  TVL_NORMALIZATION: 50000, // 50,000 MILK normalization factor
  MIN_REWARD_PER_DAY: 1000, // 1,000 MILK minimum per cow per day
  GREED_MULTIPLIER: 8.0, // β for early adopter bonus
  GREED_DECAY_PIVOT: 1500.0, // C₀ for greed decay
  INITIAL_TVL: 50000000, // 50M MILK initial TVL
  MAX_HALVING_PERIODS: 10, // Maximum halving periods (legacy)
  MIN_REWARD_RATE: 10, // Minimum reward rate (legacy display)
  MAX_COWS_PER_TRANSACTION: 50, // Maximum cows per buy transaction
  MILK_DECIMALS: 6,
} as const;

export const SOCIAL_LINKS = {
  twitter: 'https://x.com/i/communities/1962235115448279104',
  github: 'https://github.com/andytoshi/milkerfun',
  tradeMilk: '',
} as const;