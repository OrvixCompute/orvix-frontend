import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NodesPanel } from "@/components/dashboard/provider/NodesPanel";
import { WithdrawDialog } from "@/components/dashboard/provider/WithdrawDialog";
import { renderWithStore, TEST_TOKEN } from "@/lib/testing/renderWithStore";
import { stubHttp, apiError, type HttpStub } from "@/lib/testing/stubHttp";
import type { ProviderNode } from "@/lib/types/provider";

let http: HttpStub;
afterEach(() => http?.restore());

/** A node exactly as GET /v1/provider/nodes returns one. */
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
  it("shows a connected node as connected despite an ancient heartbeat", async () => {
    http = stubHttp({ "GET /v1/provider/nodes": { body: [node()] } });
    renderWithStore(<NodesPanel registered />);

    expect(await screen.findByText("connected")).toBeInTheDocument();
    expect(screen.queryByText(/last seen/i)).not.toBeInTheDocument();
    // The stale timestamp must not reach the UI at all.
    expect(screen.queryByText(/2020/)).not.toBeInTheDocument();
  });

  it("shows a disconnected node as offline even with a recent heartbeat", async () => {
    http = stubHttp({
      "GET /v1/provider/nodes": {
        body: [node({ is_connected: false, last_heartbeat: new Date().toISOString() })],
      },
    });
    renderWithStore(<NodesPanel registered />);

    expect(await screen.findByText("offline")).toBeInTheDocument();
    expect(screen.queryByText("connected")).not.toBeInTheDocument();
  });

  it("renders dust-level earnings rather than rounding them to zero", async () => {
    http = stubHttp({ "GET /v1/provider/nodes": { body: [node()] } });
    renderWithStore(<NodesPanel registered />);

    expect(await screen.findByText("0.000206")).toBeInTheDocument();
    expect(screen.queryByText("0.00")).not.toBeInTheDocument();
  });

  it("tells a provider with no nodes what to do next", async () => {
    http = stubHttp({ "GET /v1/provider/nodes": { body: [] } });
    renderWithStore(<NodesPanel registered />);

    expect(await screen.findByText(/no nodes connected yet/i)).toBeInTheDocument();
    // Named in the guidance and again as the command chip.
    expect(screen.getAllByText(/orvix-node start/).length).toBeGreaterThan(0);
  });

  it("sends the session JWT with the request", async () => {
    http = stubHttp({ "GET /v1/provider/nodes": { body: [] } });
    renderWithStore(<NodesPanel registered />);

    await screen.findByText(/no nodes connected yet/i);
    expect(http.sent("GET /v1/provider/nodes")[0].authorization).toBe(`Bearer ${TEST_TOKEN}`);
  });
});

describe("withdraw guards the amount before the server does", () => {
  const open = (available: string) =>
    renderWithStore(
      <WithdrawDialog
        open
        available={available}
        onClose={jest.fn()}
        onRegisterNeeded={jest.fn()}
      />,
    );

  const submitButton = () => screen.getByRole("button", { name: /^withdraw$/i });

  /** The automatic path: the worker's interval, no human involved. */
  const AUTO_QUEUED = {
    withdrawal_id: "w1",
    status: "queued",
    estimated_completion: "picked up by the payout worker within ~5 min, then confirmed on-chain",
    requires_manual_approval: false,
  };

  beforeEach(() => {
    http = stubHttp({ "POST /v1/provider/withdraw": { body: AUTO_QUEUED } });
  });

  it("blocks an empty amount", () => {
    open("10");
    expect(submitButton()).toBeDisabled();
  });

  it("blocks below the 1 USDC minimum", async () => {
    open("10");
    await userEvent.type(screen.getByLabelText(/amount/i), "0.5");
    expect(submitButton()).toBeDisabled();
    expect(screen.getByText(/minimum withdrawal is 1 usdc/i)).toBeInTheDocument();
  });

  it("blocks more than available_to_withdraw", async () => {
    open("10");
    await userEvent.type(screen.getByLabelText(/amount/i), "11");
    expect(submitButton()).toBeDisabled();
    expect(screen.getByText(/you have 10\.00 usdc available/i)).toBeInTheDocument();
  });

  it("never reaches the network while the amount is out of bounds", async () => {
    open("10");
    await userEvent.type(screen.getByLabelText(/amount/i), "0.5");
    await userEvent.click(submitButton());
    expect(http.sent("POST /v1/provider/withdraw")).toHaveLength(0);
  });

  it("posts the amount once it is inside both bounds", async () => {
    open("10");
    await userEvent.type(screen.getByLabelText(/amount/i), "5");
    expect(submitButton()).toBeEnabled();
    await userEvent.click(submitButton());

    await screen.findByText(/payout queued/i);
    const [request] = http.sent("POST /v1/provider/withdraw");
    // destination_wallet is omitted so the server falls back to the account wallet.
    expect(request.body).toEqual({ amount: 5 });
  });

  it("shows the server's account of what happens next", async () => {
    open("10");
    await userEvent.type(screen.getByLabelText(/amount/i), "5");
    await userEvent.click(submitButton());

    expect(await screen.findByText(/payout queued/i)).toBeInTheDocument();
    expect(screen.getByText(AUTO_QUEUED.estimated_completion)).toBeInTheDocument();
  });

  it("flags a withdrawal that no automatic payout will pick up", async () => {
    // Above AUTO_APPROVE_MAX_USDC there is no approval endpoint, so it waits on
    // a person — it must not read like a payout already on its way.
    http.restore();
    http = stubHttp({
      "POST /v1/provider/withdraw": {
        body: {
          withdrawal_id: "w2",
          status: "queued",
          estimated_completion: "awaiting manual review — no automatic payout will be attempted",
          requires_manual_approval: true,
        },
      },
    });
    open("20000");

    await userEvent.type(screen.getByLabelText(/amount/i), "15000");
    await userEvent.click(submitButton());

    expect(await screen.findByText(/awaiting manual review/i)).toBeInTheDocument();
    expect(screen.queryByText(/payout worker/i)).not.toBeInTheDocument();
  });

  it("offers only the withdrawable figure, never the spending balance", () => {
    // available_to_withdraw is the only payable number; balance_usdc is
    // topped-up spending money and would send the user into a 402.
    open("0.000206");
    expect(screen.getByText("0.000206 USDC")).toBeInTheDocument();
    expect(submitButton()).toBeDisabled();
  });

  it("renders the server's message and routes a non-provider to registration", async () => {
    http.restore();
    http = stubHttp({
      "POST /v1/provider/withdraw": apiError(
        403,
        "not_a_provider",
        "This endpoint is for registered providers.",
      ),
    });
    const onRegisterNeeded = jest.fn();
    renderWithStore(
      <WithdrawDialog
        open
        available="10"
        onClose={jest.fn()}
        onRegisterNeeded={onRegisterNeeded}
      />,
    );

    await userEvent.type(screen.getByLabelText(/amount/i), "5");
    await userEvent.click(submitButton());

    expect(
      await screen.findByText(/this endpoint is for registered providers/i),
    ).toBeInTheDocument();
    await waitFor(() => expect(onRegisterNeeded).toHaveBeenCalled());
  });
});
