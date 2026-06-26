"use client";

import { useEffect, useRef, useState } from "react";
import type { ChatMessage } from "@/lib/types";

export default function FollowUpChat({
  messages,
  loading,
  error,
  onSend,
}: {
  messages: ChatMessage[];
  loading: boolean;
  error: string | null;
  onSend: (question: string) => void;
}) {
  const [draft, setDraft] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  function submit() {
    const q = draft.trim();
    if (!q || loading) return;
    onSend(q);
    setDraft("");
  }

  return (
    <div className="panel panel-pad flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <span className="h-2 w-2 rounded-full bg-accent" />
        <span className="label-mono">Follow-up Q&amp;A</span>
      </div>

      <p className="text-xs text-slate-500">
        Ask anything about this deal — full listing, documents, and memo context
        are preserved in the thread.
      </p>

      {messages.length > 0 && (
        <div className="flex max-h-[28rem] flex-col gap-3 overflow-y-auto pr-1">
          {messages.map((m, i) => (
            <div
              key={i}
              className={
                m.role === "user" ? "flex justify-end" : "flex justify-start"
              }
            >
              <div
                className={
                  "max-w-[85%] whitespace-pre-wrap rounded-lg px-3.5 py-2.5 text-sm leading-relaxed " +
                  (m.role === "user"
                    ? "rounded-br-sm bg-accent/15 text-slate-100"
                    : "rounded-bl-sm border border-white/5 bg-ink-950/60 text-slate-200")
                }
              >
                {m.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="rounded-lg rounded-bl-sm border border-white/5 bg-ink-950/60 px-3.5 py-2.5">
                <span className="inline-flex gap-1 font-mono text-accent">
                  <span className="animate-bounce [animation-delay:-0.2s]">
                    .
                  </span>
                  <span className="animate-bounce [animation-delay:-0.1s]">
                    .
                  </span>
                  <span className="animate-bounce">.</span>
                </span>
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>
      )}

      {error && (
        <div className="rounded-md border border-verdict-pass/30 bg-verdict-pass/10 px-3 py-2 text-sm text-verdict-pass">
          {error}
        </div>
      )}

      <div className="flex items-end gap-2">
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
          rows={2}
          placeholder="e.g. What's the biggest risk to the SDE figure? How would you structure the earnout?"
          className="w-full resize-none rounded-md border border-white/10 bg-ink-950/60 p-3 text-sm leading-relaxed text-slate-100 placeholder:text-slate-600 focus:border-accent/50 focus:outline-none focus:ring-1 focus:ring-accent/40"
        />
        <button
          type="button"
          onClick={submit}
          disabled={loading || draft.trim().length === 0}
          className={
            "shrink-0 rounded-md px-4 py-3 font-mono text-sm font-semibold transition-colors " +
            (loading || draft.trim().length === 0
              ? "cursor-not-allowed bg-ink-700 text-slate-500"
              : "bg-accent text-ink-950 hover:bg-accent-glow")
          }
        >
          Send
        </button>
      </div>
    </div>
  );
}
