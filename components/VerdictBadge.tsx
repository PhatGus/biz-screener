import type { Verdict } from "@/lib/types";

const STYLES: Record<
  Verdict,
  { ring: string; text: string; glow: string; dot: string; label: string }
> = {
  GO: {
    ring: "border-verdict-go/40 bg-verdict-go/10",
    text: "text-verdict-go",
    glow: "shadow-[0_0_40px_-8px_rgba(16,185,129,0.5)]",
    dot: "bg-verdict-go",
    label: "GO",
  },
  CAUTION: {
    ring: "border-verdict-caution/40 bg-verdict-caution/10",
    text: "text-verdict-caution",
    glow: "shadow-[0_0_40px_-8px_rgba(245,182,20,0.5)]",
    dot: "bg-verdict-caution",
    label: "CAUTION",
  },
  PASS: {
    ring: "border-verdict-pass/40 bg-verdict-pass/10",
    text: "text-verdict-pass",
    glow: "shadow-[0_0_40px_-8px_rgba(239,68,68,0.5)]",
    dot: "bg-verdict-pass",
    label: "PASS",
  },
};

export default function VerdictBadge({
  verdict,
  rationale,
}: {
  verdict: Verdict;
  rationale: string;
}) {
  const s = STYLES[verdict] ?? STYLES.CAUTION;
  return (
    <div className={`panel panel-pad flex flex-col gap-3 border ${s.ring} ${s.glow}`}>
      <div className="flex items-center gap-3">
        <span className={`h-2.5 w-2.5 rounded-full ${s.dot} animate-pulse`} />
        <span className="label-mono">Verdict</span>
      </div>
      <div className={`font-mono text-5xl font-bold leading-none tracking-tight sm:text-6xl ${s.text}`}>
        {s.label}
      </div>
      <p className="text-sm leading-relaxed text-slate-300">{rationale}</p>
    </div>
  );
}
