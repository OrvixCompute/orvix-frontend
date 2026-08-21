"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Loader2, Search, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils/cn";
import { useAppSelector } from "@/lib/store/hooks";
import { config } from "@/lib/constants/config";
import { IntelOverview } from "@/components/dashboard/playground/IntelOverview";
import { IntelSocial } from "@/components/dashboard/playground/IntelSocial";
import { IntelHolders } from "@/components/dashboard/playground/IntelHolders";
import { IntelBuyers } from "@/components/dashboard/playground/IntelBuyers";
import { IntelAI } from "@/components/dashboard/playground/IntelAI";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface TokenScan {
  mint: string;
  metadata: { name: string | null; symbol: string | null; uri: string | null } | null;
  supply: { amount: string; decimals: number; ui_amount_string: string | null } | null;
  price_usdc: number | null;
  liquidity: { estimated_usdc: number | null; pool_count: number };
  holders: {
    total_holders: number | null;
    top_holders: Array<{ wallet: string; balance: number }>;
    top10_share: number | null;
  } | null;
  risk: { warnings: string[] };
  scanned_at: string;
}

export interface Accumulation {
  mint: string;
  score: number;
  label: "distribution" | "weak" | "moderate" | "strong";
  metrics: {
    watchlist_wallets: number;
    inflow_7d: number;
    inflow_ratio: number | null;
    buy_tx_7d: number;
    top10_share: number | null;
    distribution_score: number;
    inflow_score: number;
    activity_score: number;
  };
  computed_at: string;
}

export interface Holders {
  total_holders: number;
  top_holders: Array<{ wallet: string; token_account: string; balance: number }>;
  top10_share: number | null;
  as_of: string;
  source: string;
}

export type EarlyBuyer = {
  wallet: string;
  amount: number;
  signature: string;
  block_time: number | null;
};

export interface SocialAnalysis {
  mint: string;
  social_links: {
    twitter: string | null;
    website: string | null;
    telegram: string | null;
    discord: string | null;
  };
  social_score: number;
  metrics: {
    dex_trending: boolean;
    dex_volume_24h: number | null;
    dex_price_change_24h: number | null;
    twitter_followers: number | null;
    twitter_statuses_7d: number | null;
    social_sentiment: "positive" | "neutral" | "negative" | null;
  };
  as_of: string;
}

export interface ClusterAnalysis {
  mint: string;
  clusters: Array<{
    id: string;
    wallets: string[];
    signals: Array<"shared_funding" | "coordinated_timing" | "overlapping_holdings">;
    confidence: number;
  }>;
  total_wallets_analyzed: number;
  as_of: string;
}

export interface Intelligence {
  mint: string;
  model: string;
  analysis: { narrative: string; risk_flags: string[]; watch_next: string };
  generated_at: string;
  latency_ms: number;
  node_id: string;
}

export interface IntelData {
  scan: TokenScan | null;
  accumulation: Accumulation | null;
  holders: Holders | null;
  earlyBuyers: EarlyBuyer[] | null;
  social: SocialAnalysis | null;
  clusters: ClusterAnalysis | null;
  intelligence: Intelligence | null;
}

/* ------------------------------------------------------------------ */
/*  Sub-tab definitions                                                */
/* ------------------------------------------------------------------ */

type SubTab = "overview" | "social" | "holders" | "buyers" | "ai";

const SUB_TABS: { id: SubTab; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "social", label: "Social" },
  { id: "holders", label: "Holders" },
  { id: "buyers", label: "Early Buyers" },
  { id: "ai", label: "AI Intelligence" },
];

/* ------------------------------------------------------------------ */
/*  Example CAs                                                        */
/* ------------------------------------------------------------------ */

