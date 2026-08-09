/**
 * Substitute the network, and nothing above it.
 *
 * A unit test cannot call the live orchestrator, so HTTP is the one seam that
 * has to be replaced. Everything on the app side of it stays real: the routes
 * below are matched against the URL the API slice actually builds, and each
 * request is recorded so a test can assert on the method, path, body and
 * Authorization header that were really sent.
 *
 * Responses are real `Response` objects and must carry the shapes the
 * orchestrator returns — including its error envelope, which the app unwraps
 * itself.
 */

export interface RecordedRequest {
  method: string;
  path: string;
  body: unknown;
  authorization: string | null;
}

export interface StubbedResponse {
  status?: number;
  /** Omit for a 204-style empty body. */
  body?: unknown;
  /** Response headers. Some behaviour rides on these, e.g. X-Orvix-Quota-Reset. */
  headers?: Record<string, string>;
}

type Handler = StubbedResponse | ((request: RecordedRequest) => StubbedResponse);

/** Keys look like "GET /v1/provider/nodes". Paths are matched exactly. */
export type Routes = Record<string, Handler>;

export interface HttpStub {
  /** Every request the app made, in order. */
  requests: RecordedRequest[];
  /** Requests to one route, e.g. sent("POST /v1/provider/withdraw"). */
  sent(key: string): RecordedRequest[];
  restore(): void;
}

function errorEnvelope(code: string, message: string, extra: Record<string, unknown> = {}) {
  return { error: { code, message, request_id: "test-request-id", ...extra } };
}

/** Build the orchestrator's error body, so tests exercise the real unwrapping. */
export function apiError(
  status: number,
  code: string,
  message: string,
  extra: Record<string, unknown> = {},
): StubbedResponse {
  return { status, body: errorEnvelope(code, message, extra) };
}

export function stubHttp(routes: Routes): HttpStub {
  const requests: RecordedRequest[] = [];
  const original = globalThis.fetch;

  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    // The API slice hands fetchBaseQuery a Request; take everything from it.
    const request = input instanceof Request ? input : new Request(String(input), init);
    const url = new URL(request.url);
    const method = request.method.toUpperCase();
    const key = `${method} ${url.pathname}`;

    let body: unknown = undefined;
    const raw = await request.clone().text();
    if (raw) {
      try {
        body = JSON.parse(raw);
      } catch {
        body = raw;
      }
    }

    const recorded: RecordedRequest = {
      method,
      path: url.pathname + url.search,
      body,
      authorization: request.headers.get("Authorization"),
    };
    requests.push(recorded);

    const handler = routes[key] ?? routes[`${method} ${url.pathname + url.search}`];
    if (!handler) {
      throw new Error(
        `stubHttp: no route for "${key}". Declared: ${Object.keys(routes).join(", ") || "(none)"}`,
      );
    }

    const {
      status = 200,
      body: responseBody,
      headers = {},
    } = typeof handler === "function" ? handler(recorded) : handler;

    if (responseBody === undefined) {
      return new Response(null, { status, headers });
    }
    return new Response(JSON.stringify(responseBody), {
      status,
      headers: { "Content-Type": "application/json", ...headers },
    });
  }) as typeof fetch;

  return {
    requests,
    sent: (key) => requests.filter((r) => `${r.method} ${r.path.split("?")[0]}` === key),
    restore: () => {
      globalThis.fetch = original;
    },
  };
}
