"use client";

import { useState } from "react";
import IntakeForm, {
  type DocEntry,
  notAcceptedNames,
} from "./IntakeForm";
import ProgressIndicator from "./ProgressIndicator";
import DealMemoView from "./DealMemoView";
import FollowUpChat from "./FollowUpChat";
import { fileToDealDocument } from "@/lib/clientFiles";
import type { ChatMessage, DealDocument, DealMemo } from "@/lib/types";

type Status = "idle" | "analyzing" | "done";

let docCounter = 0;

export default function Screener() {
  const [listingText, setListingText] = useState("");
  const [docs, setDocs] = useState<DocEntry[]>([]);

  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [memo, setMemo] = useState<DealMemo | null>(null);

  // The exact inputs the memo was produced from, frozen so follow-up Q&A keeps
  // full context even if the user edits the intake form afterward.
  const [context, setContext] = useState<{
    listingText: string;
    documents: DealDocument[];
  } | null>(null);

  const [chat, setChat] = useState<ChatMessage[]>([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);

  async function handleAddFiles(files: FileList | File[]) {
    const rejected = notAcceptedNames(files);
    if (rejected.length) {
      setError(
        `Unsupported file type${rejected.length > 1 ? "s" : ""}: ${rejected.join(", ")}. Use PDF or image files.`,
      );
    }
    const accepted = Array.from(files).filter((f) =>
      ["application/pdf", "image/png", "image/jpeg", "image/gif", "image/webp"].includes(
        f.type,
      ),
    );

    const entries = await Promise.all(
      accepted.map(async (f): Promise<DocEntry> => {
        const doc = await fileToDealDocument(f);
        return { ...doc, id: `doc-${docCounter++}`, size: f.size };
      }),
    );
    // De-duplicate by name+size so re-adding the same file doesn't double the
    // document (and its token cost) in the request.
    setDocs((prev) => {
      const seen = new Set(prev.map((d) => `${d.name}:${d.size}`));
      const fresh = entries.filter((e) => {
        const key = `${e.name}:${e.size}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
      return [...prev, ...fresh];
    });
  }

  function handleRemoveDoc(id: string) {
    setDocs((prev) => prev.filter((d) => d.id !== id));
  }

  async function handleAnalyze() {
    setStatus("analyzing");
    setError(null);
    setMemo(null);
    setChat([]);
    setChatError(null);

    const documents: DealDocument[] = docs.map((d) => ({
      name: d.name,
      mediaType: d.mediaType,
      data: d.data,
    }));
    const frozenListing = listingText;

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingText: frozenListing, documents }),
      });
      const json = await readJson(res);
      if (!res.ok) throw new Error(json.error ?? "Analysis failed.");

      setMemo(json.memo as DealMemo);
      setContext({ listingText: frozenListing, documents });
      setStatus("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed.");
      setStatus("idle");
    }
  }

  async function handleSendQuestion(question: string) {
    if (!memo || !context) return;
    const nextThread: ChatMessage[] = [
      ...chat,
      { role: "user", content: question },
    ];
    setChat(nextThread);
    setChatLoading(true);
    setChatError(null);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listingText: context.listingText,
          documents: context.documents,
          memo,
          messages: nextThread,
        }),
      });
      const json = await readJson(res);
      if (!res.ok) throw new Error(json.error ?? "Could not answer.");

      setChat((prev) => [
        ...prev,
        { role: "assistant", content: json.reply as string },
      ]);
    } catch (err) {
      setChatError(err instanceof Error ? err.message : "Could not answer.");
      // Drop the unanswered user message so the thread can be retried cleanly.
      // Match by identity so a concurrently-resolved reply isn't removed.
      setChat((prev) =>
        prev.length && prev[prev.length - 1] === nextThread[nextThread.length - 1]
          ? prev.slice(0, -1)
          : prev,
      );
    } finally {
      setChatLoading(false);
    }
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      {/* Left: intake */}
      <div className="lg:col-span-4 xl:col-span-3">
        <div className="lg:sticky lg:top-6">
          <IntakeForm
            listingText={listingText}
            setListingText={setListingText}
            docs={docs}
            onAddFiles={handleAddFiles}
            onRemoveDoc={handleRemoveDoc}
            onAnalyze={handleAnalyze}
            loading={status === "analyzing"}
          />
          {error && (
            <div className="mt-3 rounded-md border border-verdict-pass/30 bg-verdict-pass/10 px-3 py-2.5 text-sm text-verdict-pass">
              {error}
            </div>
          )}
        </div>
      </div>

      {/* Right: results */}
      <div className="lg:col-span-8 xl:col-span-9">
        {status === "analyzing" && (
          <ProgressIndicator docCount={docs.length} />
        )}

        {status === "idle" && !error && <EmptyState />}

        {status === "done" && memo && (
          <div className="flex flex-col gap-6">
            <DealMemoView memo={memo} />
            <FollowUpChat
              messages={chat}
              loading={chatLoading}
              error={chatError}
              onSend={handleSendQuestion}
            />
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Read a fetch Response as JSON, tolerating non-JSON error bodies (proxy 5xx
 * HTML, empty timeout responses). Falls back to a status-derived message so the
 * raw SyntaxError is never surfaced to the user.
 */
async function readJson(
  res: Response,
): Promise<{ error?: string; [key: string]: unknown }> {
  const text = await res.text();
  if (!text) {
    return res.ok ? {} : { error: `Request failed (HTTP ${res.status}).` };
  }
  try {
    return JSON.parse(text);
  } catch {
    return {
      error: res.ok
        ? "Received a malformed response from the server."
        : `Request failed (HTTP ${res.status}).`,
    };
  }
}

function EmptyState() {
  return (
    <div className="panel flex min-h-[24rem] flex-col items-center justify-center gap-4 p-10 text-center">
      <div className="font-mono text-4xl text-accent/40">⬡</div>
      <h2 className="font-mono text-sm uppercase tracking-[0.18em] text-slate-400">
        Awaiting Deal Input
      </h2>
      <p className="max-w-md text-sm leading-relaxed text-slate-500">
        Paste a listing teaser or broker email and attach any post-NDA
        documents. The screener returns a structured GO / CAUTION / PASS memo:
        verdict, extracted metrics, five dimension scores, license risk, flags,
        and prioritized diligence.
      </p>
      <div className="mt-2 flex flex-wrap justify-center gap-2 font-mono text-[11px] text-slate-600">
        <span className="rounded border border-white/10 px-2 py-1">
          $1.5M–$5M
        </span>
        <span className="rounded border border-white/10 px-2 py-1">
          DE / PA / MD
        </span>
        <span className="rounded border border-white/10 px-2 py-1">
          Any industry
        </span>
      </div>
    </div>
  );
}