const EXAMPLE_CAS = [
  "So11111111111111111111111111111111111111112",
  "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
  "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function TokenIntel() {
  const token = useAppSelector((s) => s.auth.token);
  const apiUrl = config.apiUrl;

  const [ca, setCa] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<SubTab>("overview");
  const [data, setData] = useState<IntelData | null>(null);
  const [recent, setRecent] = useState<string[]>([]);

  // Read ?ca= from URL on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const caParam = params.get("ca");
    if (caParam) {
      setCa(caParam);
      // Auto-analyze if token is present
      if (token) {
        void analyze(caParam);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateUrl = (address: string) => {
    const params = new URLSearchParams(window.location.search);
    if (address) params.set("ca", address);
    else params.delete("ca");
    const qs = params.toString();
    window.history.replaceState(null, "", qs ? `?${qs}` : window.location.pathname);
  };

  const analyze = async (address?: string) => {
    const target = (address ?? ca).trim();
    if (!target || !token) return;

    setLoading(true);
    setError(null);
    setData(null);

    const headers = { Authorization: `Bearer ${token}` };

    try {
      const [scanRes, accRes, holdersRes, buyersRes, socialRes, clustersRes, intelRes] =
        await Promise.allSettled([
          fetch(`${apiUrl}/v1/tokens/${target}`, { headers }),
          fetch(`${apiUrl}/v1/tokens/${target}/accumulation`, { headers }),
          fetch(`${apiUrl}/v1/tokens/${target}/holders`, { headers }),
          fetch(`${apiUrl}/v1/tokens/${target}/early-buyers`, { headers }),
          fetch(`${apiUrl}/v1/tokens/${target}/social`, { headers }),
          fetch(`${apiUrl}/v1/tokens/${target}/clusters`, { headers }),
          fetch(`${apiUrl}/v1/tokens/${target}/intelligence`, { headers }),
        ]);

      const unwrap = async <T,>(r: PromiseSettledResult<Response>): Promise<T | null> => {
        if (r.status === "rejected") return null;
        if (!r.value.ok) return null;
        try {
          return (await r.value.json()) as T;
        } catch {
          return null;
        }
      };

      const result: IntelData = {
        scan: await unwrap<TokenScan>(scanRes),
        accumulation: await unwrap<Accumulation>(accRes),
        holders: await unwrap<Holders>(holdersRes),
        earlyBuyers: await unwrap<EarlyBuyer[]>(buyersRes),
        social: await unwrap<SocialAnalysis>(socialRes),
        clusters: await unwrap<ClusterAnalysis>(clustersRes),
        intelligence: await unwrap<Intelligence>(intelRes),
      };

      // Check if all failed
      const anySuccess = Object.values(result).some((v) => v !== null);
      if (!anySuccess) {
        setError("All requests failed. Check the token address and try again.");
      } else {
        setData(result);
        updateUrl(target);
        setRecent((prev) => [target, ...prev.filter((c) => c !== target)].slice(0, 5));
      }
    } catch (e) {
      setError((e as Error).message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void analyze();
  };

  const clear = () => {
    setCa("");
    setData(null);
    setError(null);
    updateUrl("");
  };

  return (
    <div className="space-y-6">
      {/* Input section */}
      <form onSubmit={onSubmit} className="space-y-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={ca}
              onChange={(e) => setCa(e.target.value)}
              placeholder="Paste a token CA..."
              className={cn(
                "w-full rounded-md border border-border bg-bg-tertiary px-3 py-2 pr-8 text-sm font-mono text-text-primary",
                "focus:border-accent focus:outline-none",
                "disabled:cursor-not-allowed disabled:opacity-50",
              )}
              disabled={loading}
            />
            {ca && (
              <button
                type="button"
                onClick={clear}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary"
              >
                <X size={14} />
              </button>
            )}
          </div>
          <Button variant="primary" type="submit" disabled={!ca.trim() || !token || loading}>
            {loading ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Search size={14} />
            )}
            Analyze
          </Button>
        </div>

        {!token && (
          <p className="text-xs text-text-tertiary">Connect your wallet to analyze tokens.</p>
        )}

        {/* Example CAs */}
        {!data && !loading && (
          <div className="space-y-2">
            <div className="text-[11px] text-text-muted">Try an example</div>
            <div className="flex flex-wrap gap-1.5">
              {EXAMPLE_CAS.map((example) => (
                <button
                  key={example}
                  type="button"
                  disabled={!token}
                  onClick={() => {
                    setCa(example);
                    void analyze(example);
                  }}
                  className={cn(
                    "max-w-[200px] truncate rounded-full border border-border bg-bg-secondary px-3 py-1",
                    "font-mono text-xs text-text-secondary hover:border-border-strong hover:text-text-primary",
                    "disabled:cursor-not-allowed disabled:opacity-50",
                  )}
                >
                  {example.slice(0, 8)}...{example.slice(-6)}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Recent searches */}
        {recent.length > 0 && !loading && (
          <div className="space-y-2 border-t border-dashed border-border pt-3">
            <div className="text-[11px] text-text-muted">Recent</div>
            <div className="flex flex-wrap gap-1.5">
              {recent.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => {
                    setCa(r);
                    void analyze(r);
                  }}
                  className={cn(
                    "max-w-[200px] truncate rounded-full border border-border bg-bg-secondary px-3 py-1",
                    "font-mono text-xs text-text-secondary hover:border-border-strong hover:text-text-primary",
                  )}
                >
                  {r.slice(0, 8)}...{r.slice(-6)}
                </button>
              ))}
            </div>
          </div>
        )}
      </form>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-2 rounded-md border border-danger/30 bg-danger/5 p-3">
          <AlertTriangle size={16} className="mt-0.5 shrink-0 text-danger" />
          <p className="text-xs text-text-secondary">{error}</p>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
          <Loader2 size={22} className="animate-spin text-accent" />
          <p className="text-sm text-text-secondary">Analyzing token...</p>
        </div>
      )}

      {/* Results */}
      {data && !loading && (
        <div className="space-y-6">
          {/* Sub-tabs */}
          <div
            className="flex gap-1 overflow-x-auto pb-1 scrollbar-none"
            role="tablist"
          >
            {SUB_TABS.map((tab) => {
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                    "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-border-strong",
                    active
                      ? "bg-bg-tertiary text-text-primary"
                      : "text-text-secondary hover:text-text-primary",
                  )}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Sub-tab content */}
          {activeTab === "overview" && <IntelOverview data={data} />}
          {activeTab === "social" && <IntelSocial data={data} />}
          {activeTab === "holders" && <IntelHolders data={data} />}
          {activeTab === "buyers" && <IntelBuyers data={data} />}
          {activeTab === "ai" && <IntelAI data={data} />}
        </div>
      )}

      {/* Empty state */}
      {!data && !loading && !error && (
        <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-dashed border-border-strong bg-bg-tertiary">
            <Search size={22} className="text-text-muted" />
          </div>
          <div className="space-y-1">
            <p className="text-sm text-text-tertiary">
              Paste a Solana token contract address to get started
            </p>
            <p className="text-xs text-text-muted">
              View token intelligence, holder analysis, social metrics, and AI insights
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
