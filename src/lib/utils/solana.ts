/** Truncate a base58 address for display: 5tzF...uAi9 */
export function truncateAddress(address: string | null | undefined, chars = 4): string {
  if (!address) return "";
  if (address.length <= chars * 2 + 1) return address;
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

/** Solscan transaction URL for the given signature, cluster-aware. */
export function explorerTxUrl(signature: string, network = "mainnet-beta"): string {
  const base = `https://solscan.io/tx/${signature}`;
  return network === "mainnet-beta" ? base : `${base}?cluster=${network}`;
}
