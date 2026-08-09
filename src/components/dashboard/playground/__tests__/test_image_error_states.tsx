import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ImagePanel } from "@/components/dashboard/playground/ImagePanel";
import { renderWithStore } from "@/lib/testing/renderWithStore";
import { stubHttp, apiError, type HttpStub, type StubbedResponse } from "@/lib/testing/stubHttp";
import {
  clearPlaygroundStorage,
  playgroundRoutes,
  seedPlaygroundKey,
} from "@/lib/testing/playgroundFixtures";

let http: HttpStub;

beforeEach(() => {
  clearPlaygroundStorage();
  seedPlaygroundKey();
});
afterEach(() => http?.restore());

/** Render with the image endpoint answering however this test needs it to. */
async function generateWith(response: StubbedResponse) {
  http = stubHttp(playgroundRoutes({ "POST /v1/images/generations": response }));
  renderWithStore(<ImagePanel />);
  await userEvent.type(screen.getByLabelText(/prompt/i), "a red panda");
  await userEvent.click(screen.getByRole("button", { name: /generate/i }));
}

describe("ImagePanel error states", () => {
  it("402 shows the top-up / buy CTA to /pricing", async () => {
    await generateWith(apiError(402, "daily_quota_exceeded", "Quota exceeded"));

    const cta = await screen.findByRole("link", { name: /buy orvx or top up usdc/i });
    expect(cta).toHaveAttribute("href", "/pricing");
    // Headline and the server's own message both carry it.
    expect(screen.getAllByText(/quota exceeded/i).length).toBeGreaterThan(0);
  });

  it("403 shows the holder CTA to /tokenomics with the server's threshold", async () => {
    // Only reachable once ORVX_MINT_ADDRESS is configured. The threshold comes
    // from the server, so the UI must render its message rather than a guess.
    await generateWith(
      apiError(403, "not_holder", "Image generation requires holding at least 10000 ORVX."),
    );

    const cta = await screen.findByRole("link", { name: /learn about orvx/i });
    expect(cta).toHaveAttribute("href", "/tokenomics");
    expect(screen.getByText(/10000 ORVX/i)).toBeInTheDocument();
  });

  it("429 reads the reset time out of the response header", async () => {
    const resetAt = new Date(Date.now() + 2 * 60 * 60 * 1000 + 5 * 60 * 1000).toISOString();
    await generateWith({
      ...apiError(429, "daily_quota_exceeded", "Daily quota exceeded"),
      headers: { "X-Orvix-Quota-Reset": resetAt },
    });

    expect(await screen.findByText(/daily limit reached/i)).toBeInTheDocument();
    expect(screen.getByText(/resets in 2h 5m/i)).toBeInTheDocument();
  });

  it("503 shows the no-providers message", async () => {
    await generateWith(apiError(503, "no_image_provider", "No image providers are available"));

    expect(await screen.findByText(/no image providers available/i)).toBeInTheDocument();
  });

  it("rotates a rejected key and retries once", async () => {
    // A cached key that the server no longer accepts must not strand the user:
    // the panel mints a replacement and runs the request again.
    let attempt = 0;
    http = stubHttp(
      playgroundRoutes({
        "POST /v1/api-keys": {
          body: {
            id: "k2",
            key: "orvx_sk_fresh",
            prefix: "orvx_sk_fr",
            name: "Playground",
            created_at: new Date().toISOString(),
          },
        },
        "POST /v1/images/generations": () => {
          attempt += 1;
          return attempt === 1
            ? apiError(401, "invalid_api_key", "Invalid or revoked API key")
            : { body: { created: 1, data: [{ url: "https://orvix.network/images/x.png" }] } };
        },
      }),
    );
    renderWithStore(<ImagePanel />);
    await userEvent.type(screen.getByLabelText(/prompt/i), "a red panda");
    await userEvent.click(screen.getByRole("button", { name: /generate/i }));

    expect(await screen.findByRole("img", { name: /a red panda/i })).toBeInTheDocument();
    expect(http.sent("POST /v1/images/generations")).toHaveLength(2);
    // The retry carried the newly minted key, not the rejected one.
    expect(http.sent("POST /v1/images/generations")[1].authorization).toBe("Bearer orvx_sk_fresh");
  });
});
