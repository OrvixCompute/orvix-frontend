import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ProviderAccessCard } from "@/components/dashboard/provider/ProviderAccessCard";
import { renderWithStore } from "@/lib/testing/renderWithStore";
import { stubHttp, apiError, type HttpStub } from "@/lib/testing/stubHttp";

let http: HttpStub;
afterEach(() => http?.restore());

const SECRET = {
  provider_id: "8d1f0c6a-1111-2222-3333-444455556666",
  node_secret: "s3cr3t-token-value",
};

describe("provider access card follows is_provider", () => {
  it("offers registration to an account that is not a provider", () => {
    http = stubHttp({});
    renderWithStore(<ProviderAccessCard registered={false} />);

    expect(screen.getByRole("button", { name: /become a provider/i })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /new secret/i })).not.toBeInTheDocument();
  });

  it("offers rotation to a registered provider with no nodes yet", () => {
    // The case that made inference wrong: registered, but nothing connected and
    // nothing earned, so there was no evidence to infer provider status from.
    http = stubHttp({});
    renderWithStore(<ProviderAccessCard registered />);

    expect(screen.getByRole("button", { name: /new secret/i })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /become a provider/i })).not.toBeInTheDocument();
  });

  it("withholds the action until the flag has loaded", () => {
    // Defaulting to "not a provider" would show an existing provider a button
    // that silently rotates their live secret and drops a running node.
    http = stubHttp({});
    renderWithStore(<ProviderAccessCard registered={false} statusLoading />);

    expect(screen.queryByRole("button", { name: /become a provider/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /new secret/i })).not.toBeInTheDocument();
    expect(screen.getByText(/provider access/i)).toBeInTheDocument();
  });
});

describe("registering produces a runnable command", () => {
  it("assembles join with both credentials from the response", async () => {
    http = stubHttp({ "POST /v1/provider/register": { body: SECRET } });
    renderWithStore(<ProviderAccessCard registered={false} />);

    await userEvent.click(screen.getByRole("button", { name: /become a provider/i }));
    await userEvent.type(screen.getByLabelText(/display name/i), "My Rig");
    await userEvent.click(screen.getByRole("button", { name: /^register$/i }));

    // The whole point of the screen: one line, both flags, nothing to work out.
    expect(
      await screen.findByText(
        `orvix-node join --provider-id ${SECRET.provider_id} --node-secret ${SECRET.node_secret}`,
      ),
    ).toBeInTheDocument();
    expect(screen.getByText(/shown/i)).toBeInTheDocument();

    const [request] = http.sent("POST /v1/provider/register");
    expect(request.body).toEqual({ display_name: "My Rig" });
  });

  it("omits an empty display name rather than sending a blank one", async () => {
    http = stubHttp({ "POST /v1/provider/register": { body: SECRET } });
    renderWithStore(<ProviderAccessCard registered={false} />);

    await userEvent.click(screen.getByRole("button", { name: /become a provider/i }));
    await userEvent.click(screen.getByRole("button", { name: /^register$/i }));

    await screen.findByText(/connect your machine/i);
    expect(http.sent("POST /v1/provider/register")[0].body).toEqual({});
  });

  it("points a stake-blocked registration at staking instead of failing blank", async () => {
    // Only reachable if REQUIRE_STAKE_FOR_PROVIDER is switched back on.
    http = stubHttp({
      "POST /v1/provider/register": apiError(
        400,
        "insufficient_stake",
        "Provider registration requires staking at least 25000 ORVX.",
        { current_stake: "0", required: "25000" },
      ),
    });
    renderWithStore(<ProviderAccessCard registered={false} />);

    await userEvent.click(screen.getByRole("button", { name: /become a provider/i }));
    await userEvent.click(screen.getByRole("button", { name: /^register$/i }));

    expect(await screen.findByText(/requires staking at least 25000 orvx/i)).toBeInTheDocument();
    expect(screen.getByText(/staked 0 · required 25000/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /stake orvx to qualify/i })).toHaveAttribute(
      "href",
      "/staking",
    );
  });

  it("warns that rotation drops a node still using the old secret", async () => {
    http = stubHttp({ "POST /v1/provider/regenerate-secret": { body: SECRET } });
    renderWithStore(<ProviderAccessCard registered />);

    await userEvent.click(screen.getByRole("button", { name: /new secret/i }));
    await userEvent.click(screen.getByRole("button", { name: /issue new secret/i }));

    expect(await screen.findByText(/join --force/)).toBeInTheDocument();
    expect(http.sent("POST /v1/provider/regenerate-secret")).toHaveLength(1);
  });
});
