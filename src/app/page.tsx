import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/landing/Hero";
import { NetworkFeed } from "@/components/landing/NetworkFeed";
import { Tagline } from "@/components/landing/Tagline";
import { NetworkStats } from "@/components/landing/NetworkStats";
import { CodeExample } from "@/components/landing/CodeExample";
import { Explainer } from "@/components/landing/Explainer";
import { PricingTeaser } from "@/components/landing/PricingTeaser";
import { Faq } from "@/components/landing/Faq";
import { Reveal } from "@/components/ui/Reveal";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-bg-primary">
      <Header />

      <main className="mx-auto max-w-page px-6">
        <Hero />

        <div className="space-y-16 pb-8">
          <Reveal>
            <div className="max-w-5xl">
              <NetworkFeed />
            </div>
          </Reveal>

          <Reveal>
            <Tagline />
          </Reveal>

          <Reveal>
            <div className="max-w-5xl">
              <NetworkStats />
            </div>
          </Reveal>

          <Reveal>
            <div className="max-w-5xl">
              <CodeExample />
            </div>
          </Reveal>

          <Reveal>
            <Explainer />
          </Reveal>

          <Reveal>
            <PricingTeaser />
          </Reveal>

          <Reveal>
            <Faq />
          </Reveal>
        </div>

        <Footer />
        <div className="h-12" />
      </main>
    </div>
  );
}
