import type { DealMemo } from "./types";

/**
 * Strip markdown code fences (```json ... ``` or ``` ... ```) and any stray
 * prose around a JSON object, then return the raw JSON string.
 *
 * The model is instructed to return bare JSON, but defensive extraction keeps
 * the app robust if it wraps the object in fences or adds a sentence.
 */
export function stripJsonFences(raw: string): string {
  let text = raw.trim();

  // Remove a leading fence like ```json or ``` (with optional language tag).
  text = text.replace(/^```[a-zA-Z]*\s*\n?/, "");
  // Remove a trailing fence.
  text = text.replace(/\n?```\s*$/, "");
  text = text.trim();

  // If there is surrounding prose, extract the first balanced { ... } object.
  // A naive first-{ to last-} slice breaks when trailing prose contains a brace
  // (e.g. "...} Note: verify {licensing} details"), so scan with depth tracking
  // that respects strings and escapes.
  const obj = extractBalancedObject(text);
  return (obj ?? text).trim();
}

/**
 * Return the first complete, brace-balanced JSON object substring, or null if
 * there is no balanced object. String contents (including braces inside quotes)
 * and escape sequences are ignored while tracking depth.
 */
function extractBalancedObject(text: string): string | null {
  const start = text.indexOf("{");
  if (start === -1) return null;

  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let i = start; i < text.length; i++) {
    const ch = text[i];

    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (ch === "\\") {
        escaped = true;
      } else if (ch === '"') {
        inString = false;
      }
      continue;
    }

    if (ch === '"') {
      inString = true;
    } else if (ch === "{") {
      depth++;
    } else if (ch === "}") {
      depth--;
      if (depth === 0) {
        return text.slice(start, i + 1);
      }
    }
  }

  return null;
}

/** Parse and structurally validate the model output into a DealMemo. */
export function parseDealMemo(raw: string): DealMemo {
  const json = stripJsonFences(raw);

  let obj: unknown;
  try {
    obj = JSON.parse(json);
  } catch (err) {
    throw new Error(
      `Model did not return valid JSON. ${(err as Error).message}`,
    );
  }

  if (!isDealMemo(obj)) {
    throw new Error("Model JSON did not match the expected deal memo schema.");
  }

  return obj;
}

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function isStringArray(v: unknown): v is string[] {
  return Array.isArray(v) && v.every((x) => typeof x === "string");
}

const DIMENSIONS = [
  "financials",
  "operations",
  "market",
  "risk",
  "ai_durability",
] as const;

/** Minimal structural validator — enough to trust the render path. */
export function isDealMemo(obj: unknown): obj is DealMemo {
  if (!isObject(obj)) return false;

  if (!["GO", "CAUTION", "PASS"].includes(obj.verdict as string)) return false;
  if (typeof obj.verdict_rationale !== "string") return false;

  if (!isObject(obj.extracted_metrics)) return false;

  if (!isObject(obj.dimension_scores)) return false;
  for (const dim of DIMENSIONS) {
    const d = (obj.dimension_scores as Record<string, unknown>)[dim];
    if (!isObject(d)) return false;
    if (typeof d.score !== "number") return false;
    if (typeof d.notes !== "string") return false;
  }

  if (!isObject(obj.flags)) return false;
  const flags = obj.flags as Record<string, unknown>;
  if (!isStringArray(flags.red)) return false;
  if (!isStringArray(flags.yellow)) return false;
  if (!isStringArray(flags.green)) return false;

  if (!isObject(obj.license_risk)) return false;
  const lr = obj.license_risk as Record<string, unknown>;
  if (!["GREEN", "YELLOW", "RED"].includes(lr.status as string)) return false;
  if (typeof lr.detail !== "string") return false;
  if (typeof lr.mitigation !== "string") return false;

  if (!isStringArray(obj.diligence_priorities)) return false;
  if (typeof obj.regional_notes !== "string") return false;

  return true;
}
