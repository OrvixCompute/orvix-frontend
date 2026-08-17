/**
 * Presentation types for the public /stats cards. Every value rendered by
 * these cards is derived from an API response — nothing is hardcoded here.
 */

export type IconName =
  | "Server"
  | "Cpu"
  | "MemoryStick"
  | "Users"
  | "Coins"
  | "RefreshCcw"
  | "Flame"
  | "MessageSquare"
  | "Image"
  | "Video"
  | "Clock"
  | "Bot";

export interface Trend {
  value: string;
  direction: "up" | "down";
  label: string;
}

export interface StatCardData {
  label: string;
  value: string;
  unit?: string;
  sub?: string;
  trend?: Trend;
  icon: IconName;
}
