import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ImagePanel } from "@/components/dashboard/playground/ImagePanel";

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

// Keep the real ImageError class; stub the network call.
jest.mock("@/lib/inference/image", () => {
  const actual = jest.requireActual("@/lib/inference/image");
  return { ...actual, generateImage: jest.fn() };
});
import { generateImage, ImageError } from "@/lib/inference/image";

const mockGenerate = generateImage as jest.Mock;

async function submitPrompt() {
  await userEvent.type(screen.getByLabelText(/prompt/i), "a red panda");
  await userEvent.click(screen.getByRole("button", { name: /generate/i }));
}

describe("ImagePanel error states", () => {
  beforeEach(() => mockGenerate.mockReset());

  it("402 shows the top-up / buy CTA to /pricing", async () => {
    mockGenerate.mockRejectedValue(new ImageError("Quota exceeded", 402));
    render(<ImagePanel />);
    await submitPrompt();
    const cta = await screen.findByRole("link", { name: /buy orvx or top up usdc/i });
    expect(cta).toHaveAttribute("href", "/pricing");
  });

  it("403 shows the holder CTA to /tokenomics", async () => {
    mockGenerate.mockRejectedValue(
      new ImageError("Image generation requires holding at least 10000 ORVX.", 403),
    );
    render(<ImagePanel />);
    await submitPrompt();
    const cta = await screen.findByRole("link", { name: /learn about orvx/i });
    expect(cta).toHaveAttribute("href", "/tokenomics");
    expect(screen.getByText(/10000 ORVX/i)).toBeInTheDocument();
  });

  it("429 shows the daily-limit message with reset time", async () => {
    const resetAt = new Date(Date.now() + 2 * 60 * 60 * 1000 + 5 * 60 * 1000).toISOString();
    mockGenerate.mockRejectedValue(new ImageError("Daily quota exceeded", 429, { resetAt }));
    render(<ImagePanel />);
    await submitPrompt();
    expect(await screen.findByText(/daily limit reached/i)).toBeInTheDocument();
    expect(screen.getByText(/resets in 2h 5m/i)).toBeInTheDocument();
  });

  it("503 shows the no-providers message", async () => {
    mockGenerate.mockRejectedValue(new ImageError("no providers", 503));
    render(<ImagePanel />);
    await submitPrompt();
    expect(await screen.findByText(/no image providers available/i)).toBeInTheDocument();
  });
});
