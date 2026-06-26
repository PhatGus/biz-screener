"use client";

import { useRef, useState } from "react";
import {
  ACCEPT_ATTR,
  humanSize,
  isAccepted,
} from "@/lib/clientFiles";

export interface DocEntry {
  id: string;
  name: string;
  mediaType: string;
  data: string;
  size: number;
}

export default function IntakeForm({
  listingText,
  setListingText,
  docs,
  onAddFiles,
  onRemoveDoc,
  onAnalyze,
  loading,
}: {
  listingText: string;
  setListingText: (v: string) => void;
  docs: DocEntry[];
  onAddFiles: (files: FileList | File[]) => void;
  onRemoveDoc: (id: string) => void;
  onAnalyze: () => void;
  loading: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const canAnalyze =
    !loading && (listingText.trim().length > 0 || docs.length > 0);

  return (
    <div className="panel panel-pad flex flex-col gap-5">
      <div>
        <label htmlFor="listing" className="mb-2 block label-mono">
          Listing Text
        </label>
        <textarea
          id="listing"
          value={listingText}
          onChange={(e) => setListingText(e.target.value)}
          placeholder="Paste a BizBuySell teaser, broker email, CIM excerpt — any format."
          rows={9}
          spellCheck={false}
          className="w-full resize-y rounded-md border border-white/10 bg-ink-950/60 p-3 font-mono text-[13px] leading-relaxed text-slate-100 placeholder:text-slate-600 focus:border-accent/50 focus:outline-none focus:ring-1 focus:ring-accent/40"
        />
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <span className="label-mono">Post-NDA Documents</span>
          <span className="font-mono text-[11px] text-slate-500">
            PDF · PNG · JPG · GIF · WEBP
          </span>
        </div>

        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            if (e.dataTransfer.files?.length) onAddFiles(e.dataTransfer.files);
          }}
          onClick={() => inputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
          }}
          className={
            "flex cursor-pointer flex-col items-center justify-center rounded-md border border-dashed px-4 py-8 text-center transition-colors " +
            (dragging
              ? "border-accent bg-accent/5"
              : "border-white/15 hover:border-accent/40 hover:bg-white/[0.02]")
          }
        >
          <span className="font-mono text-2xl text-accent/70">⬡</span>
          <p className="mt-2 text-sm text-slate-300">
            Drag &amp; drop, or{" "}
            <span className="text-accent underline-offset-2 hover:underline">
              browse
            </span>{" "}
            files
          </p>
          <p className="mt-1 text-xs text-slate-500">
            P&amp;Ls, tax returns, leases, org charts
          </p>
          <input
            ref={inputRef}
            type="file"
            multiple
            accept={ACCEPT_ATTR}
            className="hidden"
            onChange={(e) => {
              if (e.target.files?.length) onAddFiles(e.target.files);
              e.target.value = "";
            }}
          />
        </div>

        {docs.length > 0 && (
          <ul className="mt-3 flex flex-col gap-2">
            {docs.map((d) => (
              <li
                key={d.id}
                className="flex items-center justify-between gap-3 rounded-md border border-white/5 bg-ink-950/50 px-3 py-2"
              >
                <div className="flex min-w-0 items-center gap-2.5">
                  <span className="font-mono text-xs text-accent/70">
                    {d.mediaType === "application/pdf" ? "PDF" : "IMG"}
                  </span>
                  <span className="truncate text-sm text-slate-200">
                    {d.name}
                  </span>
                  <span className="shrink-0 font-mono text-[11px] text-slate-500">
                    {humanSize(d.size)}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => onRemoveDoc(d.id)}
                  className="shrink-0 rounded px-2 py-0.5 font-mono text-xs text-slate-400 hover:bg-white/5 hover:text-verdict-pass"
                  aria-label={`Remove ${d.name}`}
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <button
        type="button"
        onClick={onAnalyze}
        disabled={!canAnalyze}
        className={
          "group relative flex items-center justify-center gap-2 rounded-md px-5 py-3 font-mono text-sm font-semibold uppercase tracking-[0.12em] transition-all " +
          (canAnalyze
            ? "bg-accent text-ink-950 shadow-glow hover:bg-accent-glow"
            : "cursor-not-allowed bg-ink-700 text-slate-500")
        }
      >
        {loading ? "Analyzing…" : "Run Deal Screen"}
        {!loading && <span aria-hidden>→</span>}
      </button>

      <p className="-mt-2 text-center text-[11px] text-slate-600">
        Not investment advice. Verify all figures during formal diligence.
      </p>
    </div>
  );
}

export function notAcceptedNames(files: FileList | File[]): string[] {
  return Array.from(files)
    .filter((f) => !isAccepted(f))
    .map((f) => f.name);
}
