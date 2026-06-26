import Screener from "@/components/Screener";

export default function Home() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
      <header className="mb-6 flex flex-col gap-3 border-b border-white/5 pb-5 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="font-mono text-xl text-accent">⬡</span>
            <h1 className="font-mono text-lg font-bold tracking-tight text-slate-100">
              biz<span className="text-accent">-</span>screener
            </h1>
          </div>
          <p className="mt-1.5 text-sm text-slate-400">
            Small-business acquisition deal screener · $1.5M–$5M · DE / PA / MD
            corridor
          </p>
        </div>
        <div className="flex items-center gap-4 font-mono text-[11px] text-slate-500">
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-verdict-go" />
            GO
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-verdict-caution" />
            CAUTION
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-verdict-pass" />
            PASS
          </span>
        </div>
      </header>

      <Screener />

      <footer className="mt-10 border-t border-white/5 pt-5 text-center font-mono text-[11px] text-slate-600">
        Powered by claude-sonnet-4-6 · Screening tool only — not investment
        advice
      </footer>
    </main>
  );
}
