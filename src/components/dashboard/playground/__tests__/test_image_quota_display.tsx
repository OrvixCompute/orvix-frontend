import { screen } from "@testing-library/react";
import { ImagePanel } from "@/components/dashboard/playground/ImagePanel";
import { renderWithStore } from "@/lib/testing/renderWithStore";
import { stubHttp, type HttpStub } from "@/lib/testing/stubHttp";
import { clearPlaygroundStorage, quota, seedPlaygroundKey } from "@/lib/testing/playgroundFixtures";

let http: HttpStub;

beforeEach(() => {
  clearPlaygroundStorage();
  seedPlaygroundKey();
});
afterEach(() => http?.restore());

describe("ImagePanel quota display", () => {
  it("states the daily allowance without qualifying it", async () => {
    // Holder gating is inactive (no ORVX mint configured), so this allowance is
    // simply what an account gets — it must not be labelled a grace period.
    http = stubHttp({
      "GET /v1/account/quota": {
        body: quota({ image: { type: "grace_daily", daily_limit: 50, used_today: 3 } }),
      },
    });
    renderWithStore(<ImagePanel />);

    expect(await screen.findByText(/^47\/50 images remaining today$/i)).toBeInTheDocument();
  });

  it("shows the holder allowance and remaining count", async () => {
    http = stubHttp({
      "GET /v1/account/quota": {
        body: quota({
          is_holder: true,
          image: { type: "holder_daily", daily_limit: 5, used_today: 3 },
        }),
      },
    });
    renderWithStore(<ImagePanel />);

    expect(await screen.findByText(/2\/5 images remaining today \(holder\)/i)).toBeInTheDocument();
  });

  it("prompts to connect a wallet when signed out", () => {
    // No token, so the quota query is skipped and no request is made at all.
    http = stubHttp({});
    renderWithStore(<ImagePanel />, { token: null });

    expect(screen.getByText(/connect your wallet to generate images/i)).toBeInTheDocument();
    expect(http.requests).toHaveLength(0);
  });
});
