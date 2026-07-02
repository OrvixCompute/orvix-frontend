import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Albert_Sans, Plus_Jakarta_Sans, DM_Mono } from "next/font/google";
import "@/styles/globals.css";

// Asentum-style landing fonts. Exposed as CSS variables and applied only on the
// landing page via the `.asentum-page` wrapper (utility classes in globals.css),
// so the global body font (Geist) — and the dashboard — stay unchanged.
const albertSans = Albert_Sans({
  subsets: ["latin"],
  variable: "--font-albert",
  display: "swap",
});
const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus",
  display: "swap",
});
const dmMono = DM_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-dm-mono",
  display: "swap",
});
import { ReduxProvider } from "@/components/providers/ReduxProvider";
import { WalletProviderClient } from "@/components/wallet/WalletProviderClient";
import { config } from "@/lib/constants/config";

export const metadata: Metadata = {
  metadataBase: new URL(config.siteUrl),
  title: "Orvix — decentralized AI compute network",
  description:
    "The open compute layer for AI. An OpenAI-compatible inference network powered by community-run GPUs, settled in USDC on Solana.",
  // Favicon + apple-icon are provided by src/app/icon.png and src/app/apple-icon.png
  // (Next.js file conventions).
  openGraph: {
    title: "Orvix — decentralized AI compute network",
    description:
      "The open compute layer for AI. OpenAI-compatible inference on a permissionless GPU network.",
    type: "website",
    images: [{ url: "/banner.png", width: 320, height: 320, alt: "Orvix" }],
  },
  twitter: {
    card: "summary",
    title: "Orvix — decentralized AI compute network",
    description:
      "The open compute layer for AI. OpenAI-compatible inference on a permissionless GPU network.",
    images: ["/banner.png"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${GeistSans.variable} ${GeistMono.variable} ${albertSans.variable} ${plusJakarta.variable} ${dmMono.variable} dark`}
      data-theme="dark"
    >
      <body className="bg-bg-primary font-sans text-text-primary antialiased">
        <ReduxProvider>
          <WalletProviderClient>{children}</WalletProviderClient>
        </ReduxProvider>
      </body>
    </html>
  );
}
