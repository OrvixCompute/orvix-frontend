"use client";

import dynamic from "next/dynamic";

// Load the Solana wallet provider client-side only. The wallet adapters pull in
// hardware-wallet packages (e.g. @ledgerhq) that use dynamic requires, which
// break Next's static prerender ("Cannot find module vendor-chunks/@ledgerhq.js")
// when bundled into the server graph. Wallet connection is inherently a
// client-only concern, so rendering it with ssr:false keeps those packages out
// of the server/prerender bundle without any loss of behavior.
const WalletProvider = dynamic(
  () => import("./WalletProvider").then((m) => m.WalletProvider),
  { ssr: false },
);

export function WalletProviderClient({
  children,
}: {
  children: React.ReactNode;
}) {
  return <WalletProvider>{children}</WalletProvider>;
}
