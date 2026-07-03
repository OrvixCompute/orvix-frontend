"use client";

import { useEffect, useState } from "react";
import { ImageIcon, MessageSquare } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { cn } from "@/lib/utils/cn";
import { ChatPanel } from "@/components/dashboard/playground/ChatPanel";
import { ImagePanel } from "@/components/dashboard/playground/ImagePanel";

type Mode = "chat" | "image";

const TABS: { id: Mode; label: string; icon: typeof MessageSquare }[] = [
  { id: "chat", label: "Chat", icon: MessageSquare },
  { id: "image", label: "Image", icon: ImageIcon },
];

/** The interactive inference playground: a Chat tab and an Image tab. The active
 *  tab is reflected in the URL (?mode=image) so it can be linked and reloaded. */
export function Playground({ subtitle }: { subtitle?: string }) {
  const [mode, setMode] = useState<Mode>("chat");

  // Read the initial tab from the URL on mount. Done client-side (rather than via
  // useSearchParams) so the statically-rendered playground pages don't need a
  // Suspense boundary or opt into dynamic rendering.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("mode") === "image") setMode("image");
  }, []);

  const selectMode = (next: Mode) => {
    setMode(next);
    const params = new URLSearchParams(window.location.search);
    if (next === "image") params.set("mode", "image");
    else params.delete("mode");
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
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded px-3 py-1.5 text-sm font-medium transition-colors",
                    active
                      ? "bg-bg-tertiary text-text-primary"
                      : "text-text-secondary hover:text-text-primary",
                  )}
                >
                  <Icon size={14} /> {tab.label}
                </button>
              );
            })}
          </div>
        }
      />

      {mode === "chat" ? <ChatPanel /> : <ImagePanel />}
    </div>
  );
}
