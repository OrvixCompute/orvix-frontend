/**
 * API types — mirror the Orvix Orchestrator OpenAPI schema (v0.2.0).
 * Monetary/numeric fields arrive as strings to preserve precision.
 */

/** Authenticated user — POST /v1/auth/me, and the `user` in a verify response. */
export interface User {
  id: string;
  wallet: string;
  tier: string;
  balance_usdc: string;
  /**
   * Whether this account has registered as a provider.
   *
   * Read it from the `getMe` query rather than the persisted `auth.user`: the
   * session blob in localStorage is written at login and predates this field,
   * so a provider who logged in before it shipped carries a copy without it —
   * which reads as false and would tell a real provider they are not one.
   */
  is_provider: boolean;
}

/** GET /v1/auth/challenge?wallet= */
export interface ChallengeResponse {
  message: string;
  nonce: string;
  expires_at: string;
}

/** POST /v1/auth/verify */
export interface VerifyResponse {
  token: string;
  user: User;
}

/** GET /v1/billing/balance */
export interface BalanceResponse {
  balance_usdc: string;
  tier: string;
}

export interface NextTierInfo {
  name: string;
  required_stake: string;
  additional_needed: string;
}

/** GET /v1/account/tier */
export interface TierResponse {
  tier: string;
  staked_orvx: string;
  discount_pct: number;
  next_tier: NextTierInfo | null;
}

/** GET /v1/billing/transactions */
export interface TransactionInfo {
  id: string;
  type: string;
  amount: string;
  token: string;
  solana_signature: string | null;
  status: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

/** A single chat turn — POST /v1/chat/completions (OpenAI-compatible). */
export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

/** POST /v1/billing/topup-intent */
export interface TopupIntentRequest {
  /** Optional expected USDC amount; string preserves precision. */
  expected_amount?: string | null;
}

/**
 * POST /v1/billing/topup-intent response. The user transfers USDC to
 * `treasury_address` and MUST attach `memo` so the deposit is credited.
 */
export interface TopupIntentResponse {
  id: string;
  treasury_address: string;
  memo: string;
  expected_amount: string | null;
  expires_at: string;
  /** Encoded payload (e.g. a Solana Pay URL) to render as a QR code. */
  qr_data: string;
}

/** GET /v1/billing/topup-intents — the user's pending, non-expired intents. */
export interface TopupIntentInfo {
  id: string;
  memo: string;
  expected_amount: string | null;
  status: string;
  expires_at: string;
  created_at: string;
}

/** GET /v1/api-keys */
export interface ApiKeyInfo {
  id: string;
  prefix: string;
  name: string;
  is_active: boolean;
  last_used_at: string | null;
  created_at: string;
}

/** POST /v1/api-keys */
export interface CreateApiKeyRequest {
  name: string;
}

/**
 * POST /v1/api-keys and POST /v1/api-keys/{id}/rotate.
 * `key` is the full secret — returned ONCE and never retrievable again.
 */
export interface CreateApiKeyResponse {
  id: string;
  key: string;
  prefix: string;
  name: string;
  created_at: string;
}

/** A single entry in a user's staking history (GET /v1/staking/status). */
export interface StakeHistoryItem {
  type: string;
  amount: string;
  reason: string | null;
  created_at: string;
}

/** GET /v1/staking/status */
export interface StakingStatusResponse {
  staked_orvx: string;
  stake_locked_until: string | null;
  tier: string;
  next_tier: NextTierInfo | null;
  history: StakeHistoryItem[];
}

/** POST /v1/staking/stake-intent */
export interface StakeIntentRequest {
  amount: string;
}

/** Stake deposit details — same memo/QR pattern as a top-up intent. */
export interface StakeIntentResponse {
  intent_id: string;
  treasury_address: string;
  memo: string;
  amount: string;
  expires_at: string;
  qr_data: string;
}

/** POST /v1/staking/unstake */
export interface UnstakeRequest {
  amount: string;
  /** Defaults to the user's own wallet when omitted. */
  destination_wallet?: string | null;
}

export interface UnstakeResponse {
  withdrawal_id: string;
  status: string;
  amount: string;
}

/** GET /v1/staking/buyback-history */
export interface BuybackEventInfo {
  usdc_spent: string;
  orvx_received: string;
  price: string;
  solana_signature: string;
  created_at: string;
}

/** GET /v1/staking/burn-history */
export interface BurnEventInfo {
  orvx_burned: string;
  solana_signature: string;
  period_start: string;
  period_end: string;
  created_at: string;
}

/**
 * Image generation quota for the current account (part of GET /v1/account/quota).
 * `type` is "grace" during the grace period (everyone gets a small daily
 * allowance) or "holder_daily" once holder-gating is active (≥10k ORVX).
 */
export interface ImageQuota {
  type: string;
  daily_limit: number;
  used_today: number;
  /** ISO timestamp when the daily counter resets, when the backend provides it. */
  reset_at?: string | null;
}

/** Free chat allowance for non-holders (part of GET /v1/account/quota). */
export interface ChatQuota {
  type?: string;
  limit?: number;
  used?: number;
  remaining?: number;
}

/** GET /v1/account/quota — image (and chat) usage for the current account. */
export interface QuotaResponse {
  is_holder: boolean;
  orvx_balance?: string | number;
  image: ImageQuota;
  chat?: ChatQuota;
}

/** GET /v1/governance/snapshot-url — off-chain governance lives on Snapshot. */
export interface GovernanceSnapshot {
  space: string;
  url: string;
}

/** GET /v1/staking/network-stats */
export interface NetworkStats {
  total_staked: string;
  total_providers: number;
  buyback_budget_usdc: string;
  orvx_held_for_burn: string;
  total_orvx_burned: string;
  total_orvx_bought: string;
  last_buyback_at: string | null;
  last_burn_at: string | null;
}

/** GET /v1/network/stats — node counts, GPU inventory and inference activity. */
export interface ComputeNodeStats {
  registered: number;
  online: number;
  ready: number;
  busy: number;
  draining: number;
  offline: number;
  chat_capable: number;
  image_capable: number;
  /** Postgres numeric — arrives as a string, parse before formatting. */
  total_vram_gb: string;
}

export interface ComputeGpuStats {
  gpu_model: string;
  count: number;
}

export interface ComputeProviderStats {
  total: number;
  staked: number;
}

export interface ComputeChatStats {
  requests_total: number;
  requests_window: number;
  tokens_total: number;
  tokens_window: number;
  /** Null when no chat request landed inside the window. */
  avg_latency_ms: number | null;
}

export interface ComputeImageStats {
  generated_total: number;
  generated_window: number;
}

export interface ComputeModelStats {
  chat: number;
  image: number;
}

/**
 * Compute-side network statistics. `*_window` fields cover the last
 * `window_hours`; `*_total` fields are all time. Mock jobs are excluded.
 */
export interface ComputeStats {
  window_hours: number;
  nodes: ComputeNodeStats;
  gpus: ComputeGpuStats[];
  providers: ComputeProviderStats;
  chat: ComputeChatStats;
  images: ComputeImageStats;
  models: ComputeModelStats;
  generated_at: string;
}
