import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { ComputeHero } from "@/components/stats/ComputeHero";
import { StatSection } from "@/components/stats/StatSection";
import { EconomyCards } from "@/components/stats/EconomyCards";
import { UptimeBar } from "@/components/stats/UptimeBar";
import { StatsFooter } from "@/components/stats/StatsFooter";
import { MOCK_DASHBOARD_STATS } from "@/lib/constants/stats";

export const metadata: Metadata = {
  title: "Network Stats — Orvix",
  description: "Live network statistics for the Orvix decentralized AI compute network.",
};

export default function StatsPage() {
  return (
    <div className="asentum-page min-h-screen bg-[#030303] text-white">
      <Header />

      <main className="pb-8 pt-6">
        <ComputeHero data={MOCK_DASHBOARD_STATS.computeHero} />

        <StatSection title="LIVE NETWORK" stats={MOCK_DASHBOARD_STATS.liveNetwork} columns={4} />

        <EconomyCards mockStats={MOCK_DASHBOARD_STATS.economy} />

        <StatSection title="AI ACTIVITY" stats={MOCK_DASHBOARD_STATS.aiActivity} columns={3} />

        <UptimeBar
          uptime={MOCK_DASHBOARD_STATS.uptime.uptime}
          lastUpdated={MOCK_DASHBOARD_STATS.uptime.lastUpdated}
        />
      </main>

      <StatsFooter />
    </div>
  );
}
