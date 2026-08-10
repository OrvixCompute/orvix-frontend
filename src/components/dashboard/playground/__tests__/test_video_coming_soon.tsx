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
  // Declares only the chat/image routes. stubHttp throws on an undeclared
  // route, so any attempt to reach a video endpoint fails the test loudly.
  http = stubHttp(playgroundRoutes());
});
afterEach(() => http?.restore());

async function openVideo() {
  renderWithStore(<Playground />);
  await userEvent.click(screen.getByRole("button", { name: /video/i }));
}

describe("video is advertised without being offered", () => {
  it("marks the tab as not yet available", () => {
    renderWithStore(<Playground />);
    const tab = screen.getByRole("button", { name: /video/i });
    expect(tab).toHaveTextContent(/soon/i);
  });

  it("explains the feature and its real state instead of failing", async () => {
    await openVideo();
    expect(screen.getByText(VIDEO_PREVIEW.summary)).toBeInTheDocument();
    expect(screen.getByText(VIDEO_PREVIEW.state)).toBeInTheDocument();
    expect(screen.getAllByText(/coming soon/i).length).toBeGreaterThan(0);
  });

  it("issues no request when the tab is opened", async () => {
    await openVideo();
    // Chat and image may have fetched their own data; nothing may have gone out
    // for video, and the model id must never appear in a request.
    const bodies = JSON.stringify(http.requests);
    expect(bodies).not.toContain(VIDEO_PREVIEW.id);
    expect(http.sent("POST /v1/chat/completions")).toHaveLength(0);
    expect(http.sent("POST /v1/images/generations")).toHaveLength(0);
  });

  it("leaves the prompt inert — no typing, no submit", async () => {
    await openVideo();
    const prompt = screen.getByLabelText(/prompt/i);
    expect(prompt).toBeDisabled();

    await userEvent.type(prompt, "a drone shot");
    expect(prompt).toHaveValue("");

    const button = screen.getByRole("button", { name: /not available yet/i });
    expect(button).toBeDisabled();
    await userEvent.click(button);
    expect(http.requests.filter((r) => r.method === "POST")).toHaveLength(0);
  });

  it("shows no fabricated result or progress", async () => {
    await openVideo();
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
