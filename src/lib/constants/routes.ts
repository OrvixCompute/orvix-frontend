/** Centralized app routes. */
export const routes = {
  home: "/",
  // The playground is an authenticated app feature; the public link goes
  // straight to the dashboard (AuthGuard prompts a wallet connect).
  playground: "/dashboard/playground",
  docs: "/docs",
  providers: "/providers",
  staking: "/staking",
  governance: "/governance",
  about: "/about",
  buy: "/buy",
  whitepaper: "/whitepaper",
} as const;

/** Authenticated dashboard routes (wrapped by the dashboard layout + AuthGuard). */
export const dashboardRoutes = {
  overview: "/dashboard",
  apiKeys: "/dashboard/api-keys",
  billing: "/dashboard/billing",
  playground: "/dashboard/playground",
  staking: "/dashboard/staking",
  governance: "/dashboard/governance",
  settings: "/dashboard/settings",
} as const;

/** Primary inline nav shown in the header. */
export const primaryNav = [
  { label: "playground", href: routes.playground },
  { label: "docs", href: routes.docs },
  { label: "providers", href: routes.providers },
  { label: "staking", href: routes.staking },
  { label: "about", href: routes.about },
  { label: "buy", href: routes.buy },
] as const;
