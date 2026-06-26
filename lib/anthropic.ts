import Anthropic from "@anthropic-ai/sdk";
import type { DealDocument } from "./types";

export const MODEL = "claude-sonnet-4-6";
export const MAX_TOKENS = 4000;

let client: Anthropic | null = null;

/** Lazily construct the client so a missing key surfaces as a handled error. */
export function getClient(): Anthropic {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error(
      "ANTHROPIC_API_KEY is not set. Add it to .env.local (see .env.local.example).",
    );
  }
  if (!client) {
    client = new Anthropic({ apiKey });
  }
  return client;
}

const SUPPORTED_IMAGE_TYPES = [
  "image/png",
  "image/jpeg",
  "image/gif",
  "image/webp",
] as const;

/**
 * Turn uploaded documents into Anthropic content blocks. PDFs become
 * `document` blocks, images become `image` blocks. Per the API guidance,
 * documents/images are placed before the accompanying text block by the caller.
 */
export function documentBlocks(
  documents: DealDocument[],
): Anthropic.Messages.ContentBlockParam[] {
  const blocks: Anthropic.Messages.ContentBlockParam[] = [];

  for (const doc of documents) {
    if (doc.mediaType === "application/pdf") {
      blocks.push({
        type: "document",
        source: {
          type: "base64",
          media_type: "application/pdf",
          data: doc.data,
        },
        title: doc.name,
      });
    } else if (
      (SUPPORTED_IMAGE_TYPES as readonly string[]).includes(doc.mediaType)
    ) {
      blocks.push({
        type: "image",
        source: {
          type: "base64",
          media_type: doc.mediaType as (typeof SUPPORTED_IMAGE_TYPES)[number],
          data: doc.data,
        },
      });
    }
    // Unsupported media types are silently skipped; the route validates inputs.
  }

  return blocks;
}

/** Concatenate all text blocks from a model response. */
export function textFromResponse(message: Anthropic.Messages.Message): string {
  return message.content
    .filter(
      (b): b is Anthropic.Messages.TextBlock => b.type === "text",
    )
    .map((b) => b.text)
    .join("");
}
