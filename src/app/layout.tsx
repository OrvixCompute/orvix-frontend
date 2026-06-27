import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "@/styles/globals.css";
import { ReduxProvider } from "@/components/providers/ReduxProvider";
import { WalletProvider } from "@/components/wallet/WalletProvider";
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
      className={`${GeistSans.variable} ${GeistMono.variable} dark`}
      data-theme="dark"
    >
      <body className="bg-bg-primary font-sans text-text-primary antialiased">
        <ReduxProvider>
          <WalletProvider>{children}</WalletProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}
