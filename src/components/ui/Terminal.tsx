"use client";

import { cn } from "@/lib/utils/cn";

interface TerminalProps {
  /** Optional small label shown above the block (e.g. "network feed"). */
  title?: string;
  /** The "$ ..." command line shown at the top of the block. */
  command?: string;
  /** Body lines, streamed in with a staggered fade on first render. */
  lines?: string[];
  /** Show a blinking cursor at the end. */
  cursor?: boolean;
  className?: string;
}

/**
 * Terminal / CLI block. Same base as a code block, with a "$" prompt, optional
 * staggered line fade-in, and an optional blinking cursor. Used for the live
 * network feed and command examples.
 */
export function Terminal({ title, command, lines = [], cursor = true, className }: TerminalProps) {
  return (
    <div className={cn("space-y-2", className)}>
      {title && <span className="font-mono text-xs text-text-muted">{title}</span>}
      <div className="overflow-x-auto rounded-md border border-border bg-bg-secondary p-4 font-mono text-xs leading-relaxed">
        {command && (
          <div className="whitespace-pre text-text-secondary">
            <span className="select-none text-text-muted">$ </span>
            {command}
          </div>
        )}
        {lines.map((line, i) => (
          <div
            key={i}
            className="animate-fade-in whitespace-pre text-text-primary"
            style={{ animationDelay: `${i * 120}ms`, animationFillMode: "backwards" }}
          >
            {line}
          </div>
        ))}
        {cursor && (
          <span className="inline-block animate-cursor-blink text-text-primary">▍</span>
        )}
      </div>
    </div>
  );
}
