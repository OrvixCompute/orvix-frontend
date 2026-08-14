import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { VideoPanel } from "@/components/dashboard/playground/VideoPanel";
import { renderWithStore } from "@/lib/testing/renderWithStore";
import { stubHttp, apiError, type HttpStub, type StubbedResponse, type Routes } from "@/lib/testing/stubHttp";
import {
  clearPlaygroundStorage,
  modelsCatalog,
  seedPlaygroundKey,
} from "@/lib/testing/playgroundFixtures";

let http: HttpStub;

beforeEach(() => {
  clearPlaygroundStorage();
  seedPlaygroundKey();
});
afterEach(() => http?.restore());

/** A successful synchronous video response, OpenAI images-style. */
function videoSuccess(url = "https://orvix.network/videos/clip.mp4"): StubbedResponse {
  return {
    body: { created: 1_754_700_000, data: [{ url }] },
    headers: {
      "X-Orvix-Quota-Remaining": "4",
      "X-Orvix-Quota-Reset": new Date(Date.now() + 3_600_000).toISOString(),
    },
  };
}

/** Render with the catalog advertising video as available. */
function renderReady(extra: Routes = {}) {
  http = stubHttp({
    "GET /v1/models": modelsCatalog({ withVideo: true, videoAvailable: true }),
    ...extra,
  });
  renderWithStore(<VideoPanel />);
  return http;
}

async function submitPrompt(prompt = "a drone shot over a coastline") {
  // The gate resolves asynchronously (GET /v1/models); wait for the form.
  await userEvent.type(await screen.findByLabelText(/prompt/i), prompt);
  await userEvent.click(screen.getByRole("button", { name: /generate video/i }));
}

describe("VideoPanel when the network serves video", () => {
  it("shows the active form when the catalog lists a video model", async () => {
    renderReady();
    expect(await screen.findByLabelText(/prompt/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/duration/i)).toBeInTheDocument();
    // The button exists but is disabled until a valid prompt is typed.
    expect(screen.getByRole("button", { name: /generate video/i })).toBeDisabled();
    await userEvent.type(screen.getByLabelText(/prompt/i), "a drone shot");
    expect(screen.getByRole("button", { name: /generate video/i })).toBeEnabled();
  });

  it("submits the prompt and renders the returned clip", async () => {
    renderReady({
      "POST /v1/videos/generations": videoSuccess(),
    });
    await submitPrompt();

    // The submit carries the model, prompt, and the frame count for the duration.
    const submits = http.sent("POST /v1/videos/generations");
    expect(submits).toHaveLength(1);
    expect(submits[0].authorization).toBe("Bearer orvx_sk_playground");
    expect(submits[0].body).toMatchObject({
      model: "orvix-video-1",
      prompt: "a drone shot over a coastline",
      num_frames: 97,
      fps: 24,
    });

    // The response URL becomes the <video> source directly.
    const video = await waitFor(() => {
      const el = document.querySelector("video");
      if (!el) throw new Error("video player did not render");
      return el;
    });
    expect(video.getAttribute("src")).toBe("https://orvix.network/videos/clip.mp4");
  });

  it("maps a 10s duration to the longer frame count", async () => {
    renderReady({
      "POST /v1/videos/generations": videoSuccess(),
    });
    await userEvent.selectOptions(await screen.findByLabelText(/duration/i), "10");
    await submitPrompt("slow motion waves");

    const submits = http.sent("POST /v1/videos/generations");
    expect(submits).toHaveLength(1);
    expect(submits[0].body).toMatchObject({ num_frames: 193 });
  });

  it("shows the waiting-for-GPU state when the model is listed but unavailable", async () => {
    http = stubHttp({
      "GET /v1/models": modelsCatalog({ withVideo: true, videoAvailable: false }),
    });
    renderWithStore(<VideoPanel />);

    expect(await screen.findByText(/no node is serving it right now/i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/prompt/i)).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /generate video/i })).not.toBeInTheDocument();
  });

  it("surfaces a 503 when no video provider is available", async () => {
    renderReady({
      "POST /v1/videos/generations": apiError(503, "no_video_provider", "No video providers"),
    });
    await submitPrompt();

    expect(await screen.findByText(/no video providers available/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /retry/i })).toBeInTheDocument();
  });

  it("rotates a rejected key and retries the submit once", async () => {
    let attempts = 0;
    renderReady({
      "POST /v1/api-keys": {
        body: {
          id: "k2",
          key: "orvx_sk_fresh",
          prefix: "orvx_sk_fr",
          name: "Playground",
          created_at: new Date().toISOString(),
        },
      },
      "POST /v1/videos/generations": () => {
        attempts += 1;
        if (attempts === 1) return apiError(401, "invalid_api_key", "Invalid or revoked API key");
        return videoSuccess("https://orvix.network/videos/c.mp4");
      },
    });
    await submitPrompt();

    expect(http.sent("POST /v1/videos/generations")).toHaveLength(2);
    expect(http.sent("POST /v1/videos/generations")[1].authorization).toBe("Bearer orvx_sk_fresh");
    // The retried submit returns a clip URL that becomes the player source.
    const video = await waitFor(() => {
      const el = document.querySelector("video");
      if (!el) throw new Error("video player did not render");
      return el;
    });
    expect(video.getAttribute("src")).toBe("https://orvix.network/videos/c.mp4");
  });
});
