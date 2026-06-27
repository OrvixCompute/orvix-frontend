import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { routes } from "@/lib/constants/routes";

export function Hero() {
  return (
    <section className="py-16 md:py-24">
      <h1 className="max-w-3xl text-3xl font-medium tracking-tight md:text-4xl">
        Orvix: decentralized AI compute network
      </h1>
      <p className="mt-5 max-w-2xl text-text-secondary">
        Orvix is the open compute layer for AI. Inference, training, and agents run on a
        permissionless GPU network with USDC settlement, ORVX staking, and on-chain transparency.
        Try the{" "}
        <Link href={routes.playground} className="text-text-primary underline underline-offset-4">
          playground
        </Link>
        , read the{" "}
        <Link href={routes.docs} className="text-text-primary underline underline-offset-4">
          documentation
        </Link>
        , or read the{" "}
        <Link href={routes.whitepaper} className="text-text-primary underline underline-offset-4">
          whitepaper
        </Link>
        .
      </p>
      <div className="mt-8 flex flex-wrap items-center gap-3">
        <Link href={routes.playground}>
          <Button variant="primary">
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
