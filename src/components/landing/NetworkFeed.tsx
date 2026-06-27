import { Terminal } from "@/components/ui/Terminal";

// Static, realistic feed data for v1. A later iteration tails real events
// from the orchestrator.
const FEED_LINES = [
  "[09:42:17] job.complete   node=1c101f60  model=qwen-2.5-7b  tokens=512  cost=0.000031 USDC",
  "[09:42:14] node.heartbeat id=1c101f60  gpu=RTX-4000-Ada  jobs_running=0",
  "[09:42:08] job.dispatch   node=1c101f60  tier=gold  discount=15%",
  "[09:42:01] auth.verify    wallet=5tzF...uAi9  jwt.issued",
  "[09:41:55] revenue.split  provider=0.000022  buyback=0.0000045  treasury=0.0000027",
  "[09:41:48] node.heartbeat id=9f23ab10  gpu=RTX-4090  jobs_running=2",
  "[09:41:40] job.complete   node=9f23ab10  model=qwen-2.5-7b  tokens=1280  cost=0.000078 USDC",
];

export function NetworkFeed() {
  return (
    <Terminal
      title="network feed"
      command="tail -f orvix/network/events.jsonl"
      lines={FEED_LINES}
      cursor
    />
  );
}
