// A row of stats separated by dashed vertical rules (Asentum's stat strips).
// `variant="big"` is the headline number strip; `variant="small"` is the
// label/value spec row.

export type Stat = { value: string; label: string };

export function StatsRow({
  stats,
  variant = "big",
}: {
  stats: Stat[];
  variant?: "big" | "small";
}) {
  const valueClass =
    variant === "big"
      ? "font-plus text-[28px] font-bold text-white md:text-[36px]"
      : "font-dm-mono text-[15px] font-medium text-white md:text-[17px]";
  return (
    <section className="px-[4%] py-12">
      <div className="mx-auto grid max-w-7xl grid-cols-2 md:grid-cols-5">
        {stats.map((s, i) => (
          <div
            key={s.label}
            className={`flex flex-col gap-2 px-4 py-4 md:py-0 ${
              i < stats.length - 1 ? "md:dash-sep-r-desktop" : ""
            }`}
          >
            <span className={valueClass}>{s.value}</span>
            <span className="font-dm-mono text-xs uppercase tracking-[0.12em] text-[#7D7D7D]">
              {s.label}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
