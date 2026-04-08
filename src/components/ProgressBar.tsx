export function ProgressBar({ caught, total }: { caught: number; total: number }) {
  const pct = total > 0 ? Math.round((caught / total) * 100) : 0
  return (
    <div className="flex items-center gap-2 text-sm">
      <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-indigo-500 rounded-full transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-slate-400 tabular-nums whitespace-nowrap">
        {caught}/{total} ({pct}%)
      </span>
    </div>
  )
}
