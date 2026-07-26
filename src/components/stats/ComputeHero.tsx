"use client";

import Image from "next/image";
import { ArrowUp } from "lucide-react";
import type { ComputeHeroData } from "@/lib/constants/stats";

interface ComputeHeroProps {
  data: ComputeHeroData;
}

export function ComputeHero({ data }: ComputeHeroProps) {
  return (
    <section className="px-[4%] pt-6 pb-4">
      <div className="mx-auto max-w-7xl">
        <div className="relative overflow-hidden rounded-2xl border border-[#1F1F1F] bg-[#0A0A0A] p-6 md:p-8">
          {/* Subtle blue gradient glow on the right */}
          <div
            className="pointer-events-none absolute right-0 top-0 h-full w-1/2 opacity-30"
            style={{
              background:
                "radial-gradient(circle at 80% 50%, rgba(45, 174, 255, 0.15), transparent 60%)",
            }}
            aria-hidden="true"
          />

          <div className="relative flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
            <div>
              <span className="font-dm-mono text-[11px] font-medium uppercase tracking-[0.15em] text-[#7D7D7D]">
                {data.label}
              </span>

              <div className="mt-3 flex items-baseline gap-1">
                <span className="font-plus text-[56px] font-bold leading-[1] tracking-tight text-[#2DAEFF] md:text-[84px]">
                  {data.value}
                </span>
                <span className="font-plus text-[24px] font-semibold text-[#2DAEFF] md:text-[32px]">
                  {data.unit}
                </span>
                <span className="ml-2 font-dm-mono text-[13px] uppercase tracking-[0.12em] text-[#7D7D7D]">
                  GPU HOURS
                </span>
              </div>

              <div className="mt-4 flex items-center gap-2">
                <span className="inline-flex items-center gap-1 font-dm-mono text-[13px] font-medium text-[#26CC6B]">
                  <ArrowUp size={14} />
                  {data.trend.value}
                </span>
                <span className="font-dm-mono text-[13px] text-[#5A5A5A]">
                  {data.trend.label}
                </span>
              </div>
            </div>

            <div className="relative h-28 w-28 shrink-0 md:h-36 md:w-36">
              <Image
                src="/logo.png"
                alt="Orvix"
                fill
                className="object-contain"
                sizes="(max-width: 768px) 112px, 144px"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
