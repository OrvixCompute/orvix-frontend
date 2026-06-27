"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { truncateAddress } from "@/lib/utils/solana";

/** Small inline indicator of the current wallet connection. */
export function WalletStatus() {
  const { connected, publicKey } = useWallet();

  return (
    <span className="font-mono text-xs text-text-tertiary">
      {connected && publicKey ? (
        <>
          <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-success align-middle" />
          {truncateAddress(publicKey.toBase58())}
        </>
      ) : (
        <>
          <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-text-muted align-middle" />
          not connected
        </>
      )}
    </span>
  );
}
