import type { User } from "@/lib/types/orvix";

const STORAGE_KEY = "orvix.auth";

export interface StoredAuth {
  token: string;
  user: User;
  expiresAt: number | null;
}

/** Decode a JWT's `exp` claim (seconds) into epoch millis. Null if absent/unparseable. */
export function decodeJwtExpiry(token: string): number | null {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    const json = JSON.parse(
      atob(payload.replace(/-/g, "+").replace(/_/g, "/")),
    ) as { exp?: number };
    return typeof json.exp === "number" ? json.exp * 1000 : null;
  } catch {
    return null;
  }
}

export function saveAuth(auth: StoredAuth): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(auth));
  } catch {
    /* storage unavailable — non-fatal */
  }
}

/** Load persisted auth, returning null if missing or expired. */
export function loadAuth(): StoredAuth | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const auth = JSON.parse(raw) as StoredAuth;
    if (auth.expiresAt && auth.expiresAt <= Date.now()) {
      clearStoredAuth();
      return null;
    }
    return auth;
  } catch {
    return null;
  }
}

export function clearStoredAuth(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* non-fatal */
  }
}
