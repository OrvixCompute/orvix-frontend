import { render, screen } from "@testing-library/react";
import { ProviderAccessCard } from "@/components/dashboard/provider/ProviderAccessCard";

jest.mock("@/lib/store/api/providerApi", () => ({
  useRegisterProviderMutation: () => [jest.fn(), { isLoading: false }],
  useRegenerateSecretMutation: () => [jest.fn(), { isLoading: false }],
}));

describe("provider access card follows is_provider", () => {
  it("offers registration to an account that is not a provider", () => {
    render(<ProviderAccessCard registered={false} />);
    expect(screen.getByRole("button", { name: /become a provider/i })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /new secret/i })).not.toBeInTheDocument();
  });

  it("offers rotation to a registered provider with no nodes yet", () => {
    // The case that made inference wrong: registered, but nothing connected and
    // nothing earned, so there is no evidence to infer provider status from.
    render(<ProviderAccessCard registered />);
    expect(screen.getByRole("button", { name: /new secret/i })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /become a provider/i })).not.toBeInTheDocument();
  });

  it("withholds the action until the flag has loaded", () => {
    // Defaulting to "not a provider" would show an existing provider a button
    // that silently rotates their live secret and drops a running node.
    render(<ProviderAccessCard registered={false} statusLoading />);
    expect(screen.queryByRole("button", { name: /become a provider/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /new secret/i })).not.toBeInTheDocument();
    expect(screen.getByText(/provider access/i)).toBeInTheDocument();
  });
});
