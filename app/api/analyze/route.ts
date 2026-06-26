import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import {
  MODEL,
  MAX_TOKENS,
  getClient,
  documentBlocks,
  textFromResponse,
} from "@/lib/anthropic";
import { SYSTEM_PROMPT } from "@/lib/prompt";
import { parseDealMemo } from "@/lib/parse";
import type { DealDocument } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 120;

interface AnalyzeBody {
  listingText?: string;
  documents?: DealDocument[];
}

export async function POST(req: Request) {
  let body: AnalyzeBody;
  try {
    body = (await req.json()) as AnalyzeBody;
  } catch {
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400 },
    );
  }

  const listingText = (body.listingText ?? "").trim();
  const documents = body.documents ?? [];

  if (!listingText && documents.length === 0) {
    return NextResponse.json(
      { error: "Paste a listing or upload at least one document to analyze." },
      { status: 400 },
    );
  }

  // Documents first, then the listing text + instruction.
  const content: Anthropic.Messages.ContentBlockParam[] =
    documentBlocks(documents);

  const listingSection = listingText
    ? `LISTING TEXT:\n${listingText}`
    : "LISTING TEXT: (none provided — base your analysis on the attached documents)";

  content.push({
    type: "text",
    text: `${listingSection}\n\nAnalyze this acquisition opportunity and return the deal memo as a single JSON object matching the required schema.`,
  });

  try {
    const message = await getClient().messages.create({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content }],
    });

    const raw = textFromResponse(message);
    const memo = parseDealMemo(raw);
    return NextResponse.json({ memo });
  } catch (err) {
    return NextResponse.json(
      { error: toUserMessage(err) },
      { status: statusFor(err) },
    );
  }
}

function statusFor(err: unknown): number {
  if (err instanceof Anthropic.APIError && typeof err.status === "number") {
    return err.status;
  }
  return 500;
}

function toUserMessage(err: unknown): string {
  if (err instanceof Anthropic.AuthenticationError) {
    return "The Anthropic API key was rejected. Check ANTHROPIC_API_KEY in .env.local.";
  }
  if (err instanceof Anthropic.RateLimitError) {
    return "Rate limited by the Anthropic API. Wait a moment and try again.";
  }
  if (err instanceof Anthropic.APIError) {
    return `Anthropic API error (${err.status ?? "unknown"}): ${err.message}`;
  }
  if (err instanceof Error) {
    return err.message;
  }
  return "Unexpected error while analyzing the deal.";
}
