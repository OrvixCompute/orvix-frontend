"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface CodeBlockProps {
  code: string;
  language?: string;
  className?: string;
}

/**
 * Plain code block — mono, no syntax color highlighting (white text, muted
 * punctuation by way of the surrounding theme). Optional language label and
 * copy button.
 */
export function CodeBlock({ code, language, className }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable — ignore */
    }
  };

  return (
    <div
      className={cn(
        "group relative rounded-md border border-border bg-bg-secondary",
        className,
      )}
    >
      <div className="flex items-center justify-between px-4 pt-3">
        {language ? (
          <span className="font-mono text-xs text-text-muted">{language}</span>
        ) : (
          <span />
        )}
        <button
          onClick={copy}
          aria-label="Copy code"
          className="text-text-muted opacity-0 transition-opacity hover:text-text-secondary group-hover:opacity-100"
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
        </button>
      </div>
      <pre className="overflow-x-auto px-4 pb-4 pt-1">
        <code className="font-mono text-xs leading-relaxed text-text-primary">{code}</code>
      </pre>
    </div>
  );
}
