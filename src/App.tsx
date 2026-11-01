import { useMemo, useState } from 'react'
import { Pencil, Check, Settings } from 'lucide-react'
import pokemonData from './data/pokemon.json'
import type { Pokemon, Group } from './types/pokemon'
import { useTracker } from './store/tracker'
import { computeBoxPositions, computeCatchQty } from './lib/tracker'
import { GroupTabs } from './components/GroupTabs'
import { FilterBar } from './components/FilterBar'
import { ProgressBar } from './components/ProgressBar'
import { PokemonList } from './components/PokemonList'
import { SettingsScreen } from './components/SettingsScreen'
import { ConfirmModal } from './components/ConfirmModal'

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
  const [showSettings, setShowSettings] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [pendingToggleId, setPendingToggleId] = useState<number | null>(null)

  const entries = useTracker((s) => s.entries)
  const hasDlc = useTracker((s) => s.hasDlc)
  const toggle = useTracker((s) => s.toggle)

  const boxPositions = useMemo(
    () => computeBoxPositions(allPokemon, entries),
    [entries],
  )

  const familyMap = useMemo(() => {
    const map: Record<string, Pokemon[]> = {}
    for (const p of allPokemon) {
      if (p.group !== group) continue
      ;(map[p.baseForm] ??= []).push(p)
    }
    return map
  }, [group])

  const catchQtyMap = useMemo(() => {
    const map: Record<number, number> = {}
    for (const [, members] of Object.entries(familyMap)) {
      const base = members.find((m) => m.stage === 0)
      if (base) map[base.id] = computeCatchQty(base, members, entries)
    }
    return map
  }, [familyMap, entries])

  const filtered = useMemo(() => {
    const groupPokemon = allPokemon.filter((p) => p.group === group)
    return groupPokemon.filter((p) => {
      const e = entries[p.id]
      if (!e) return false
      const { search, caught, stage, viaEvolution, included } = filters
      if (search) {
        const q = search.toLowerCase()
        const selfMatch = p.name.toLowerCase().includes(q) ||
          p.dexNumber.toLowerCase().includes(q) ||
          p.location.toLowerCase().includes(q)
        const preEvoMatch = (familyMap[p.baseForm] ?? [])
          .filter((m) => m.stage < p.stage)
          .some((m) => m.location.toLowerCase().includes(q))
        if (!selfMatch && !preEvoMatch) return false
      }
      if (caught === 'caught' && !e.caught) return false
      if (caught === 'uncaught' && e.caught) return false
      if (stage !== 'all' && p.stage !== Number(stage)) return false
      if (viaEvolution === 'yes' && !e.viaEvolution) return false
      if (viaEvolution === 'no' && e.viaEvolution) return false
      if (!editMode && !e.included) return false
      if (included === 'yes' && !e.included) return false
      if (included === 'no' && e.included) return false
      return true
    })
  }, [group, entries, filters, editMode, familyMap])

  const stats = useMemo(() => {
    const groupPokemon = allPokemon.filter((p) => p.group === group)
    const includedPokemon = groupPokemon.filter((p) => entries[p.id]?.included)
    const caughtCount = includedPokemon.filter((p) => entries[p.id]?.caught).length
    return { total: includedPokemon.length, caught: caughtCount }
  }, [group, entries])

  const pendingName = pendingToggleId != null
    ? allPokemon.find((p) => p.id === pendingToggleId)?.name ?? ''
    : ''

  return (
    <div className="max-w-lg mx-auto flex flex-col min-h-dvh">
      <header className="sticky top-0 z-10 bg-slate-900 border-b border-slate-700 px-4 pt-3 pb-2">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-lg font-bold">PLZA Dex Tracker</h1>
          <div className="flex gap-2">
            <button
              onClick={() => { setEditMode(!editMode); setFilters(defaultFilters) }}
              className={`text-xs px-2.5 py-1 rounded-md font-medium transition-colors flex items-center gap-1.5 ${editMode ? 'bg-amber-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-slate-200'}`}
            >
              {editMode ? <><Check size={12} /> Done</> : <><Pencil size={12} /> Edit</>}
            </button>
            <button
              onClick={() => setShowSettings(true)}
              className="text-xs px-2.5 py-1 rounded-md bg-slate-800 text-slate-400 hover:text-slate-200"
            >
              <Settings size={14} />
            </button>
          </div>
        </div>
        <ProgressBar caught={stats.caught} total={stats.total} />
        <GroupTabs current={group} onChange={(g) => { setGroup(g); setFilters(defaultFilters) }} />
        {!editMode && <FilterBar filters={filters} onChange={setFilters} />}
      </header>
      <main className="flex-1 overflow-y-auto px-4 pb-8">
        {editMode && (
          <div className="mt-3 px-3 py-2 bg-amber-900/40 border border-amber-700/50 rounded-lg text-xs text-amber-200">
            All Pokémon are included by default. Tap a row and toggle <span className="font-semibold">Include</span> off to remove forms you don't want in your living dex. Box placements will be recalculated.
          </div>
        )}
        <PokemonList
          pokemon={filtered}
          familyMap={familyMap}
          catchQtyMap={catchQtyMap}
          boxPositions={boxPositions}
          hasDlc={hasDlc}
          editMode={editMode}
          onRequestIncludeToggle={(id) => setPendingToggleId(id)}
        />
      </main>

      {showSettings && <SettingsScreen onClose={() => setShowSettings(false)} />}

      {pendingToggleId != null && (
        <ConfirmModal
          title="Change included forms?"
          message={`Toggling "${pendingName}" will recalculate all box placements. You may need to reorganize Pokémon you've already placed.`}
          onConfirm={() => { toggle(pendingToggleId, 'included'); setPendingToggleId(null) }}
          onCancel={() => setPendingToggleId(null)}
        />
      )}
    </div>
  )
}
