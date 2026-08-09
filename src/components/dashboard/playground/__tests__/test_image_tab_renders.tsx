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

let http: HttpStub;

beforeEach(() => {
  clearPlaygroundStorage();
  seedPlaygroundKey();
  http = stubHttp(playgroundRoutes());
});
afterEach(() => http?.restore());

describe("Playground tabs", () => {
  it("renders both tab buttons and defaults to Chat", () => {
    renderWithStore(<Playground />);

    expect(screen.getByRole("button", { name: /chat/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /image/i })).toBeInTheDocument();
    // Chat panel content is visible by default.
    expect(screen.getByText(/send a message to run it through the network/i)).toBeInTheDocument();
  });

  it("switches to the Image tab on click", async () => {
    renderWithStore(<Playground />);

    await userEvent.click(screen.getByRole("button", { name: /image/i }));
    expect(screen.getByText(/your generated image will appear here/i)).toBeInTheDocument();
    // ...and reflects the choice in the URL.
    expect(window.location.search).toContain("mode=image");
  });
});
