import type { DimensionKey, DimensionScores } from "@/lib/types";

const ORDER: { key: DimensionKey; label: string }[] = [
  { key: "financials", label: "Financials" },
  { key: "operations", label: "Operations" },
  { key: "market", label: "Market" },
  { key: "risk", label: "Risk" },
  { key: "ai_durability", label: "AI-Durability" },
];

function barColor(score: number): string {
  if (score >= 7) return "bg-verdict-go";
  if (score >= 4) return "bg-verdict-caution";
  return "bg-verdict-pass";
}

function scoreColor(score: number): string {
  if (score >= 7) return "text-verdict-go";
  if (score >= 4) return "text-verdict-caution";
  return "text-verdict-pass";
}

export default function DimensionBars({
  scores,
}: {
  scores: DimensionScores;
}) {
  return (
    <div className="panel panel-pad">
      <div className="mb-4 label-mono">Dimension Scores</div>
      <div className="flex flex-col gap-4">
        {ORDER.map(({ key, label }) => {
          const dim = scores[key];
          const raw = typeof dim?.score === "number" ? dim.score : 0;
          const clamped = Math.max(0, Math.min(10, raw));
          return (
            <div key={key}>
              <div className="mb-1.5 flex items-baseline justify-between">
                <span className="text-sm text-slate-200">{label}</span>
                <span className="font-mono text-sm">
                  <span className={scoreColor(clamped)}>{clamped}</span>
                  <span className="text-slate-500"> / 10</span>
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-ink-700">
                <div
                  className={`h-full rounded-full ${barColor(clamped)} transition-[width] duration-700 ease-out`}
                  style={{ width: `${clamped * 10}%` }}
                />
              </div>
              {dim?.notes ? (
                <p className="mt-1.5 text-xs leading-relaxed text-slate-400">
                  {dim.notes}
                </p>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
