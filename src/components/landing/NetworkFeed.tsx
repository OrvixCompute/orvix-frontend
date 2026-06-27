"use client";

import { useEffect, useState } from "react";

// Chronological seed (oldest first, newest at the bottom) so it reads like a
// live `tail -f`. Matches the initial server render, then streams on the client.
const SEED = [
  "[09:41:40] job.complete   node=9f23ab10  model=qwen-2.5-7b  tokens=1280  cost=0.000078 USDC",
  "[09:41:48] node.heartbeat id=9f23ab10  gpu=RTX-4090  jobs_running=2",
  "[09:41:55] revenue.split  provider=0.000022  buyback=0.0000045  treasury=0.0000027",
  "[09:42:01] auth.verify    wallet=5tzF...uAi9  jwt.issued",
  "[09:42:08] job.dispatch   node=1c101f60  tier=gold  discount=15%",
  "[09:42:14] node.heartbeat id=1c101f60  gpu=RTX-4000-Ada  jobs_running=0",
  "[09:42:17] job.complete   node=1c101f60  model=qwen-2.5-7b  tokens=512  cost=0.000031 USDC",
];

const NODES = ["1c101f60", "9f23ab10", "a7b2c3d4", "3e5f7a90", "b1d4e6f2"];
const GPUS = ["RTX-4090", "RTX-4000-Ada", "A100-40GB", "L40S"];
const WALLETS = ["5tzF...uAi9", "8kQm...rP2x", "Bn4v...9wzc", "Ge7h...kL3a"];

const pad = (n: number) => String(n).padStart(2, "0");
const pick = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];
const rint = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const node = () => pick(NODES);

const EVENTS: (() => string)[] = [
  () =>
    `job.complete   node=${node()}  model=qwen-2.5-7b  tokens=${rint(128, 2048)}  cost=0.0000${rint(10, 99)} USDC`,
  () => `node.heartbeat id=${node()}  gpu=${pick(GPUS)}  jobs_running=${rint(0, 4)}`,
  () =>
    `job.dispatch   node=${node()}  tier=${pick(["gold", "silver", "bronze"])}  discount=${pick(["15%", "10%", "5%"])}`,
  () => `auth.verify    wallet=${pick(WALLETS)}  jwt.issued`,
  () =>
    `revenue.split  provider=0.0000${rint(10, 40)}  buyback=0.0000${rint(1, 9)}  treasury=0.0000${rint(1, 9)}`,
];

export function NetworkFeed() {
  const [lines, setLines] = useState<string[]>(SEED);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // Advance a clock from the last seed timestamp and append synthetic events.
    let h = 9;
    let m = 42;
    let s = 17;

    const id = window.setInterval(() => {
      s += rint(2, 7);
      if (s >= 60) {
        s -= 60;
        m += 1;
      }
      if (m >= 60) {
        m -= 60;
        h = (h + 1) % 24;
      }
      const line = `[${pad(h)}:${pad(m)}:${pad(s)}] ${pick(EVENTS)()}`;
      setLines((prev) => [...prev.slice(-6), line]);
    }, 1800);

    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-success" />
        </span>
        <span className="font-mono text-xs text-text-muted">network feed · live</span>
      </div>

      <div className="overflow-x-auto rounded-md border border-border bg-bg-secondary px-4 py-3 font-mono text-xs leading-6">
        <div className="whitespace-pre text-text-secondary">
          <span className="select-none text-text-muted">$ </span>
          tail -f orvix/network/events.jsonl
        </div>
        {lines.map((line, i) => (
          <div key={`${i}-${line}`} className="animate-fade-in whitespace-pre text-text-primary">
            {line}
          </div>
        ))}
        <span className="inline-block animate-cursor-blink text-text-primary">▍</span>
      </div>
    </div>
  );
}
