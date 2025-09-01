import { PublicKey } from '@solana/web3.js';

export const NETWORKS = {
  devnet: {
    name: 'Devnet',
    rpcUrl: 'https://api.devnet.solana.com',
    programId: new PublicKey('Aknxju7fmwfMMzneFJxqeWSnEeT7fKeo9c8o3fKkaPT8'),
    milkMint: new PublicKey('H5b47NLbNgTAAMpz3rZKAfcoJ2JdGWKcEuEK51ghCbbY'),
    configPda: new PublicKey('bsqQtwEVKNN8RKAgfiRLryk8zBA3t3bMftL3szKNfbQ'),
    poolAuthorityPda: new PublicKey('HAAUNvsDNgLwqXVnvAEfjrdH6iCXBmjWLAMShL2qsn9M'),
    poolTokenAccount: new PublicKey('4j2epXmrbHvb1t8wTHuSpnXWWg1eHyqaQ2iTjJGf9MfN'),
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
  PRICE_PIVOT: 1000.0, // C_pivot for pricing curve
  PRICE_STEEPNESS: 1.0, // α for pricing curve
  REWARD_BASE: 150000, // 150,000 MILK base reward per day
  REWARD_SENSITIVITY: 0.8, // α_reward for TVL sensitivity
  TVL_NORMALIZATION: 50000, // 50,000 MILK normalization factor
  MIN_REWARD_PER_DAY: 10, // 10 MILK minimum per cow per day
  GREED_MULTIPLIER: 5.0, // β for early adopter bonus
  GREED_DECAY_PIVOT: 250.0, // C₀ for greed decay
  INITIAL_TVL: 50000000, // 50M MILK initial TVL
  MAX_HALVING_PERIODS: 10, // Maximum halving periods (legacy)
  MIN_REWARD_RATE: 10, // Minimum reward rate (legacy display)
  MILK_DECIMALS: 6,
} as const;

export const SOCIAL_LINKS = {
  twitter: 'https://x.com/i/communities/1962235115448279104',
  github: 'https://github.com/andytoshi/milkerfun',
  tradeMilk: '',
} as const;