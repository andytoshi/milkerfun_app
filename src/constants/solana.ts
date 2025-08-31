import { PublicKey } from '@solana/web3.js';

export const NETWORKS = {
  devnet: {
    name: 'Devnet',
    rpcUrl: 'https://api.devnet.solana.com',
    programId: new PublicKey('F96zBjzPDVyYFdzJAaH8rnkgJuusH3ecEh5Q2U7GffE5'),
    milkMint: new PublicKey('H5b47NLbNgTAAMpz3rZKAfcoJ2JdGWKcEuEK51ghCbbY'),
    configPda: new PublicKey('5tiMmxgKCHrmGd4sVEYaG4FwD2HNpVLHy2W7VUh9FyRo'),
    poolAuthorityPda: new PublicKey('5unQYnYkXNthDYH8MUUD1otRt6sbeoAm2GLAJ9kFbzYo'),
    poolTokenAccount: new PublicKey('6vLghnr8127cdaeeURMSHHgHEeqNnrA7v9aWbf3B8jkw'),
    explorerUrl: 'https://explorer.solana.com',
  },
  // mainnet: {
  //   name: 'Mainnet',
  //   rpcUrl: 'https://patient-morning-forest.solana-mainnet.quiknode.pro/e5360c42c26cc7972c3921a997078c86e3e723c2/',
  //   programId: new PublicKey('11111111111111111111111111111111'),
  //   milkMint: new PublicKey('11111111111111111111111111111111'),
  //   configPda: new PublicKey('11111111111111111111111111111111'),
  //   poolAuthorityPda: new PublicKey('11111111111111111111111111111111'),
  //   poolTokenAccount: new PublicKey('11111111111111111111111111111111'),
  //   explorerUrl: 'https://explorer.solana.com',
  // }
} as const;

export type NetworkType = keyof typeof NETWORKS;

export const GAME_CONFIG = {
  INITIAL_COW_PRICE: 6000, // 6000 MILK
  BASE_REWARD_RATE: 100, // 100 MILK per cow per minute
  HALVING_INTERVAL_DAYS: 10,
  MAX_HALVING_PERIODS: 10,
  MIN_REWARD_RATE: 10, // 10 MILK per cow per minute
  PRICE_ESCALATION_HOURS: 4, // Price doubles every hour for 4 hours
  MAX_PRICE_MULTIPLIER: 16, // 2^4 = 16x after 4 hours
  MILK_DECIMALS: 6,
} as const;

export const SOCIAL_LINKS = {
  twitter: 'https://x.com/milkerfun',
  github: 'https://github.com/andytoshi/milkerfun',
  tradeMilk: 'https://dexscreener.com/solana/11111111111111111111111111111111',
} as const;