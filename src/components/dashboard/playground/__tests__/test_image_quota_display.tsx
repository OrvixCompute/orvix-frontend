import { render, screen } from "@testing-library/react";
import { ImagePanel } from "@/components/dashboard/playground/ImagePanel";
import type { QuotaResponse } from "@/lib/types/orvix";

const mockSelectorState: { auth: { token: string | null; user: { wallet: string } | null } } = {
  auth: { token: "jwt", user: { wallet: "wallet-1" } },
};

// The quota fixture is swapped per test before rendering.
const mockQuota: { current: QuotaResponse | undefined } = { current: undefined };

jest.mock("@/lib/store/hooks", () => ({
  useAppSelector: (sel: (s: unknown) => unknown) => sel(mockSelectorState),
  useAppDispatch: () => jest.fn(),
}));

jest.mock("@/lib/inference/usePlaygroundKey", () => ({
  usePlaygroundKey: () => ({
    wallet: "wallet-1",
    ensureApiKey: jest.fn(async () => "orvx_sk_test"),
    forgetKey: jest.fn(),
  }),
}));

jest.mock("@/lib/store/api/accountApi", () => ({
  useGetQuotaQuery: () => ({ data: mockQuota.current, refetch: jest.fn() }),
}));

describe("ImagePanel quota display", () => {
  it("states the daily allowance without qualifying it", () => {
    // Holder gating is inactive (no ORVX mint configured), so this allowance is
    // simply what an account gets — it must not be labelled a grace period.
    mockQuota.current = {
      is_holder: false,
      image: { type: "grace_daily", daily_limit: 50, used_today: 3 },
    };
    render(<ImagePanel />);
    expect(screen.getByText(/^47\/50 images remaining today$/i)).toBeInTheDocument();
  });

  it("shows the holder allowance and remaining count", () => {
    mockQuota.current = {
      is_holder: true,
      image: { type: "holder_daily", daily_limit: 5, used_today: 3 },
    };
    render(<ImagePanel />);
    expect(screen.getByText(/2\/5 images remaining today \(holder\)/i)).toBeInTheDocument();
  });

  it("prompts to connect a wallet when signed out", () => {
    mockSelectorState.auth.token = null;
    mockQuota.current = undefined;
    render(<ImagePanel />);
    expect(screen.getByText(/connect your wallet to generate images/i)).toBeInTheDocument();
    mockSelectorState.auth.token = "jwt"; // restore for any later tests
  });
});
