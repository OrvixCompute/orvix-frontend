/**
 * Mock stats data for the public /stats page.
 * Replace this module with real API calls once the backend exposes inference
 * network metrics (compute hours, node activity, request volume, etc.).
 */

export type IconName =
  | "Users"
  | "Layers"
  | "Cpu"
  | "Globe"
  | "DollarSign"
  | "RefreshCcw"
  | "Flame"
  | "Bot"
  | "Activity"
  | "Clock";

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

export interface ComputeHeroData {
  label: string;
  value: string;
  unit: string;
  trend: Trend;
}

export interface DashboardStatsData {
  computeHero: ComputeHeroData;
  liveNetwork: StatCardData[];
  economy: StatCardData[];
  aiActivity: StatCardData[];
  uptime: {
    uptime: string;
    lastUpdated: string;
  };
}

export const MOCK_DASHBOARD_STATS: DashboardStatsData = {
  computeHero: {
    label: "TOTAL COMPUTE DELIVERED",
    value: "1.24",
    unit: "M",
    trend: { value: "18.6%", direction: "up", label: "vs yesterday" },
  },
  liveNetwork: [
    {
      label: "NODES ONLINE",
      value: "1,248",
      icon: "Users",
      trend: { value: "24 today", direction: "up", label: "" },
    },
    {
      label: "ACTIVE JOBS",
      value: "326",
      icon: "Layers",
      trend: { value: "18 today", direction: "up", label: "" },
    },
    {
      label: "GPU CAPACITY",
      value: "91.4",
      unit: "%",
      icon: "Cpu",
      trend: { value: "3.2%", direction: "up", label: "" },
    },
    {
      label: "REGIONS",
      value: "27",
      icon: "Globe",
      trend: { value: "2 new", direction: "up", label: "" },
    },
  ],
  economy: [
    {
      label: "USDC REVENUE",
      value: "$184,320",
      icon: "DollarSign",
      sub: "All time",
    },
    {
      label: "ORVX BUYBACKS",
      value: "$63,500",
      icon: "RefreshCcw",
      sub: "All time",
    },
    {
      label: "ORVX BURNED",
      value: "2.4M",
      unit: " ORVX",
      icon: "Flame",
      sub: "All time",
    },
  ],
  aiActivity: [
    {
      label: "AI AGENTS ONLINE",
      value: "1,427",
      icon: "Bot",
      trend: { value: "103 today", direction: "up", label: "" },
    },
    {
      label: "INFERENCE REQUESTS",
      value: "12.8",
      unit: "M",
      icon: "Activity",
      trend: { value: "21.4%", direction: "up", label: "" },
    },
    {
      label: "AVG RESPONSE TIME",
      value: "186",
      unit: " ms",
      icon: "Clock",
      trend: { value: "8 ms", direction: "down", label: "" },
    },
  ],
  uptime: {
    uptime: "100%",
    lastUpdated: "9:21 PM UTC+7",
  },
};
