import type { DealMemo } from "@/lib/types";
import VerdictBadge from "./VerdictBadge";
import MetricsTable from "./MetricsTable";
import DimensionBars from "./DimensionBars";
import LicenseCard from "./LicenseCard";
import FlagsColumns from "./FlagsColumns";
import DiligenceList from "./DiligenceList";

export default function DealMemoView({ memo }: { memo: DealMemo }) {
  return (
    <div className="flex flex-col gap-4">
      {/* Verdict + metrics, side by side on desktop */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <VerdictBadge
            verdict={memo.verdict}
            rationale={memo.verdict_rationale}
          />
        </div>
        <div className="lg:col-span-2">
          <MetricsTable metrics={memo.extracted_metrics} />
        </div>
      </div>

      {/* Scores + license */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <DimensionBars scores={memo.dimension_scores} />
        </div>
        <div className="lg:col-span-2">
          <LicenseCard risk={memo.license_risk} />
        </div>
      </div>

      <FlagsColumns flags={memo.flags} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <DiligenceList items={memo.diligence_priorities} />
        </div>
        <div className="lg:col-span-2">
          <div className="panel panel-pad h-full">
            <div className="mb-3 label-mono">Regional Notes — DE / PA / MD</div>
            <p className="text-sm leading-relaxed text-slate-300">
              {memo.regional_notes?.trim() || "No regional notes provided."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
