import type { StatCardData } from "@/lib/constants/stats";
import { StatCard } from "./StatCard";

interface StatSectionProps {
  title: string;
  stats: StatCardData[];
  columns?: 3 | 4;
}

export function StatSection({ title, stats, columns = 4 }: StatSectionProps) {
  return (
    <section className="px-[4%] py-4">
      <div className="mx-auto max-w-7xl">
        <h2 className="font-dm-mono text-[13px] font-medium uppercase tracking-[0.15em] text-[#2DAEFF]">
          {title}
        </h2>

        <div
          className={`mt-5 grid grid-cols-1 gap-4 ${
            columns === 4
              ? "sm:grid-cols-2 lg:grid-cols-4"
              : "sm:grid-cols-2 lg:grid-cols-3"
          }`}
        >
          {stats.map((stat) => (
            <StatCard key={stat.label} stat={stat} />
          ))}
        </div>
      </div>
    </section>
  );
}
