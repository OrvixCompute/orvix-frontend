import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Playground } from "@/components/dashboard/playground/Playground";

// The panels reach into Redux and the inference layer; stub those so we can
// render the tab shell in isolation.
const mockSelectorState: { auth: { token: string | null; user: { wallet: string } | null } } = {
  auth: { token: "jwt", user: { wallet: "wallet-1" } },
};

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
  useGetQuotaQuery: () => ({ data: undefined, refetch: jest.fn() }),
}));

describe("Playground tabs", () => {
  it("renders both tab buttons and defaults to Chat", () => {
    render(<Playground />);
    expect(screen.getByRole("button", { name: /chat/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /image/i })).toBeInTheDocument();
    // Chat panel content is visible by default.
    expect(screen.getByText(/send a message to run it through the network/i)).toBeInTheDocument();
  });

  it("switches to the Image tab on click", async () => {
    render(<Playground />);
    await userEvent.click(screen.getByRole("button", { name: /image/i }));
    expect(screen.getByText(/your generated image will appear here/i)).toBeInTheDocument();
    // ...and reflects the choice in the URL.
    expect(window.location.search).toContain("mode=image");
  });
});
