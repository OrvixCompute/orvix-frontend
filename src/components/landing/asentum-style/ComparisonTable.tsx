import { DualHeading } from "./primitives";

// Three-column network comparison (Asentum's chain-vs-chain table).
// "✓" / "✗" rendered with tone colors; text rows kept plain.

const COLUMNS = ["Orvix", "OpenAI", "io.net"] as const;

type Cell = string | boolean;

type Row = { label: string; cells: [Cell, Cell, Cell] };

const ROWS: Row[] = [
  { label: "API surface", cells: ["OpenAI v1", "OpenAI v1", "Proprietary"] },
  {
    label: "Pricing model",
    cells: ["Per-token USDC", "Per-token USD", "Per-hour GPU"],
  },
  { label: "Provider permissionless", cells: [true, false, true] },
  { label: "Open-source orchestrator", cells: [true, false, false] },
  { label: "Token economy", cells: ["ORVX", false, "IO"] },
  { label: "USDC settlement", cells: [true, false, false] },
];

function CellValue({ value, primary }: { value: Cell; primary: boolean }) {
  if (typeof value === "boolean") {
    return (
      <span className={value ? "text-[#26CC6B]" : "text-[#5A5A5A]"}>
        {value ? "✓" : "✗"}
      </span>
    );
  }
  return (
    <span className={primary ? "text-white" : "text-[#BABABA]"}>{value}</span>
  );
}

export function ComparisonTable() {
  return (
    <section className="px-[4%] py-20">
      <div className="mx-auto max-w-7xl">
        <DualHeading
          lead="How Orvix compares to"
          emphasis="the alternatives."
          className="mb-12 text-[24px] md:text-[32px]"
        />

        {/* Header row */}
        <div className="dash-border-b grid grid-cols-4 pb-4">
          <span className="font-dm-mono text-xs uppercase tracking-[0.12em] text-[#5A5A5A]">
            Capability
          </span>
          {COLUMNS.map((col, i) => (
            <span
              key={col}
              className={`font-dm-mono text-[13px] font-medium uppercase tracking-[0.12em] ${
                i === 0 ? "text-white" : "text-[#7D7D7D]"
              }`}
            >
              {col}
            </span>
          ))}
        </div>

        {/* Body rows */}
        <div>
          {ROWS.map((row) => (
            <div
              key={row.label}
              className="dash-border-b grid grid-cols-4 items-center py-4 text-[14px]"
            >
              <span className="text-[#ACACAC]">{row.label}</span>
              {row.cells.map((cell, i) => (
                <div key={i}>
                  <CellValue value={cell} primary={i === 0} />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
