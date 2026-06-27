import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface Row {
  model: string;
  input: string;
  output: string;
  vs: string;
}

const ROWS: Row[] = [
  { model: "qwen-2.5-7b", input: "$0.00", output: "$0.00", vs: "17x cheaper" },
  { model: "llama-3-8b", input: "soon", output: "soon", vs: "—" },
];

export function PricingTeaser() {
  return (
    <section className="border-t border-border py-8">
      <h3 className="text-lg font-medium">Pricing</h3>
      <p className="mt-2 max-w-2xl text-text-secondary">
        Up to 17x cheaper than OpenAI. Pay only for what you use, in USDC.
      </p>

      <div className="mt-5 overflow-x-auto">
        <table className="w-full max-w-2xl font-mono text-xs">
          <thead>
            <tr className="text-text-muted">
              <th className="py-2 pr-6 text-left font-normal">model</th>
              <th className="py-2 pr-6 text-left font-normal">input</th>
              <th className="py-2 pr-6 text-left font-normal">output</th>
              <th className="py-2 text-left font-normal">vs OpenAI</th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row) => (
              <tr key={row.model} className="border-t border-border text-text-secondary">
                <td className="py-2 pr-6 text-text-primary">{row.model}</td>
                <td className="py-2 pr-6">{row.input}</td>
                <td className="py-2 pr-6">{row.output}</td>
                <td className="py-2">{row.vs}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Link
        href="/pricing"
        className="mt-4 inline-flex items-center gap-1.5 text-sm text-text-primary transition-colors hover:text-accent-hover"
      >
        View full pricing <ArrowRight size={14} />
      </Link>
    </section>
  );
}
