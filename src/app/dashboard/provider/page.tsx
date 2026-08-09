"use client";

import { useMemo } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { ProviderAccessCard } from "@/components/dashboard/provider/ProviderAccessCard";
import { NodesPanel } from "@/components/dashboard/provider/NodesPanel";
import { EarningsPanel } from "@/components/dashboard/provider/EarningsPanel";
import { useGetEarningsQuery, useListNodesQuery } from "@/lib/store/api/providerApi";
import { parseNumeric } from "@/lib/utils/format";
import { routes } from "@/lib/constants/routes";

/**
 * Provider dashboard — credentials, machines, and getting paid.
 *
 * On knowing whether the account is a provider: it cannot be read directly.
 * `is_provider` lives on the user row but /v1/auth/me does not return it, and
 * the only endpoint gated on it is POST /withdraw, which has side effects and
 * so cannot be probed. The flag below is therefore inferred from evidence —
 * nodes, earnings — and used only to choose wording and which button leads.
 * Every action on the page works regardless, and the one place the answer
 * really matters (withdraw) gets it authoritatively from the server as a
 * 403 not_a_provider, which routes the user back to the register card.
 */
export default function ProviderPage() {
  const { data: nodes } = useListNodesQuery();
  const { data: earnings } = useGetEarningsQuery();

  const registered = useMemo(() => {
    if (nodes && nodes.length > 0) return true;
    const totals = [
      earnings?.total_lifetime_usdc,
      earnings?.available_to_withdraw,
      earnings?.pending_withdrawal,
    ];
    return totals.some((value) => (parseNumeric(value) ?? 0) > 0);
  }, [nodes, earnings]);

  // The withdraw dialog calls this when the server says otherwise, so the
  // register card is where the user lands rather than a dead end.
  const focusAccessCard = () => {
    document.getElementById("provider-access")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="space-y-10">
      <PageHeader
        title="Provider"
        subtitle="Connect a GPU, serve inference, and get paid in USDC for every job it completes."
        actions={
          <Link
            href={routes.providers}
            className="inline-flex items-center gap-1.5 text-sm text-text-secondary transition-colors hover:text-text-primary"
          >
            Provider guide <ArrowRight size={14} />
          </Link>
        }
      />

      <div id="provider-access" className="scroll-mt-24">
        <ProviderAccessCard registered={registered} />
      </div>

      <NodesPanel registered={registered} />

      <EarningsPanel onRegisterNeeded={focusAccessCard} />
    </div>
  );
}
