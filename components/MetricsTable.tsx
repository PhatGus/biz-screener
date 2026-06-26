import type { ExtractedMetrics } from "@/lib/types";

const ROWS: { key: keyof ExtractedMetrics; label: string }[] = [
  { key: "asking_price", label: "Asking Price" },
  { key: "revenue_ttm", label: "Revenue (TTM)" },
  { key: "ebitda_or_sde", label: "EBITDA / SDE" },
  { key: "asking_multiple", label: "Asking Multiple" },
  { key: "business_type", label: "Business Type" },
  { key: "employee_count", label: "Employees" },
  { key: "years_in_operation", label: "Years in Operation" },
];

export default function MetricsTable({
  metrics,
}: {
  metrics: ExtractedMetrics;
}) {
  return (
    <div className="panel panel-pad">
      <div className="mb-3 label-mono">Extracted Metrics</div>
      <dl className="divide-y divide-white/5">
        {ROWS.map(({ key, label }) => {
          const value = (metrics[key] ?? "").toString().trim() || "N/A";
          return (
            <div
              key={key}
              className="flex items-baseline justify-between gap-4 py-2"
            >
              <dt className="text-xs text-slate-400">{label}</dt>
              <dd className="text-right font-mono text-sm text-slate-100">
                {value}
              </dd>
            </div>
          );
        })}
      </dl>
    </div>
  );
}
