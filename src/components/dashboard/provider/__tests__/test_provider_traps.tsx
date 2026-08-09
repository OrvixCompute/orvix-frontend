import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NodesPanel } from "@/components/dashboard/provider/NodesPanel";
import { WithdrawDialog } from "@/components/dashboard/provider/WithdrawDialog";
import type { ProviderNode } from "@/lib/types/provider";

const mockNodes: { current: ProviderNode[] } = { current: [] };

// The backend returns a fixed estimated_completion on every payout.
const withdrawResult = {
  withdrawal_id: "w1",
  status: "queued",
  estimated_completion: "< 1 hour",
};

jest.mock("@/lib/store/hooks", () => ({
  useAppSelector: () => "wallet-1",
  useAppDispatch: () => jest.fn(),
}));

jest.mock("@/lib/store/api/providerApi", () => ({
  useListNodesQuery: () => ({ data: mockNodes.current, isLoading: false, isError: false }),
  useGetNodeQuery: () => ({ data: undefined, isLoading: false, isError: false }),
  useRenameNodeMutation: () => [jest.fn(), { isLoading: false }],
  useDeleteNodeMutation: () => [jest.fn(), { isLoading: false }],
  useWithdrawMutation: () => [
    () => ({ unwrap: () => Promise.resolve(withdrawResult) }),
    { isLoading: false },
  ],
}));

function node(overrides: Partial<ProviderNode> = {}): ProviderNode {
  return {
    id: "11111111-2222-3333-4444-555555555555",
    name: null,
    status: "ready",
    gpu_model: "NVIDIA RTX A5000",
    vram_mb: 24564,
    models_supported: ["qwen-2.5-7b", "orvix-image-1"],
    total_jobs: 2,
    total_earned_usdc: "0.000206",
    reputation_score: 100,
    // Deliberately ancient: last_heartbeat is written once at registration and
    // never updated, so a healthy node legitimately carries a stale timestamp.
    last_heartbeat: "2020-01-01T00:00:00Z",
    created_at: "2020-01-01T00:00:00Z",
    is_connected: true,
    ...overrides,
  };
}

describe("node liveness comes from is_connected, not last_heartbeat", () => {
  it("shows a connected node as connected despite an ancient heartbeat", () => {
    mockNodes.current = [node()];
    render(<NodesPanel registered />);
    expect(screen.getByText("connected")).toBeInTheDocument();
    expect(screen.queryByText(/last seen/i)).not.toBeInTheDocument();
    // The stale timestamp must not reach the UI at all.
    expect(screen.queryByText(/2020/)).not.toBeInTheDocument();
  });

  it("shows a disconnected node as offline even with a recent heartbeat", () => {
    mockNodes.current = [node({ is_connected: false, last_heartbeat: new Date().toISOString() })];
    render(<NodesPanel registered />);
    expect(screen.getByText("offline")).toBeInTheDocument();
    expect(screen.queryByText("connected")).not.toBeInTheDocument();
  });

  it("renders dust-level earnings rather than rounding them to zero", () => {
    mockNodes.current = [node()];
    render(<NodesPanel registered />);
    expect(screen.getByText("0.000206")).toBeInTheDocument();
    expect(screen.queryByText("0.00")).not.toBeInTheDocument();
  });

  it("tells a provider with no nodes what to do next", () => {
    mockNodes.current = [];
    render(<NodesPanel registered />);
    expect(screen.getByText(/no nodes connected yet/i)).toBeInTheDocument();
    // Named in the guidance and again as the command chip.
    expect(screen.getAllByText(/orvix-node start/).length).toBeGreaterThan(0);
  });
});

describe("withdraw guards the amount before the server does", () => {
  const setup = (available: string) =>
    render(
      <WithdrawDialog
        open
        available={available}
        onClose={jest.fn()}
        onRegisterNeeded={jest.fn()}
      />,
    );

  const submitButton = () => screen.getByRole("button", { name: /^withdraw$/i });

  it("blocks an empty amount", () => {
    setup("10");
    expect(submitButton()).toBeDisabled();
  });

  it("blocks below the 1 USDC minimum", async () => {
    setup("10");
    await userEvent.type(screen.getByLabelText(/amount/i), "0.5");
    expect(submitButton()).toBeDisabled();
    expect(screen.getByText(/minimum withdrawal is 1 usdc/i)).toBeInTheDocument();
  });

  it("blocks more than available_to_withdraw", async () => {
    setup("10");
    await userEvent.type(screen.getByLabelText(/amount/i), "11");
    expect(submitButton()).toBeDisabled();
    expect(screen.getByText(/you have 10\.00 usdc available/i)).toBeInTheDocument();
  });

  it("allows an amount inside both bounds", async () => {
    setup("10");
    await userEvent.type(screen.getByLabelText(/amount/i), "5");
    expect(submitButton()).toBeEnabled();
  });

  it("confirms without repeating the backend's fixed estimate as a promise", async () => {
    // estimated_completion is the same string on every response, so rendering it
    // as "settles in <value>" dresses a constant up as a per-payout guarantee.
    setup("10");
    await userEvent.type(screen.getByLabelText(/amount/i), "5");
    await userEvent.click(submitButton());

    expect(await screen.findByText(/payout queued/i)).toBeInTheDocument();
    expect(screen.queryByText(/< 1 hour/)).not.toBeInTheDocument();
  });

  it("offers only the withdrawable figure, never the spending balance", () => {
    // available_to_withdraw is the only payable number; balance_usdc is
    // topped-up spending money and would send the user into a 402.
    setup("0.000206");
    expect(screen.getByText("0.000206 USDC")).toBeInTheDocument();
    expect(submitButton()).toBeDisabled();
  });
});
