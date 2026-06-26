import { describe, it, expect } from "vitest";
import { stripJsonFences, parseDealMemo, isDealMemo } from "./parse";
import type { DealMemo } from "./types";

const validMemo: DealMemo = {
  verdict: "CAUTION",
  verdict_rationale: "Solid margins but heavy owner dependence.",
  extracted_metrics: {
    asking_price: "$3.2M",
    revenue_ttm: "$4.1M",
    ebitda_or_sde: "$900K",
    asking_multiple: "3.6x",
    business_type: "HVAC service",
    employee_count: "18",
    years_in_operation: "22",
  },
  dimension_scores: {
    financials: { score: 7, notes: "Healthy SDE margin." },
    operations: { score: 4, notes: "Owner runs dispatch." },
    market: { score: 8, notes: "Fragmented local market." },
    risk: { score: 5, notes: "Top customer ~12%." },
    ai_durability: { score: 9, notes: "Licensed, physical labor." },
  },
  flags: {
    red: [],
    yellow: ["Owner holds the master license."],
    green: ["Recurring maintenance contracts."],
  },
  license_risk: {
    status: "YELLOW",
    detail: "Seller is the sole master license holder, staying 18 months.",
    mitigation: "Structure an earnout and build a licensed bench before close.",
  },
  diligence_priorities: ["Verify SDE add-backs", "Confirm license transfer path"],
  regional_notes: "PA requires a master HVAC license in many municipalities.",
};

const validJson = JSON.stringify(validMemo);

describe("stripJsonFences", () => {
  it("returns bare JSON unchanged", () => {
    expect(stripJsonFences(validJson)).toBe(validJson);
  });

  it("strips ```json fences", () => {
    const fenced = "```json\n" + validJson + "\n```";
    expect(JSON.parse(stripJsonFences(fenced))).toEqual(validMemo);
  });

  it("strips bare ``` fences", () => {
    const fenced = "```\n" + validJson + "\n```";
    expect(JSON.parse(stripJsonFences(fenced))).toEqual(validMemo);
  });

  it("slices out surrounding prose", () => {
    const noisy = `Here is the memo you asked for:\n${validJson}\nLet me know if you need anything else.`;
    expect(JSON.parse(stripJsonFences(noisy))).toEqual(validMemo);
  });

  it("handles leading/trailing whitespace", () => {
    expect(JSON.parse(stripJsonFences(`\n\n   ${validJson}   \n`))).toEqual(
      validMemo,
    );
  });

  it("extracts a balanced object when trailing prose contains braces", () => {
    const noisy = `Here is the memo:\n${validJson}\nNote: verify {licensing} details.`;
    expect(JSON.parse(stripJsonFences(noisy))).toEqual(validMemo);
  });

  it("does not capture braces inside string values", () => {
    const memoWithBraces = {
      ...validMemo,
      regional_notes: "PA licensing { see board } applies here.",
    };
    const json = JSON.stringify(memoWithBraces);
    expect(JSON.parse(stripJsonFences(json))).toEqual(memoWithBraces);
  });
});

describe("parseDealMemo", () => {
  it("parses a valid bare memo", () => {
    expect(parseDealMemo(validJson)).toEqual(validMemo);
  });

  it("parses a fenced memo", () => {
    expect(parseDealMemo("```json\n" + validJson + "\n```")).toEqual(validMemo);
  });

  it("throws on invalid JSON", () => {
    expect(() => parseDealMemo("not json at all")).toThrow();
  });

  it("throws when a required field is missing", () => {
    const broken = { ...validMemo } as Partial<DealMemo>;
    delete broken.verdict;
    expect(() => parseDealMemo(JSON.stringify(broken))).toThrow(/schema/i);
  });

  it("throws on an invalid verdict value", () => {
    const broken = { ...validMemo, verdict: "MAYBE" };
    expect(() => parseDealMemo(JSON.stringify(broken))).toThrow(/schema/i);
  });
});

describe("isDealMemo", () => {
  it("accepts a valid memo", () => {
    expect(isDealMemo(validMemo)).toBe(true);
  });

  it("rejects a non-object", () => {
    expect(isDealMemo("nope")).toBe(false);
    expect(isDealMemo(null)).toBe(false);
    expect(isDealMemo([])).toBe(false);
  });

  it("rejects a memo missing a dimension", () => {
    const broken = JSON.parse(JSON.stringify(validMemo));
    delete broken.dimension_scores.market;
    expect(isDealMemo(broken)).toBe(false);
  });

  it("rejects when flags arrays are not string arrays", () => {
    const broken = JSON.parse(JSON.stringify(validMemo));
    broken.flags.red = [{ note: "bad shape" }];
    expect(isDealMemo(broken)).toBe(false);
  });

  it("rejects an out-of-enum license status", () => {
    const broken = JSON.parse(JSON.stringify(validMemo));
    broken.license_risk.status = "ORANGE";
    expect(isDealMemo(broken)).toBe(false);
  });
});
