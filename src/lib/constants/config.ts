/** Runtime configuration sourced from public env vars (see .env.local.example). */
export const config = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL ?? "http://187.127.118.174",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "http://187.127.118.174:3000",
  solanaNetwork: process.env.NEXT_PUBLIC_SOLANA_NETWORK ?? "mainnet-beta",
  solanaRpc: process.env.NEXT_PUBLIC_SOLANA_RPC ?? "https://api.mainnet-beta.solana.com",
  orvxMint: process.env.NEXT_PUBLIC_ORVX_MINT ?? "",
  treasuryAddress: process.env.NEXT_PUBLIC_TREASURY_ADDRESS ?? "",
  usdcMint:
    process.env.NEXT_PUBLIC_USDC_MINT ?? "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
  incinerator:
    process.env.NEXT_PUBLIC_INCINERATOR ?? "1nc1nerator11111111111111111111111111111111",
} as const;
