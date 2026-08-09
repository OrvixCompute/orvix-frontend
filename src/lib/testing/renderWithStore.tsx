import { render, type RenderResult } from "@testing-library/react";
import { Provider } from "react-redux";
import { makeStore, type AppStore } from "@/lib/store";
import { setAuth } from "@/lib/store/slices/authSlice";
import type { User } from "@/lib/types/orvix";

export const TEST_USER: User = {
  id: "user-1",
  wallet: "9xQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin",
  tier: "bronze",
  balance_usdc: "0",
  is_provider: false,
};

export const TEST_TOKEN = "test.jwt.token";

/**
 * Render against a real store with the real API slice wired in.
 *
 * Nothing about the app is stubbed here — the components run the actual
 * RTK Query hooks, which build actual requests through the actual base query,
 * so a test exercises URL construction, the Authorization header, and the error
 * envelope rather than a hand-written stand-in for them. Only the network is
 * substituted, by `stubHttp`.
 *
 * Each call builds a fresh store, so one test's cached queries cannot leak into
 * the next.
 */
export function renderWithStore(
  ui: React.ReactElement,
  options: { user?: Partial<User>; token?: string | null } = {},
): RenderResult & { store: AppStore } {
  const store = makeStore();
  const token = options.token === undefined ? TEST_TOKEN : options.token;
  if (token) {
    store.dispatch(setAuth({ token, user: { ...TEST_USER, ...options.user }, expiresAt: null }));
  }
  const result = render(<Provider store={store}>{ui}</Provider>);
  return { ...result, store };
}
