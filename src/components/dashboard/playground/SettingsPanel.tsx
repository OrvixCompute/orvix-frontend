"use client";

import { cn } from "@/lib/utils/cn";
import { MODELS, GENERATION_LIMITS } from "@/lib/constants/models";

export interface PlaygroundSettings {
  model: string;
  temperature: number;
  maxTokens: number;
  stream: boolean;
}

interface SettingsPanelProps {
  settings: PlaygroundSettings;
  onChange: (patch: Partial<PlaygroundSettings>) => void;
  disabled?: boolean;
}

function Row({ label, value, children }: { label: string; value: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="text-xs text-text-secondary">{label}</label>
        <span className="font-mono text-xs text-text-primary">{value}</span>
      </div>
      {children}
    </div>
  );
}

export function SettingsPanel({ settings, onChange, disabled }: SettingsPanelProps) {
  const { temperature, maxTokens } = GENERATION_LIMITS;

  return (
    <div className="space-y-5 rounded-lg border border-border bg-bg-secondary p-4">
      <div className="text-xs font-medium text-text-muted">Parameters</div>

      <div className="space-y-1.5">
        <label htmlFor="pg-model" className="text-xs text-text-secondary">
          Model
        </label>
        <select
          id="pg-model"
          value={settings.model}
          disabled={disabled}
          onChange={(e) => onChange({ model: e.target.value })}
          className={cn(
            "w-full rounded-md border border-border bg-bg-tertiary px-3 py-2 text-sm",
            "font-mono text-text-primary focus:border-accent focus:outline-none",
            "disabled:cursor-not-allowed disabled:opacity-50",
          )}
        >
          {MODELS.map((m) => (
            <option key={m.id} value={m.id} disabled={!m.available}>
              {m.label} {m.available ? `· ${m.context}` : "· soon"}
            </option>
          ))}
        </select>
      </div>

      <Row label="Temperature" value={settings.temperature.toFixed(1)}>
        <input
          type="range"
          min={temperature.min}
          max={temperature.max}
          step={temperature.step}
          value={settings.temperature}
          disabled={disabled}
          onChange={(e) => onChange({ temperature: Number(e.target.value) })}
          className="w-full accent-accent"
        />
      </Row>

      <Row label="Max tokens" value={String(settings.maxTokens)}>
        <input
          type="range"
          min={maxTokens.min}
          max={maxTokens.max}
          step={maxTokens.step}
          value={settings.maxTokens}
          disabled={disabled}
          onChange={(e) => onChange({ maxTokens: Number(e.target.value) })}
          className="w-full accent-accent"
        />
      </Row>

      <button
        type="button"
        disabled={disabled}
        onClick={() => onChange({ stream: !settings.stream })}
        className="flex w-full items-center justify-between disabled:cursor-not-allowed disabled:opacity-50"
      >
        <span className="text-xs text-text-secondary">Stream response</span>
        <span
          className={cn(
            "relative h-4 w-7 rounded-full transition-colors",
            settings.stream ? "bg-accent" : "bg-border-strong",
          )}
        >
          <span
            className={cn(
              "absolute top-0.5 h-3 w-3 rounded-full bg-white transition-transform",
              settings.stream ? "translate-x-3.5" : "translate-x-0.5",
            )}
          />
        </span>
      </button>
    </div>
  );
}
