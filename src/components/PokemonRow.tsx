import type { Pokemon } from '../types/pokemon'
import type { BoxPosition } from '../lib/tracker'
import { useTracker } from '../store/tracker'
import { Check, ChevronDown, ChevronUp, Package, Plus, Minus } from 'lucide-react'

interface Props {
  pokemon: Pokemon
  catchQty?: number
  boxPosition?: BoxPosition
  expanded: boolean
  hasDlc: boolean
  editMode: boolean
  evolveFrom?: string
  onToggleExpand: () => void
  onRequestIncludeToggle: (id: number) => void
}

function stripHyperspace(loc: string): string {
  return loc.replace(/,?\s*Also:\s*Hyperspace[^,]*/gi, '').replace(/^Hyperspace[^,]*/i, '').replace(/^,\s*/, '').trim() || ''
}

export function PokemonRow({ pokemon: p, catchQty, boxPosition, expanded, hasDlc, editMode, evolveFrom, onToggleExpand, onRequestIncludeToggle }: Props) {
  const entry = useTracker((s) => s.entries[p.id])
  const toggle = useTracker((s) => s.toggle)
  const adjustBag = useTracker((s) => s.adjustBag)

  const dimmed = !entry?.included
  const displayLocation = hasDlc ? p.location : stripHyperspace(p.location)

  return (
    <div className={dimmed ? 'opacity-40' : ''}>
      {/* Compact row */}
      <button
        onClick={onToggleExpand}
        className="w-full flex items-center gap-2 py-1 text-left hover:bg-slate-800/50 rounded-md px-1 transition-colors"
      >
        {editMode ? (
          <span
            onClick={(e) => { e.stopPropagation(); onRequestIncludeToggle(p.id) }}
            className={`w-5 h-5 shrink-0 rounded border flex items-center justify-center text-xs cursor-pointer ${
              entry?.included
                ? 'bg-indigo-600 border-indigo-500 text-white'
                : 'border-slate-600 text-transparent hover:border-slate-400'
            }`}
            role="checkbox"
            aria-checked={entry?.included}
            aria-label={`Include ${p.name}`}
          >
            <Check size={12} />
          </span>
        ) : (
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
            <Check size={12} />
          </span>
        )}

        <img
          src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${p.nationalDex}.png`}
          alt={p.name}
          className="w-8 h-8 shrink-0 pixelated"
          loading="lazy"
        />

        <span className="text-slate-500 text-xs w-10 shrink-0 tabular-nums">
          #{p.dexNumber}
        </span>

        <span className={`flex-1 text-sm truncate ${entry?.caught ? 'text-slate-400 line-through' : 'text-slate-100'}`}>
          {p.name}
          {p.gender === '-f' && <span className="text-pink-400 ml-1">♀</span>}
          {p.form !== null && p.gender === null && (
            <span className="text-slate-500 ml-1 text-xs">f{p.form}</span>
          )}
          {evolveFrom && !entry?.caught && (
            <span className="text-indigo-400/70 ml-1.5 text-[10px]">← {evolveFrom}</span>
          )}
        </span>

        {boxPosition && (
          <span className="text-[10px] text-slate-500 shrink-0 tabular-nums bg-slate-800 px-1.5 py-0.5 rounded">
            B{boxPosition.box}·{boxPosition.row},{boxPosition.slot}
          </span>
        )}

        {catchQty !== undefined && (
          <span
            className={`text-xs font-medium shrink-0 tabular-nums flex items-center gap-1 ${
              catchQty === 0 ? 'text-emerald-400' : 'text-amber-400'
            }`}
          >
            {catchQty === 0 ? <Check size={12} /> : (
              <>
                ×{catchQty}
                <span className="text-slate-600 mx-0.5">|</span>
                <Package size={10} className={entry?.bagCount >= catchQty ? 'text-emerald-400' : 'text-slate-500'} />
                <span className={entry?.bagCount >= catchQty ? 'text-emerald-400' : 'text-slate-500'}>{entry?.bagCount ?? 0}</span>
                <button onClick={(e) => { e.stopPropagation(); adjustBag(p.id, 1) }} className="text-slate-500 hover:text-slate-200 p-0.5"><Plus size={10} /></button>
                <button onClick={(e) => { e.stopPropagation(); adjustBag(p.id, -1) }} className="text-slate-500 hover:text-slate-200 p-0.5"><Minus size={10} /></button>
              </>
            )}
          </span>
        )}

        <span className="text-slate-600">{expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}</span>
      </button>

      {/* Expanded detail */}
      {expanded && (
        <div className="ml-6 mb-2 p-2.5 bg-slate-800/60 rounded-md text-xs flex flex-col gap-2 border border-slate-700/50">
          {displayLocation && (
            <div>
              <span className="text-slate-500">Location: </span>
              <span className="text-slate-300">{displayLocation}</span>
            </div>
          )}
          {p.evolutionMethod && (
            <div>
              <span className="text-slate-500">Evolution: </span>
              <span className="text-slate-300">{p.evolutionMethod}</span>
            </div>
          )}
          {boxPosition && (
            <div>
              <span className="text-slate-500">Box {boxPosition.box}</span>
              <span className="text-slate-600"> · </span>
              <span className="text-slate-500">Row {boxPosition.row}, Slot {boxPosition.slot}</span>
            </div>
          )}
          <div className="flex gap-3 mt-1">
            <ToggleButton label="Caught" active={entry?.caught ?? false} onToggle={() => toggle(p.id, 'caught')} />
            <ToggleButton label="Via Evo" active={entry?.viaEvolution ?? false} onToggle={() => toggle(p.id, 'viaEvolution')} />
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
