"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { cn } from "@/lib/utils/cn";

interface QrCodeProps {
  /** The string to encode (e.g. a Solana Pay URL). */
  value: string;
  /** Rendered size in pixels (square). */
  size?: number;
  className?: string;
}

/**
 * Renders `value` as a QR code. QR modules need a light background to scan, so
 * the code sits in a white card regardless of the surrounding dark theme.
 */
export function QrCode({ value, size = 200, className }: QrCodeProps) {
  const [svg, setSvg] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let active = true;
    setSvg(null);
    setFailed(false);
    QRCode.toString(value, {
      type: "svg",
      margin: 1,
      errorCorrectionLevel: "M",
      color: { dark: "#000000", light: "#ffffff" },
    })
      .then((s) => {
        if (active) setSvg(s);
      })
      .catch(() => {
        if (active) setFailed(true);
      });
    return () => {
      active = false;
    };
  }, [value]);

  if (failed) {
    return (
      <div
        className={cn(
          "flex items-center justify-center rounded-md bg-white text-xs text-black",
          className,
        )}
        style={{ width: size, height: size }}
      >
        QR unavailable
      </div>
    );
  }

  return (
    <div
      aria-label="Top-up QR code"
      className={cn("rounded-md bg-white p-2 [&_svg]:h-full [&_svg]:w-full", className)}
      style={{ width: size, height: size }}
      dangerouslySetInnerHTML={svg ? { __html: svg } : undefined}
    />
  );
}
