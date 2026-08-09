import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ImagePanel } from "@/components/dashboard/playground/ImagePanel";
import { renderWithStore } from "@/lib/testing/renderWithStore";
import { stubHttp, type HttpStub } from "@/lib/testing/stubHttp";
import {
  clearPlaygroundStorage,
  playgroundRoutes,
  seedPlaygroundKey,
} from "@/lib/testing/playgroundFixtures";
import { DEFAULT_IMAGE_MODEL, sizesForModel } from "@/lib/constants/models";

let http: HttpStub;

beforeEach(() => {
  clearPlaygroundStorage();
  seedPlaygroundKey();
  http = stubHttp(playgroundRoutes());
});
afterEach(() => http?.restore());

describe("ImagePanel form validation", () => {
  it("disables Generate until the prompt meets the minimum length", async () => {
    renderWithStore(<ImagePanel />);
    const generate = screen.getByRole("button", { name: /generate/i });
    expect(generate).toBeDisabled();

    const prompt = screen.getByLabelText(/prompt/i);
    await userEvent.type(prompt, "hi"); // 2 chars — below the 3-char minimum
    expect(screen.getByText(/minimum 3 characters/i)).toBeInTheDocument();
    expect(generate).toBeDisabled();

    await userEvent.type(prompt, "!"); // now 3 chars
    expect(generate).toBeEnabled();
    // Nothing was dispatched while the form was invalid.
    expect(http.sent("POST /v1/images/generations")).toHaveLength(0);
  });

  it("offers only the sizes the selected model can produce", () => {
    renderWithStore(<ImagePanel />);
    const size = screen.getByLabelText(/size/i) as HTMLSelectElement;
    const allowed = sizesForModel(DEFAULT_IMAGE_MODEL);

    expect(size.options).toHaveLength(allowed.length);
    // Sizes past the model's max_size would come back as 400 invalid_size.
    expect(Array.from(size.options).map((o) => o.value)).toEqual(allowed);
    expect(size.value).toBe("1024x1024");
  });

  it("drops a size the newly selected model cannot produce", async () => {
    renderWithStore(<ImagePanel />);
    const model = screen.getByLabelText(/model/i) as HTMLSelectElement;
    const size = screen.getByLabelText(/size/i) as HTMLSelectElement;

    // flux-schnell reaches 1536x1536; orvix-image-1 stops at 1024x1024.
    await userEvent.selectOptions(model, "flux-schnell");
    await userEvent.selectOptions(size, "1536x1536");
    expect(size.value).toBe("1536x1536");

    await userEvent.selectOptions(model, "orvix-image-1");
    expect(size.value).toBe("1024x1024");
  });

  it("sends the chosen model and size to the API", async () => {
    http.restore();
    http = stubHttp(
      playgroundRoutes({
        "POST /v1/images/generations": {
          body: { created: 1, data: [{ url: "https://orvix.network/images/x.png" }] },
        },
      }),
    );
    renderWithStore(<ImagePanel />);

    await userEvent.selectOptions(screen.getByLabelText(/model/i), "flux-schnell");
    await userEvent.selectOptions(screen.getByLabelText(/size/i), "1536x1536");
    await userEvent.type(screen.getByLabelText(/prompt/i), "a red panda");
    await userEvent.click(screen.getByRole("button", { name: /generate/i }));

    await screen.findByRole("img", { name: /a red panda/i });
    expect(http.sent("POST /v1/images/generations")[0].body).toMatchObject({
      model: "flux-schnell",
      size: "1536x1536",
      prompt: "a red panda",
    });
  });
});
