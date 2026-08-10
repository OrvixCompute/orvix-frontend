"use client";

import { useEffect, useState } from "react";
import { Clapperboard, ImageIcon, MessageSquare } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { cn } from "@/lib/utils/cn";
import { ChatPanel } from "@/components/dashboard/playground/ChatPanel";
import { ImagePanel } from "@/components/dashboard/playground/ImagePanel";
import { VideoPanel } from "@/components/dashboard/playground/VideoPanel";

type Mode = "chat" | "image" | "video";

const TABS: { id: Mode; label: string; icon: typeof MessageSquare; soon?: boolean }[] = [
  { id: "chat", label: "Chat", icon: MessageSquare },
  { id: "image", label: "Image", icon: ImageIcon },
  // Selectable so it can explain itself, but marked so nobody mistakes it for a
  // working mode. What it opens is an explanation, not a tool that fails.
  { id: "video", label: "Video", icon: Clapperboard, soon: true },
];

const MODES: Mode[] = ["chat", "image", "video"];

/** The inference playground: Chat and Image run against the network, Video is a
 *  coming-soon placeholder. The active tab is reflected in the URL (?mode=image)
 *  so it can be linked and reloaded. */
export function Playground({ subtitle }: { subtitle?: string }) {
  const [mode, setMode] = useState<Mode>("chat");

  // Read the initial tab from the URL on mount. Done client-side (rather than via
  // useSearchParams) so the statically-rendered playground pages don't need a
  // Suspense boundary or opt into dynamic rendering.
  useEffect(() => {
    const requested = new URLSearchParams(window.location.search).get("mode");
    if (requested && MODES.includes(requested as Mode) && requested !== "chat") {
      setMode(requested as Mode);
    }
  }, []);

  const selectMode = (next: Mode) => {
    setMode(next);
    const params = new URLSearchParams(window.location.search);
    if (next === "chat") params.delete("mode");
    else params.set("mode", next);
    const qs = params.toString();
    window.history.replaceState(null, "", qs ? `?${qs}` : window.location.pathname);
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Playground"
        subtitle={subtitle ?? "Test inference against the network."}
        actions={
          <div className="inline-flex rounded-md border border-border bg-bg-secondary p-0.5">
            {TABS.map((tab) => {
              const active = mode === tab.id;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => selectMode(tab.id)}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded px-3 py-1.5 text-sm font-medium transition-colors",
                    active
                      ? "bg-bg-tertiary text-text-primary"
                      : "text-text-secondary hover:text-text-primary",
                  )}
                >
                  <Icon size={14} /> {tab.label}
                  {tab.soon && (
                    <span className="rounded bg-bg-primary px-1 font-mono text-[10px] leading-4 text-text-muted">
                      soon
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        }
      />

      {mode === "chat" && <ChatPanel />}
      {mode === "image" && <ImagePanel />}
      {mode === "video" && <VideoPanel />}
    </div>
  );
}
