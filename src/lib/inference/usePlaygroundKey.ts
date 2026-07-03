"use client";

import { useAppSelector } from "@/lib/store/hooks";
import { useCreateKeyMutation } from "@/lib/store/api/apiKeysApi";
import { loadPlaygroundKey, savePlaygroundKey, clearPlaygroundKey } from "./playgroundKey";

/**
 * Shared access to the wallet's cached "Playground" API key, used by both the
 * chat and image playground panels. Inference authenticates with an Orvix API
 * key (orvx_sk_…), not the wallet JWT, so we mint a dedicated key on first use
 * and cache it locally (keyed by wallet). `forceNew` mints a fresh one after a
 * key is rejected (401).
 */
export function usePlaygroundKey() {
  const wallet = useAppSelector((s) => s.auth.user?.wallet ?? null);
  const [createKey] = useCreateKeyMutation();

  const ensureApiKey = async (forceNew = false): Promise<string> => {
    if (!wallet) throw new Error("Connect your wallet to run inference.");
    if (!forceNew) {
      const cached = loadPlaygroundKey(wallet);
      if (cached) return cached;
    }
    const created = await createKey({ name: "Playground" }).unwrap();
    savePlaygroundKey(wallet, created.key);
    return created.key;
  };

  const forgetKey = () => {
    if (wallet) clearPlaygroundKey(wallet);
  };

  return { wallet, ensureApiKey, forgetKey };
}
