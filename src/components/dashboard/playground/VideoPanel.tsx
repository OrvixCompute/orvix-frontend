"use client";

import { Clapperboard } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { VIDEO_PREVIEW } from "@/lib/constants/models";

/**
 * The video tab: an explanation, not a tool.
 *
 * There is nothing to call — `orvix-video-1` is not in `GET /v1/models`, and
 * neither chat/completions nor images/generations will serve it. So this
 * component holds no state, has no submit handler, and issues no request. The
 * prompt box is here to show the shape of the feature and is inert.
 *
 * Deliberately absent: a progress bar, a sample clip, a countdown, and a
 * waitlist field. Nothing here may imply the network can do this today.
 */
export function VideoPanel() {
  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <Clapperboard size={16} className="text-text-tertiary" />
          <h2 className="text-sm font-medium text-text-primary">Video generation</h2>
        </div>
        <Badge className="border-border-strong text-text-tertiary">{VIDEO_PREVIEW.status}</Badge>
      </div>

      <p className="text-sm text-text-secondary">{VIDEO_PREVIEW.summary}</p>

      <div className="space-y-2 rounded-md border border-border bg-bg-secondary p-4">
        <p className="text-sm text-text-secondary">{VIDEO_PREVIEW.state}</p>
        <p className="text-sm text-text-tertiary">{VIDEO_PREVIEW.hardware}</p>
      </div>

      {/* Shape of the feature, switched off. The disabled state is loud on
          purpose: a subtly greyed box invites someone to type and wait. */}
      <div className="space-y-1.5 opacity-60">
        <label htmlFor="video-prompt" className="text-xs text-text-secondary">
          Prompt
        </label>
        <Textarea
          id="video-prompt"
          rows={3}
          disabled
          readOnly
          value=""
          placeholder="A drone shot over a coastline at sunrise…"
          className="cursor-not-allowed"
        />
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
          <span className="font-mono text-[11px] text-text-muted">{VIDEO_PREVIEW.id}</span>
          <Button disabled title="There is no endpoint to send this to yet">
            Not available yet
          </Button>
        </div>
      </div>

      <p className="text-xs text-text-tertiary">
        This box does nothing — there is no endpoint behind it. When one exists, this tab becomes
        interactive and the model shows up in{" "}
        <span className="font-mono text-text-secondary">GET /v1/models</span> like every other.
      </p>
    </div>
  );
}
