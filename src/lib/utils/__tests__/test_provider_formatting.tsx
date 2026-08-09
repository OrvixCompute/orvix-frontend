import { fillDailySeries, sumDaily } from "@/lib/utils/earnings";
import { formatUsdcAmount } from "@/lib/utils/format";
import { toApiError } from "@/lib/utils/apiError";

describe("formatUsdcAmount", () => {
  it("keeps amounts far below cent scale visible", () => {
    // The trap: toFixed(2) renders real provider income as "0.00".
    expect(formatUsdcAmount("0.000206")).toBe("0.000206");
  });

  it("never renders a non-zero amount as zero", () => {
    // Below the numeric(20,6) floor, so it should not occur — but it must not
    // read as an empty balance if it ever does.
    expect(formatUsdcAmount("0.0000005")).toBe("<0.000001");
  });

  it("trims trailing zeros but keeps cents", () => {
    expect(formatUsdcAmount("5")).toBe("5.00");
    expect(formatUsdcAmount("1.500000")).toBe("1.50");
  });

  it("distinguishes a true zero from a missing value", () => {
    expect(formatUsdcAmount("0")).toBe("0.00");
    expect(formatUsdcAmount(null)).toBe("—");
    expect(formatUsdcAmount(undefined)).toBe("—");
  });
});

describe("fillDailySeries", () => {
  const end = new Date("2026-08-09T12:00:00Z");

  it("expands a sparse series to one point per calendar day", () => {
    const filled = fillDailySeries(
      [{ date: "2026-08-09", amount: "0.000206", jobs_count: 3 }],
      30,
      end,
    );
    expect(filled).toHaveLength(30);
    expect(filled[29]).toEqual({ date: "2026-08-09", amount: 0.000206, jobs: 3 });
  });

  it("fills untouched days with real zeros rather than dropping them", () => {
    // Two days a week apart must sit seven slots apart, not adjacent — that gap
    // is the whole reason the series has to be expanded before charting.
    const filled = fillDailySeries(
      [
        { date: "2026-08-02", amount: "1", jobs_count: 1 },
        { date: "2026-08-09", amount: "2", jobs_count: 1 },
      ],
      30,
      end,
    );
    const first = filled.findIndex((p) => p.date === "2026-08-02");
    const second = filled.findIndex((p) => p.date === "2026-08-09");
    expect(second - first).toBe(7);
    expect(filled[first + 1].amount).toBe(0);
    expect(filled[first + 1].jobs).toBe(0);
  });

  it("runs the window forward in time and ends today", () => {
    const filled = fillDailySeries([], 30, end);
    expect(filled[0].date).toBe("2026-07-11");
    expect(filled[29].date).toBe("2026-08-09");
  });

  it("ignores days outside the window and sums duplicates", () => {
    const filled = fillDailySeries(
      [
        { date: "2020-01-01", amount: "99", jobs_count: 9 },
        { date: "2026-08-09", amount: "1", jobs_count: 1 },
        { date: "2026-08-09", amount: "2", jobs_count: 2 },
      ],
      30,
      end,
    );
    expect(sumDaily(filled)).toBe(3);
    expect(filled[29]).toEqual({ date: "2026-08-09", amount: 3, jobs: 3 });
  });

  it("survives a null series", () => {
    expect(fillDailySeries(null, 7, end)).toHaveLength(7);
    expect(sumDaily(fillDailySeries(undefined, 7, end))).toBe(0);
  });
});

describe("toApiError", () => {
  it("unwraps the orchestrator envelope", () => {
    const parsed = toApiError({
      status: 403,
      data: { error: { code: "not_a_provider", message: "Register first.", request_id: "abc123" } },
    });
    expect(parsed).toMatchObject({
      status: 403,
      code: "not_a_provider",
      message: "Register first.",
      requestId: "abc123",
    });
  });

  it("passes extra fields through as details", () => {
    // insufficient_stake carries the numbers the UI needs to point at staking.
    const parsed = toApiError({
      status: 400,
      data: {
        error: {
          code: "insufficient_stake",
          message: "Stake required.",
          request_id: "r1",
          current_stake: "0",
          required: "25000",
        },
      },
    });
    expect(parsed.details).toEqual({ current_stake: "0", required: "25000" });
  });

  it("falls back to a generic message when there is no body", () => {
    const parsed = toApiError({ status: 500 });
    expect(parsed.status).toBe(500);
    expect(parsed.message).toMatch(/went wrong/i);
    expect(parsed.requestId).toBeNull();
  });
});
