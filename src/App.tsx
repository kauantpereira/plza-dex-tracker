import { useMemo, useState } from 'react'
import pokemonData from './data/pokemon.json'
import type { Pokemon, Group } from './types/pokemon'
import { useTracker } from './store/tracker'
import { computeBoxPositions, computeCatchQty } from './lib/tracker'
import { GroupTabs } from './components/GroupTabs'
import { FilterBar } from './components/FilterBar'
import { ProgressBar } from './components/ProgressBar'
import { PokemonList } from './components/PokemonList'

const allPokemon = pokemonData as Pokemon[]

export type FilterState = {
  search: string
  caught: 'all' | 'caught' | 'uncaught'
  stage: 'all' | '0' | '1' | '2'
  viaEvolution: 'all' | 'yes' | 'no'
  included: 'all' | 'yes' | 'no'
}

const defaultFilters: FilterState = {
  search: '',
  caught: 'all',
  stage: 'all',
  viaEvolution: 'all',
  included: 'all',
}

export default function App() {
  const [group, setGroup] = useState<Group>('living')
  const [filters, setFilters] = useState<FilterState>(defaultFilters)
  const entries = useTracker((s) => s.entries)

  const boxPositions = useMemo(
    () => computeBoxPositions(allPokemon, entries),
    [entries],
  )

  // Build family map: baseForm -> members (within current group)
  const familyMap = useMemo(() => {
    const map: Record<string, Pokemon[]> = {}
    for (const p of allPokemon) {
      if (p.group !== group) continue
      const key = p.baseForm
      ;(map[key] ??= []).push(p)
    }
    return map
  }, [group])

  // Catch qty per base form id
  const catchQtyMap = useMemo(() => {
    const map: Record<number, number> = {}
    for (const [, members] of Object.entries(familyMap)) {
      const base = members.find((m) => m.stage === 0)
      if (base) map[base.id] = computeCatchQty(base, members, entries)
    }
    return map
  }, [familyMap, entries])

  // Filter pokemon
  const filtered = useMemo(() => {
    const groupPokemon = allPokemon.filter((p) => p.group === group)
    return groupPokemon.filter((p) => {
      const e = entries[p.id]
      if (!e) return false
      const { search, caught, stage, viaEvolution, included } = filters
      if (search && !p.name.toLowerCase().includes(search.toLowerCase()) &&
          !p.dexNumber.toLowerCase().includes(search.toLowerCase()) &&
          !p.location.toLowerCase().includes(search.toLowerCase()))
        return false
      if (caught === 'caught' && !e.caught) return false
      if (caught === 'uncaught' && e.caught) return false
      if (stage !== 'all' && p.stage !== Number(stage)) return false
      if (viaEvolution === 'yes' && !e.viaEvolution) return false
      if (viaEvolution === 'no' && e.viaEvolution) return false
      if (included === 'yes' && !e.included) return false
      if (included === 'no' && e.included) return false
      return true
    })
  }, [group, entries, filters])

  // Stats for current group
  const stats = useMemo(() => {
    const groupPokemon = allPokemon.filter((p) => p.group === group)
    const includedPokemon = groupPokemon.filter((p) => entries[p.id]?.included)
    const caughtCount = includedPokemon.filter((p) => entries[p.id]?.caught).length
    return { total: includedPokemon.length, caught: caughtCount }
  }, [group, entries])

  return (
    <div className="max-w-lg mx-auto flex flex-col min-h-dvh">
      <header className="sticky top-0 z-10 bg-slate-900 border-b border-slate-700 px-4 pt-3 pb-2">
        <h1 className="text-lg font-bold mb-2">PLZA Dex Tracker</h1>
        <ProgressBar caught={stats.caught} total={stats.total} />
        <GroupTabs current={group} onChange={(g) => { setGroup(g); setFilters(defaultFilters) }} />
        <FilterBar filters={filters} onChange={setFilters} />
      </header>
      <main className="flex-1 overflow-y-auto px-4 pb-8">
        <PokemonList
          pokemon={filtered}
          familyMap={familyMap}
          catchQtyMap={catchQtyMap}
          boxPositions={boxPositions}
        />
      </main>
    </div>
  )
}
