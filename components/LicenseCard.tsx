import type { LicenseRisk, LicenseStatus } from "@/lib/types";

const STYLES: Record<
  LicenseStatus,
  { ring: string; text: string; dot: string; emoji: string }
> = {
  GREEN: {
    ring: "border-verdict-go/40",
    text: "text-verdict-go",
    dot: "bg-verdict-go",
    emoji: "🟢",
  },
  YELLOW: {
    ring: "border-verdict-caution/40",
    text: "text-verdict-caution",
    dot: "bg-verdict-caution",
    emoji: "🟡",
  },
  RED: {
    ring: "border-verdict-pass/40",
    text: "text-verdict-pass",
    dot: "bg-verdict-pass",
    emoji: "🔴",
  },
};

export default function LicenseCard({ risk }: { risk: LicenseRisk }) {
  const s = STYLES[risk.status] ?? STYLES.YELLOW;
  return (
    <div className={`panel panel-pad border ${s.ring}`}>
      <div className="mb-3 flex items-center justify-between">
        <span className="label-mono">License Risk</span>
        <span
          className={`inline-flex items-center gap-2 rounded-full border ${s.ring} bg-white/5 px-2.5 py-1 font-mono text-xs font-semibold ${s.text}`}
        >
          <span aria-hidden>{s.emoji}</span>
          {risk.status}
        </span>
      </div>

      <p className="text-sm leading-relaxed text-slate-200">{risk.detail}</p>

      {risk.mitigation ? (
        <div className="mt-3 rounded-md border border-accent/20 bg-accent/5 p-3">
          <div className="mb-1 font-mono text-[10px] uppercase tracking-[0.18em] text-accent">
            Mitigation
          </div>
          <p className="text-sm leading-relaxed text-slate-200">
            {risk.mitigation}
          </p>
        </div>
      ) : null}
    </div>
  );
}
