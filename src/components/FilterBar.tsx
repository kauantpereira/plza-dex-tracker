import type { FilterState } from '../App'

const selectClass =
  'bg-slate-800 text-slate-300 text-xs rounded-md px-2 py-1.5 border border-slate-700 focus:outline-none focus:border-indigo-500'

export function FilterBar({
  filters,
  onChange,
}: {
  filters: FilterState
  onChange: (f: FilterState) => void
}) {
  const set = <K extends keyof FilterState>(key: K, val: FilterState[K]) =>
    onChange({ ...filters, [key]: val })

  return (
    <div className="flex flex-col gap-2 mt-1">
      <input
        type="text"
        placeholder="Search name, dex #, location…"
        value={filters.search}
        onChange={(e) => set('search', e.target.value)}
        className="w-full bg-slate-800 text-sm text-slate-200 rounded-md px-3 py-1.5 border border-slate-700 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
      />
      <div className="flex gap-1.5 flex-wrap">
        <select value={filters.caught} onChange={(e) => set('caught', e.target.value as FilterState['caught'])} className={selectClass}>
          <option value="all">All</option>
          <option value="caught">Caught</option>
          <option value="uncaught">Uncaught</option>
        </select>
        <select value={filters.stage} onChange={(e) => set('stage', e.target.value as FilterState['stage'])} className={selectClass}>
          <option value="all">Any stage</option>
          <option value="0">Base (0)</option>
          <option value="1">Stage 1</option>
          <option value="2">Stage 2</option>
        </select>
        <select value={filters.viaEvolution} onChange={(e) => set('viaEvolution', e.target.value as FilterState['viaEvolution'])} className={selectClass}>
          <option value="all">Any obtain</option>
          <option value="yes">Via Evo</option>
          <option value="no">Wild catch</option>
        </select>
        <select value={filters.included} onChange={(e) => set('included', e.target.value as FilterState['included'])} className={selectClass}>
          <option value="all">Incl. & Excl.</option>
          <option value="yes">Included</option>
          <option value="no">Excluded</option>
        </select>
      </div>
    </div>
  )
}
