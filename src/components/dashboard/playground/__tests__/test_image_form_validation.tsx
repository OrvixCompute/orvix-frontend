import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ImagePanel } from "@/components/dashboard/playground/ImagePanel";
import { IMAGE_SIZES } from "@/lib/constants/models";

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

describe("ImagePanel form validation", () => {
  it("disables Generate until the prompt meets the minimum length", async () => {
    render(<ImagePanel />);
    const generate = screen.getByRole("button", { name: /generate/i });
    expect(generate).toBeDisabled();

    const prompt = screen.getByLabelText(/prompt/i);
    await userEvent.type(prompt, "hi"); // 2 chars — below the 3-char minimum
    expect(screen.getByText(/minimum 3 characters/i)).toBeInTheDocument();
    expect(generate).toBeDisabled();

    await userEvent.type(prompt, "!"); // now 3 chars
    expect(generate).toBeEnabled();
  });

  it("offers every supported output size", () => {
    render(<ImagePanel />);
    const size = screen.getByLabelText(/size/i) as HTMLSelectElement;
    expect(size.options).toHaveLength(IMAGE_SIZES.length);
    // Default is the first (square) size.
    expect(size.value).toBe("1024x1024");
  });
});
