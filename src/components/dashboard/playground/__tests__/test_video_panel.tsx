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

// Poll fast in tests so a full job lifecycle completes within waitFor's budget.
jest.mock("@/lib/constants/models", () => {
  const actual = jest.requireActual("@/lib/constants/models");
  return { ...actual, VIDEO_POLL_INTERVAL_MS: 50 };
});

let http: HttpStub;

beforeEach(() => {
  clearPlaygroundStorage();
  seedPlaygroundKey();
});
afterEach(() => http?.restore());

/** A complete job lifecycle, driven by which route handler is hit first. */
function videoJob(overrides: Partial<StubbedResponse> = {}): StubbedResponse {
  return {
    body: {
      id: "job-1",
      status: "queued",
      progress: null,
      ...(typeof overrides.body === "object" && overrides.body ? overrides.body : {}),
    },
    ...overrides,
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

  it("submits the job and polls until the clip is ready", async () => {
    let polls = 0;
    renderReady({
      "POST /v1/videos/generations": {
        body: { id: "job-1", status: "queued", progress: null },
      },
      "GET /v1/videos/job-1": () => {
        polls += 1;
        if (polls === 1) return videoJob();
        return {
          body: {
            id: "job-1",
            status: "completed",
            progress: 100,
            video_url: "https://orvix.network/videos/clip.mp4",
          },
        };
      },
    });
    await submitPrompt();

    // The submit carries the model, prompt, and duration.
    const submits = http.sent("POST /v1/videos/generations");
    await waitFor(() => expect(submits).toHaveLength(1));
    expect(submits[0].authorization).toBe("Bearer orvx_sk_playground");
    expect(submits[0].body).toMatchObject({
      model: "orvix-video-1",
      prompt: "a drone shot over a coastline",
      duration_seconds: 5,
    });

    // The first poll lands on "queued" and shows the progress bar.
    expect(await screen.findByRole("progressbar")).toBeInTheDocument();
    expect(http.sent("GET /v1/videos/job-1").length).toBeGreaterThan(0);

    // The fast poll interval quickly reaches the completed job.
    const video = await waitFor(() => {
      const el = document.querySelector("video");
      if (!el) throw new Error("video player did not render");
      return el;
    });
    expect(video.getAttribute("src")).toBe("https://orvix.network/videos/clip.mp4");
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
        return { body: { id: "job-1", status: "queued", progress: null } };
      },
      "GET /v1/videos/job-1": {
        body: { id: "job-1", status: "completed", video_url: "https://orvix.network/videos/c.mp4" },
      },
    });
    await submitPrompt();

    expect(http.sent("POST /v1/videos/generations")).toHaveLength(2);
    expect(http.sent("POST /v1/videos/generations")[1].authorization).toBe("Bearer orvx_sk_fresh");
    // The retried submit lands, and the first poll completes the job.
    const video = await waitFor(() => {
      const el = document.querySelector("video");
      if (!el) throw new Error("video player did not render");
      return el;
    });
    expect(video.getAttribute("src")).toBe("https://orvix.network/videos/c.mp4");
  });
});
