"use client";

import { useCallback, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import bs58 from "bs58";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { setAuth, clearAuth } from "@/lib/store/slices/authSlice";
import { useLazyGetChallengeQuery, useVerifySignatureMutation } from "@/lib/store/api/authApi";
import { decodeJwtExpiry, saveAuth, clearStoredAuth } from "@/lib/auth/storage";

const HOUR_MS = 60 * 60 * 1000;

export function useAuth() {
  const dispatch = useAppDispatch();
  const { token, user, expiresAt } = useAppSelector((s) => s.auth);
  const { publicKey, signMessage, disconnect } = useWallet();

  const [triggerChallenge] = useLazyGetChallengeQuery();
  const [verify] = useVerifySignatureMutation();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isAuthenticated = Boolean(token) && (expiresAt == null || expiresAt > Date.now());

  const login = useCallback(async () => {
    setError(null);
    if (!publicKey) {
      setError("Connect a wallet first.");
      return false;
    }
    if (!signMessage) {
      setError("This wallet does not support message signing.");
      return false;
    }

    setIsLoading(true);
    try {
      const wallet = publicKey.toBase58();
      const challenge = await triggerChallenge(wallet).unwrap();
      const signatureBytes = await signMessage(new TextEncoder().encode(challenge.message));
      const signature = bs58.encode(signatureBytes);

      const { token: jwt, user: me } = await verify({
        wallet,
        message: challenge.message,
        signature,
      }).unwrap();

      const exp = decodeJwtExpiry(jwt) ?? Date.now() + HOUR_MS;
      dispatch(setAuth({ token: jwt, user: me, expiresAt: exp }));
      saveAuth({ token: jwt, user: me, expiresAt: exp });
      return true;
    } catch (err) {
      // Wallet rejection, network error, or bad signature.
      const msg =
        err && typeof err === "object" && "message" in err
          ? String((err as { message: unknown }).message)
          : "Sign-in failed. Please try again.";
      setError(msg.includes("User rejected") ? "Signature request rejected." : msg);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [publicKey, signMessage, triggerChallenge, verify, dispatch]);

  const logout = useCallback(async () => {
    dispatch(clearAuth());
    clearStoredAuth();
    setError(null);
    try {
      await disconnect();
    } catch {
      /* already disconnected */
    }
  }, [dispatch, disconnect]);

  return { token, user, isAuthenticated, isLoading, error, login, logout };
}
