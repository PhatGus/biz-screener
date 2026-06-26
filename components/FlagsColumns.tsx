import type { Flags } from "@/lib/types";

const COLUMNS: {
  key: keyof Flags;
  title: string;
  ring: string;
  dot: string;
  head: string;
}[] = [
  {
    key: "red",
    title: "Red — Deal-killers",
    ring: "border-verdict-pass/30",
    dot: "bg-verdict-pass",
    head: "text-verdict-pass",
  },
  {
    key: "yellow",
    title: "Yellow — Diligence",
    ring: "border-verdict-caution/30",
    dot: "bg-verdict-caution",
    head: "text-verdict-caution",
  },
  {
    key: "green",
    title: "Green — Positives",
    ring: "border-verdict-go/30",
    dot: "bg-verdict-go",
    head: "text-verdict-go",
  },
];

export default function FlagsColumns({ flags }: { flags: Flags }) {
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
      {COLUMNS.map((col) => {
        const items = flags[col.key] ?? [];
        return (
          <div key={col.key} className={`panel panel-pad border ${col.ring}`}>
            <div
              className={`mb-3 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] ${col.head}`}
            >
              {col.title}
              <span className="ml-1.5 text-slate-500">({items.length})</span>
            </div>
            {items.length === 0 ? (
              <p className="text-xs italic text-slate-500">None identified.</p>
            ) : (
              <ul className="flex flex-col gap-2.5">
                {items.map((item, i) => (
                  <li key={i} className="flex gap-2.5 text-sm text-slate-200">
                    <span
                      className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${col.dot}`}
                    />
                    <span className="leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      })}
    </div>
  );
}
