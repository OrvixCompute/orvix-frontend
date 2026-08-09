/**
 * Provider API types — mirror /v1/provider/*.
 *
 * Every monetary field arrives as a string on purpose: provider earnings are
 * currently in the millionths of a USDC, and a JSON number would round them
 * away. Parse with `parseNumeric` before doing arithmetic, and render with
 * `formatUsdcAmount` — never `toFixed(2)`, which turns real income into 0.00.
 */

/** An entry from GET /v1/provider/nodes. */
export interface ProviderNode {
  id: string;
  /** Null until the provider renames it. */
  name: string | null;
  /** Last status the node persisted. Not a liveness signal — see is_connected. */
  status: string;
  gpu_model: string | null;
  vram_mb: number | null;
  models_supported: string[] | null;
  total_jobs: number;
  total_earned_usdc: string;
  reputation_score: number;
  /**
   * NOT liveness. Written once at registration and never updated afterwards, so
   * a node that has been healthy all day still reports an old timestamp. Never
   * label this "last seen" and never drive a status indicator from it.
   */
  last_heartbeat: string | null;
  created_at: string | null;
  /**
   * The live truth: the orchestrator's in-memory WebSocket registry. Anything
   * that stops heartbeating is dropped from it within 60 seconds.
   */
  is_connected: boolean;
}

/** Live metrics on a node detail. Null whenever the node is disconnected. */
export interface NodeCurrentMetrics {
  current_jobs: number;
  status: string;
  gpu_info: Record<string, unknown> | null;
}

/** A row of `recent_jobs` on a node detail. */
export interface ProviderJob {
  id: string;
  model: string | null;
  prompt_tokens: number | null;
  completion_tokens: number | null;
  cost_usdc: string | null;
  provider_earning_usdc: string | null;
  status: string | null;
  created_at: string | null;
}

/**
 * One day of earnings. The API only emits days that had jobs, so a series is
 * sparse — expand it with `fillDailySeries` before charting.
 */
export interface EarningsDay {
  /** YYYY-MM-DD, UTC. */
  date: string;
  amount: string;
  jobs_count: number;
}

/** GET /v1/provider/nodes/{id} — the list entry plus live and historical detail. */
export interface ProviderNodeDetail extends Omit<ProviderNode, "last_heartbeat" | "created_at"> {
  current_metrics: NodeCurrentMetrics | null;
  recent_jobs: ProviderJob[];
  earnings_by_day: EarningsDay[];
}

/**
 * POST /v1/provider/register and /regenerate-secret.
 * `node_secret` is stored only as a hash, so this response is the one and only
 * time it exists in readable form.
 */
export interface ProviderSecret {
  provider_id: string;
  node_secret: string;
}

/** GET /v1/provider/earnings. */
export interface ProviderEarnings {
  total_lifetime_usdc: string;
  /**
   * The only withdrawable figure — credited from completed jobs. Distinct from
   * the user's `balance_usdc`, which is topped-up spending money for buying
   * inference and can never be paid out.
   */
  available_to_withdraw: string;
  pending_withdrawal: string;
  last_payout_at: string | null;
  earnings_by_day: EarningsDay[];
}

/** POST /v1/provider/withdraw request body. `destination_wallet` defaults to the account wallet. */
export interface WithdrawRequest {
  amount: number;
  destination_wallet?: string;
}

export interface WithdrawResponse {
  withdrawal_id: string;
  status: string;
  /**
   * What actually happens next, derived per request — the payout worker's own
   * interval on the automatic path, or a statement that no automatic payout
   * will be attempted on the manual one. Safe to render; it is no longer the
   * fixed "< 1 hour" string it used to be.
   */
  estimated_completion: string;
  /**
   * True above AUTO_APPROVE_MAX_USDC. There is no approval endpoint, so such a
   * withdrawal waits on an operator — it must not be shown as if a payout were
   * already on its way.
   */
  requires_manual_approval: boolean;
}

/** A row from GET /v1/provider/withdrawals. The amount column is `amount`. */
export interface WithdrawalRecord {
  id: string;
  amount: string | number;
  destination_wallet: string | null;
  status: string;
  queued_at: string | null;
  processed_at: string | null;
  solana_signature: string | null;
  /**
   * Why a `failed` withdrawal failed. A payout that dies before broadcast — an
   * empty payout wallet, say — is refunded in full and marked failed, so the
   * balance is intact and this line is the only explanation the provider gets.
   */
  error_message: string | null;
  metadata: { asset?: string; manual_approval_required?: boolean } | null;
}
