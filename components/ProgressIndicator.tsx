"use client";

import { useEffect, useState } from "react";

const PHASES = [
  "Reading listing & documents",
  "Extracting financial metrics",
  "Scoring financials, operations & market",
  "Assessing AI-durability & license risk",
  "Compiling flags & diligence priorities",
  "Finalizing deal memo",
];

export default function ProgressIndicator({
  docCount,
}: {
  docCount: number;
}) {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    // Advance through phases on a cadence; hold on the last one until the
    // request resolves and this component unmounts.
    const id = setInterval(() => {
      setPhase((p) => (p < PHASES.length - 1 ? p + 1 : p));
    }, 2200);
    return () => clearInterval(id);
  }, []);

  const pct = Math.round(((phase + 1) / PHASES.length) * 100);

  return (
    <div className="panel panel-pad">
      <div className="mb-4 flex items-center justify-between">
        <span className="label-mono">Analyzing</span>
        <span className="font-mono text-xs text-accent">{pct}%</span>
      </div>

      <div className="mb-5 h-1.5 w-full overflow-hidden rounded-full bg-ink-700">
        <div
          className="h-full rounded-full bg-accent shadow-glow transition-[width] duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>

      <ul className="flex flex-col gap-2.5">
        {PHASES.map((p, i) => {
          const done = i < phase;
          const active = i === phase;
          return (
            <li key={p} className="flex items-center gap-3">
              <span
                className={
                  "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[10px] font-mono " +
                  (done
                    ? "border-accent/40 bg-accent/20 text-accent"
                    : active
                      ? "border-accent bg-transparent text-accent"
                      : "border-white/10 text-slate-600")
                }
              >
                {done ? "✓" : active ? "•" : ""}
              </span>
              <span
                className={
                  "text-sm " +
                  (active
                    ? "text-slate-100"
                    : done
                      ? "text-slate-400"
                      : "text-slate-600")
                }
              >
                {p}
                {active && (
                  <span className="ml-1 inline-flex">
                    <span className="animate-pulse">…</span>
                  </span>
                )}
              </span>
            </li>
          );
        })}
      </ul>

      <p className="mt-4 font-mono text-[11px] text-slate-500">
        {docCount > 0
          ? `Processing ${docCount} document${docCount === 1 ? "" : "s"} with claude-sonnet-4-6.`
          : "Running claude-sonnet-4-6 on the listing text."}
      </p>
    </div>
  );
}
