import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { routes } from "@/lib/constants/routes";

export function Tagline() {
  return (
    <section className="py-4">
      <h2 className="max-w-3xl text-2xl font-medium tracking-tight md:text-3xl">
        An inference network that pays out in real time
      </h2>
      <p className="mt-4 max-w-2xl text-text-secondary">
        Not a chatbot. Not a hosted API. An open GPU network where every request is metered
        on-chain, every provider is paid in USDC, and the system buys back ORVX from its own
        revenue.
      </p>
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <Link href={routes.playground}>
          <Button variant="secondary">
            Try the playground <ArrowRight size={14} />
          </Button>
        </Link>
        <Link href={routes.about}>
          <Button variant="ghost">Learn about Orvix</Button>
        </Link>
      </div>
    </section>
  );
}
