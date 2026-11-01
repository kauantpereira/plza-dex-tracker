import { useState } from 'react'
import type { Pokemon } from '../types/pokemon'
import type { BoxPosition } from '../lib/tracker'
import { PokemonRow } from './PokemonRow'

interface Props {
  pokemon: Pokemon[]
  familyMap: Record<string, Pokemon[]>
  catchQtyMap: Record<number, number>
  boxPositions: Record<number, BoxPosition>
  hasDlc: boolean
  editMode: boolean
  onRequestIncludeToggle: (id: number) => void
}

export function PokemonList({ pokemon, familyMap, catchQtyMap, boxPositions, hasDlc, editMode, onRequestIncludeToggle }: Props) {
  const [expandedId, setExpandedId] = useState<number | null>(null)

  // Build evolveFrom lookup: for each non-base pokemon, find direct pre-evo name
  const evolveFromMap: Record<number, string> = {}
  for (const p of pokemon) {
    if (p.stage === 0) continue
    const family = familyMap[p.baseForm] ?? []
    const preEvo = family
      .filter((m) => m.stage === p.stage - 1)
      .sort((a, b) => a.id - b.id)[0]
    if (preEvo) evolveFromMap[p.id] = preEvo.name
  }

  // Group filtered pokemon into families preserving order
  const families: { baseForm: string; members: Pokemon[] }[] = []
  const seen = new Set<string>()

  for (const p of pokemon) {
    if (seen.has(p.baseForm)) continue
    seen.add(p.baseForm)
    const allMembers = familyMap[p.baseForm] ?? []
    const filteredMembers = allMembers.filter((m) => pokemon.includes(m))
    if (filteredMembers.length > 0) {
      families.push({ baseForm: p.baseForm, members: filteredMembers })
    }
  }

  if (families.length === 0) {
    return <p className="text-slate-500 text-center mt-8">No Pokémon match your filters.</p>
  }

  return (
    <div className="mt-3 flex flex-col gap-3">
      {families.map(({ baseForm, members }) => {
        const base = members.find((m) => m.stage === 0)
        const qty = base ? catchQtyMap[base.id] : undefined
        const allCaught = qty === 0

        return (
          <div key={baseForm} className="flex">
            {/* Accent bar */}
            <div
              className={`w-1 rounded-full shrink-0 ${
                allCaught ? 'bg-emerald-500' : qty !== undefined && qty <= 1 ? 'bg-amber-500' : 'bg-indigo-500'
              }`}
            />
            <div className="flex-1 min-w-0 ml-2 flex flex-col">
              {members.map((p) => (
                <PokemonRow
                  key={p.id}
                  pokemon={p}
                  catchQty={p.stage === 0 ? qty : undefined}
                  boxPosition={boxPositions[p.id]}
                  expanded={expandedId === p.id}
                  hasDlc={hasDlc}
                  editMode={editMode}
                  evolveFrom={evolveFromMap[p.id]}
                  onToggleExpand={() => setExpandedId(expandedId === p.id ? null : p.id)}
                  onRequestIncludeToggle={onRequestIncludeToggle}
                />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
