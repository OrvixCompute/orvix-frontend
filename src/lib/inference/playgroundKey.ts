// The inference endpoint (POST /v1/chat/completions) authenticates with an
// Orvix API key (orvx_sk_…), not the wallet session JWT. The playground creates
// a dedicated "Playground" key for the connected wallet on first use and reuses
// it afterwards. The plaintext secret is returned only once at creation, so we
// persist it locally (keyed by wallet) rather than re-fetching it.

const PREFIX = "orvix.playground.key.";

/** localStorage key for a wallet's cached playground API key. */
function storageKey(wallet: string): string {
  return `${PREFIX}${wallet}`;
}

export function loadPlaygroundKey(wallet: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(storageKey(wallet));
  } catch {
    return null;
  }
}

export function savePlaygroundKey(wallet: string, key: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(storageKey(wallet), key);
  } catch {
    /* storage unavailable — non-fatal, we'll just recreate next time */
  }
}

export function clearPlaygroundKey(wallet: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(storageKey(wallet));
  } catch {
    /* non-fatal */
  }
}
