import type { Metadata } from "next";
import { PublicShell, PageIntro } from "@/components/layout/PublicShell";
import { Card } from "@/components/ui/Card";

export const metadata: Metadata = {
  title: "Status — Orvix",
  description: "Operational status of Orvix network components.",
};

const COMPONENTS = [
  { name: "Orchestrator API", status: "operational" },
  { name: "Inference network", status: "operational" },
  { name: "Billing & settlement", status: "operational" },
  { name: "Dashboard", status: "operational" },
];

export default function StatusPage() {
  return (
    <PublicShell>
      <PageIntro
        eyebrow="status"
        title="System status"
        lead="Current operational status of Orvix components."
      />
      <Card className="divide-y divide-border p-0">
        {COMPONENTS.map((c) => (
          <div key={c.name} className="flex items-center justify-between px-4 py-3 text-sm">
            <span className="text-text-primary">{c.name}</span>
            <span className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-success" />
              <span className="font-mono text-xs capitalize text-text-secondary">{c.status}</span>
            </span>
          </div>
        ))}
      </Card>
    </PublicShell>
  );
}
