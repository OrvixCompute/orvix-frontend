import type { Metadata } from "next";
import { PublicShell } from "@/components/layout/PublicShell";
import { Playground } from "@/components/dashboard/playground/Playground";

export const metadata: Metadata = {
  title: "Playground — Orvix",
  description:
    "Test the Orvix inference API in your browser. Connect a wallet to run requests against the network.",
};

export default function PlaygroundPage() {
  return (
    <PublicShell>
      <div className="py-10">
        <Playground subtitle="Test inference against the network. Connect a wallet to run a request." />
      </div>
    </PublicShell>
  );
}
