/**
 * Unwrap the orchestrator's error envelope.
 *
 * Every failure comes back in one shape:
 *   { "error": { "code": "…", "message": "…", "request_id": "…" } }
 * plus, for some codes, extra fields alongside them (`retry_after_seconds`,
 * `current_stake`, …). The message is written for humans and is almost always
 * more useful than anything the UI could invent, so render it; the request_id is
 * what makes a user's report traceable in the orchestrator logs, so log it.
 */

export interface ApiError {
  /** HTTP status, or null when the request never reached the server. */
  status: number | null;
  /** Stable machine-readable code, e.g. "not_a_provider". Null if absent. */
  code: string | null;
  /** Server-authored, safe to render. Falls back to a generic line. */
  message: string;
  /** Correlates with the orchestrator logs. Log it; do not make it the headline. */
  requestId: string | null;
  /** Any extra fields the code carries, e.g. current_stake / required. */
  details: Record<string, unknown>;
}

const FALLBACK = "Something went wrong. Please try again.";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

/**
 * Normalize anything RTK Query can reject with — a FetchBaseQueryError carrying
 * the envelope, a network failure with no body, or a SerializedError.
 */
export function toApiError(error: unknown, fallback: string = FALLBACK): ApiError {
  const empty: ApiError = {
    status: null,
    code: null,
    message: fallback,
    requestId: null,
    details: {},
  };
  if (!isRecord(error)) return empty;

  const status = typeof error.status === "number" ? error.status : null;
  const data = error.data;

  // The envelope. Everything except code/message/request_id is passed through as
  // details, so callers can branch on e.g. insufficient_stake's current_stake.
  if (isRecord(data) && isRecord(data.error)) {
    const env = data.error;
    const { code, message, request_id, ...rest } = env;
    return {
      status,
      code: typeof code === "string" ? code : null,
      message: typeof message === "string" && message.trim() ? message : fallback,
      requestId: typeof request_id === "string" ? request_id : null,
      details: rest,
    };
  }

  // FastAPI's own shape, for anything raised before our handlers run.
  if (isRecord(data) && typeof data.detail === "string") {
    return { ...empty, status, message: data.detail };
  }

  // A SerializedError (thrown, never dispatched) still has a message worth keeping.
  if (typeof error.message === "string" && error.message.trim()) {
    return { ...empty, status, message: error.message };
  }

  return { ...empty, status };
}

/**
 * Record a failure with the identifier support will ask for. Deliberately
 * console-only: the request_id belongs in the logs, not in the user's face.
 */
export function logApiError(context: string, error: ApiError): void {
  console.error(`[orvix] ${context}`, {
    status: error.status,
    code: error.code,
    request_id: error.requestId,
    message: error.message,
  });
}

/** Unwrap, log, and hand back the rendered message in one step. */
export function reportApiError(context: string, error: unknown, fallback?: string): ApiError {
  const parsed = toApiError(error, fallback);
  logApiError(context, parsed);
  return parsed;
}
