import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Playground } from "@/components/dashboard/playground/Playground";
import { renderWithStore } from "@/lib/testing/renderWithStore";
import { stubHttp, type HttpStub } from "@/lib/testing/stubHttp";
import {
  clearPlaygroundStorage,
  playgroundRoutes,
  seedPlaygroundKey,
} from "@/lib/testing/playgroundFixtures";
import { IMAGE_MODELS, MODELS, VIDEO_PREVIEW } from "@/lib/constants/models";

let http: HttpStub;

beforeEach(() => {
  clearPlaygroundStorage();
  seedPlaygroundKey();
  // Declares only the chat/image/video-catalog routes. stubHttp throws on an
  // undeclared route, so any attempt to reach a video endpoint fails the test
  // loudly.
  http = stubHttp(playgroundRoutes());
});
afterEach(() => http?.restore());

async function openVideo() {
  renderWithStore(<Playground />);
  await userEvent.click(screen.getByRole("button", { name: /video/i }));
}

describe("video without a GPU on the network", () => {
  it("shows the honest waiting state rather than a form", async () => {
    await openVideo();
    expect(await screen.findByText(VIDEO_PREVIEW.summary)).toBeInTheDocument();
    expect(screen.getByText(VIDEO_PREVIEW.state)).toBeInTheDocument();
    expect(screen.getAllByText(/coming soon/i).length).toBeGreaterThan(0);
  });

  it("issues no request to any generation endpoint", async () => {
    await openVideo();
    // The panel checks the catalog (GET /v1/models) — that is the gate, and it
    // is allowed. Nothing else may leave: no video, chat, or image generation.
    expect(http.sent("POST /v1/videos/generations")).toHaveLength(0);
    expect(http.sent("GET /v1/videos/")).toHaveLength(0);
    expect(http.sent("POST /v1/chat/completions")).toHaveLength(0);
    expect(http.sent("POST /v1/images/generations")).toHaveLength(0);
  });

  it("leaves the prompt and button absent — there is no form to fail", async () => {
    await openVideo();
    expect(await screen.findByText(VIDEO_PREVIEW.summary)).toBeInTheDocument();
    expect(screen.queryByLabelText(/prompt/i)).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /generate video/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    expect(document.querySelector("video")).toBeNull();
    // A waitlist with no backend would silently discard what it collected.
    expect(screen.queryByRole("textbox", { name: /email/i })).not.toBeInTheDocument();
  });

  it("keeps the video model out of every picker that builds a request", () => {
    // The one constraint a future edit is most likely to break: adding it to a
    // shared list would put an unservable model in a real request.
    expect(MODELS.map((m) => m.id)).not.toContain(VIDEO_PREVIEW.id);
    expect(IMAGE_MODELS.map((m) => m.id)).not.toContain(VIDEO_PREVIEW.id);
  });
});
