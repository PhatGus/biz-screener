import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import {
  MODEL,
  MAX_TOKENS,
  getClient,
  documentBlocks,
  textFromResponse,
} from "@/lib/anthropic";
import { CHAT_SYSTEM_PROMPT } from "@/lib/prompt";
import type { ChatMessage, DealDocument, DealMemo } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 120;

interface ChatBody {
  listingText?: string;
  documents?: DealDocument[];
  memo?: DealMemo;
  messages?: ChatMessage[];
}

export async function POST(req: Request) {
  let body: ChatBody;
  try {
    body = (await req.json()) as ChatBody;
  } catch {
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400 },
    );
  }

  const listingText = (body.listingText ?? "").trim();
  const documents = body.documents ?? [];
  const memo = body.memo;
  const history = body.messages ?? [];

  if (!memo) {
    return NextResponse.json(
      { error: "No prior analysis to discuss. Run an analysis first." },
      { status: 400 },
    );
  }
  // Validate the thread at the trust boundary: every entry must be a
  // well-formed user/assistant message with string content. This prevents an
  // unhandled deref on malformed input and stops invalid roles (e.g. "system")
  // or non-string content from reaching the Anthropic messages array.
  if (!history.every(isValidChatMessage)) {
    return NextResponse.json(
      { error: "Malformed conversation thread." },
      { status: 400 },
    );
  }
  if (history.length === 0 || history[history.length - 1].role !== "user") {
    return NextResponse.json(
      { error: "The last message must be a question from the user." },
      { status: 400 },
    );
  }

  // Reconstruct the full deal context: documents + listing as the first user
  // turn, the structured memo as the assistant's prior answer, then the
  // follow-up thread verbatim.
  const firstTurn: Anthropic.Messages.ContentBlockParam[] =
    documentBlocks(documents);
  firstTurn.push({
    type: "text",
    text: listingText
      ? `LISTING TEXT:\n${listingText}\n\nAnalyze this acquisition opportunity.`
      : "Analyze this acquisition opportunity based on the attached documents.",
  });

  const messages: Anthropic.Messages.MessageParam[] = [
    { role: "user", content: firstTurn },
    {
      role: "assistant",
      content: `Here is my structured deal memo:\n\n${JSON.stringify(
        memo,
        null,
        2,
      )}`,
    },
    ...history.map(
      (m): Anthropic.Messages.MessageParam => ({
        role: m.role,
        content: m.content,
      }),
    ),
  ];

  try {
    const message = await getClient().messages.create({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      system: CHAT_SYSTEM_PROMPT,
      messages,
    });

    const reply = textFromResponse(message);
    return NextResponse.json({ reply });
  } catch (err) {
    return NextResponse.json(
      { error: toUserMessage(err) },
      { status: statusFor(err) },
    );
  }
}

function isValidChatMessage(m: unknown): m is ChatMessage {
  return (
    typeof m === "object" &&
    m !== null &&
    ((m as ChatMessage).role === "user" ||
      (m as ChatMessage).role === "assistant") &&
    typeof (m as ChatMessage).content === "string"
  );
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
  return "Unexpected error while answering the question.";
}
