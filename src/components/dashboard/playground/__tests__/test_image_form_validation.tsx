import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ImagePanel } from "@/components/dashboard/playground/ImagePanel";
import { DEFAULT_IMAGE_MODEL, sizesForModel } from "@/lib/constants/models";

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

  it("offers only the sizes the selected model can produce", () => {
    render(<ImagePanel />);
    const size = screen.getByLabelText(/size/i) as HTMLSelectElement;
    const allowed = sizesForModel(DEFAULT_IMAGE_MODEL);
    expect(size.options).toHaveLength(allowed.length);
    // Sizes past the model's max_size would come back as 400 invalid_size.
    expect(Array.from(size.options).map((o) => o.value)).toEqual(allowed);
    expect(size.value).toBe("1024x1024");
  });

  it("drops a size the newly selected model cannot produce", async () => {
    render(<ImagePanel />);
    const model = screen.getByLabelText(/model/i) as HTMLSelectElement;
    const size = screen.getByLabelText(/size/i) as HTMLSelectElement;

    // flux-schnell reaches 1536x1536; orvix-image-1 stops at 1024x1024.
    await userEvent.selectOptions(model, "flux-schnell");
    await userEvent.selectOptions(size, "1536x1536");
    expect(size.value).toBe("1536x1536");

    await userEvent.selectOptions(model, "orvix-image-1");
    expect(size.value).toBe("1024x1024");
  });
});
