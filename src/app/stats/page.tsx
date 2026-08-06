import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { StatsDashboard } from "@/components/stats/StatsDashboard";
import { StatsFooter } from "@/components/stats/StatsFooter";

export const metadata: Metadata = {
  title: "Network Stats — Orvix",
  description: "Live network statistics for the Orvix decentralized AI compute network.",
};

export default function StatsPage() {
  return (
    <div className="asentum-page min-h-screen bg-[#030303] text-white">
      <Header />

      <main className="pb-8 pt-6">
        <StatsDashboard />
      </main>

      <StatsFooter />
    </div>
  );
}
