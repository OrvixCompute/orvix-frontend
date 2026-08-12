import { savePlaygroundKey } from "@/lib/inference/playgroundKey";
import { TEST_USER } from "./renderWithStore";
import type { Routes } from "./stubHttp";
import type { QuotaResponse } from "@/lib/types/orvix";

export const PLAYGROUND_KEY = "orvx_sk_playground";

/**
 * Seed the wallet's cached playground key.
 *
 * Without it the panel mints one on first use, which is a real POST /v1/api-keys
 * — fine, and worth testing once, but noise in every other test. This writes
 * through the same helper the app reads with, so the cache path is genuine.
 */
export function seedPlaygroundKey(wallet: string = TEST_USER.wallet): void {
  savePlaygroundKey(wallet, PLAYGROUND_KEY);
}

export function clearPlaygroundStorage(): void {
  window.localStorage.clear();
}

/** GET /v1/account/quota, defaulted to the allowance every account gets today. */
export function quota(overrides: Partial<QuotaResponse> = {}): QuotaResponse {
  return {
    is_holder: false,
    orvx_balance: "0",
    image: { type: "grace_daily", daily_limit: 50, used_today: 0 },
    ...overrides,
  } as QuotaResponse;
}

/** GET /v1/models, defaulted to the live catalog: chat + image, no video. */
export function modelsCatalog(overrides: { withVideo?: boolean; videoAvailable?: boolean } = {}) {
  const { withVideo = false, videoAvailable = true } = overrides;
  const data = [
    { id: "qwen-2.5-7b", object: "model", owned_by: "orvix", available: true },
    { id: "orvix-image-1", object: "model", owned_by: "orvix", available: true },
  ];
  if (withVideo) {
    data.push({
      id: "orvix-video-1",
      object: "model",
      owned_by: "orvix",
      available: videoAvailable,
    });
  }
  return { body: { object: "list", data } };
}

/** POST /v1/images/generations success, with the quota headers the API sends. */
export function imageSuccess(url = "https://orvix.network/images/abc.png") {
  return {
    body: { created: 1_754_700_000, data: [{ url }] },
    headers: {
      "X-Orvix-Quota-Remaining": "49",
      "X-Orvix-Quota-Reset": new Date(Date.now() + 3_600_000).toISOString(),
    },
  };
}

/** The routes a playground test needs before it declares anything specific. */
export function playgroundRoutes(extra: Routes = {}): Routes {
  return {
    "GET /v1/models": modelsCatalog(),
    "GET /v1/account/quota": { body: quota() },
    ...extra,
  };
}
