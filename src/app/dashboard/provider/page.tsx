"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { ProviderAccessCard } from "@/components/dashboard/provider/ProviderAccessCard";
import { NodesPanel } from "@/components/dashboard/provider/NodesPanel";
import { EarningsPanel } from "@/components/dashboard/provider/EarningsPanel";
import { useGetMeQuery } from "@/lib/store/api/authApi";
import { routes } from "@/lib/constants/routes";

/**
 * Provider dashboard — credentials, machines, and getting paid.
 *
 * Provider status comes from `is_provider` on GET /v1/auth/me. It is read from
 * the query rather than the persisted `auth.user`, because that session blob is
 * written at login: anyone who signed in before the field shipped has a stored
 * copy without it, and a missing flag reads as false — telling an actual
 * provider they are not one.
 *
 * Registering invalidates the User tag, so the flag flips as soon as the
 * mutation lands without a re-login.
 */
export default function ProviderPage() {
  const { data: me, isLoading: statusLoading } = useGetMeQuery();
  const registered = me?.is_provider ?? false;

  // The withdraw dialog calls this if the server disagrees — 403 not_a_provider
  // stays the authoritative answer, and lands the user on the register card
  // rather than at a dead end.
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
        <ProviderAccessCard registered={registered} statusLoading={statusLoading} />
      </div>

      <NodesPanel registered={registered} />

      <EarningsPanel onRegisterNeeded={focusAccessCard} />
    </div>
  );
}
