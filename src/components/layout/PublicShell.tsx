import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

/** Shared chrome for public marketing/content pages (landing-style). */
export function PublicShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-bg-primary">
      <Header />
      <main className="mx-auto max-w-page px-6">
        {children}
        <Footer />
        <div className="h-12" />
      </main>
    </div>
  );
}

/** Page hero: a mono eyebrow, a title, and a lead paragraph. */
export function PageIntro({
  eyebrow,
  title,
  lead,
}: {
  eyebrow: string;
  title: string;
  lead: string;
}) {
  return (
    <section className="py-16 md:py-20">
      <span className="font-mono text-xs text-text-muted">{eyebrow}</span>
      <h1 className="mt-3 max-w-3xl text-3xl font-medium tracking-tight md:text-4xl">{title}</h1>
      <p className="mt-5 max-w-2xl text-text-secondary">{lead}</p>
    </section>
  );
}

/** A titled content block separated by a hairline, matching the landing rhythm. */
export function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-t border-border py-8">
      <h2 className="text-lg font-medium">{title}</h2>
      <div className="mt-3 max-w-2xl space-y-3 text-text-secondary">{children}</div>
    </section>
  );
}
