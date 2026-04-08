import type { Pokemon } from '../types/pokemon'
import type { BoxPosition } from '../lib/tracker'
import { useTracker } from '../store/tracker'

interface Props {
  pokemon: Pokemon
  catchQty?: number
  boxPosition?: BoxPosition
  expanded: boolean
  onToggleExpand: () => void
}

export function PokemonRow({ pokemon: p, catchQty, boxPosition, expanded, onToggleExpand }: Props) {
  const entry = useTracker((s) => s.entries[p.id])
  const toggle = useTracker((s) => s.toggle)

  const dimmed = !entry?.included

  return (
    <div className={dimmed ? 'opacity-40' : ''}>
      {/* Compact row */}
      <button
        onClick={onToggleExpand}
        className="w-full flex items-center gap-2 py-1.5 text-left hover:bg-slate-800/50 rounded-md px-1 transition-colors"
      >
        <span
          onClick={(e) => { e.stopPropagation(); toggle(p.id, 'caught') }}
          className={`w-5 h-5 shrink-0 rounded border flex items-center justify-center text-xs cursor-pointer ${
            entry?.caught
              ? 'bg-emerald-600 border-emerald-500 text-white'
              : 'border-slate-600 text-transparent hover:border-slate-400'
          }`}
          role="checkbox"
          aria-checked={entry?.caught}
          aria-label={`Mark ${p.name} as caught`}
        >
          ✓
        </span>

        <span className="text-slate-500 text-xs w-10 shrink-0 tabular-nums">
          #{p.dexNumber}
        </span>

        <span className={`flex-1 text-sm truncate ${entry?.caught ? 'text-slate-400 line-through' : 'text-slate-100'}`}>
          {p.name}
          {p.gender === '-f' && <span className="text-pink-400 ml-1">♀</span>}
          {p.form !== null && p.gender === null && (
            <span className="text-slate-500 ml-1 text-xs">f{p.form}</span>
          )}
        </span>

        <span className="text-slate-500 text-xs shrink-0">
          {entry?.viaEvolution ? 'Evo' : `S${p.stage}`}
        </span>

        {catchQty !== undefined && (
          <span
            className={`text-xs font-medium shrink-0 tabular-nums ${
              catchQty === 0 ? 'text-emerald-400' : 'text-amber-400'
            }`}
          >
            {catchQty === 0 ? '✓' : `×${catchQty}`}
          </span>
        )}

        <span className="text-slate-600 text-xs">{expanded ? '▲' : '▼'}</span>
      </button>

      {/* Expanded detail */}
      {expanded && (
        <div className="ml-6 mb-2 p-2.5 bg-slate-800/60 rounded-md text-xs flex flex-col gap-2 border border-slate-700/50">
          {p.location && (
            <div>
              <span className="text-slate-500">Location: </span>
              <span className="text-slate-300">{p.location}</span>
            </div>
          )}
          {p.evolutionMethod && (
            <div>
              <span className="text-slate-500">Evolution: </span>
              <span className="text-slate-300">{p.evolutionMethod}</span>
            </div>
          )}
          <div>
            <span className="text-slate-500">Base form: </span>
            <span className="text-slate-300">{p.baseForm}</span>
          </div>
          {boxPosition && (
            <div>
              <span className="text-slate-500">Box {boxPosition.box}</span>
              <span className="text-slate-600"> · </span>
              <span className="text-slate-500">Row {boxPosition.row}</span>
              <span className="text-slate-600"> · </span>
              <span className="text-slate-500">Slot {boxPosition.slot}</span>
            </div>
          )}
          <div className="flex gap-3 mt-1">
            <ToggleButton
              label="Caught"
              active={entry?.caught ?? false}
              onToggle={() => toggle(p.id, 'caught')}
            />
            <ToggleButton
              label="Via Evo"
              active={entry?.viaEvolution ?? false}
              onToggle={() => toggle(p.id, 'viaEvolution')}
            />
            <ToggleButton
              label="Include"
              active={entry?.included ?? true}
              onToggle={() => toggle(p.id, 'included')}
            />
          </div>
        </div>
      )}
    </div>
  )
}

function ToggleButton({ label, active, onToggle }: { label: string; active: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
        active
          ? 'bg-indigo-600 text-white'
          : 'bg-slate-700 text-slate-400 hover:text-slate-200'
      }`}
    >
      {label}
    </button>
  )
}
