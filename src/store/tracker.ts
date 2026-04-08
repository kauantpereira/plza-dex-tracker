import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { UserEntry } from '../types/pokemon'
import pokemonData from '../data/pokemon.json'

interface TrackerState {
  entries: Record<number, UserEntry>
  toggle: (id: number, field: keyof UserEntry) => void
}

const defaults: Record<number, UserEntry> = {}
for (const p of pokemonData) {
  defaults[p.id] = {
    included: true,
    caught: false,
    viaEvolution: p.defaultViaEvolution,
  }
}

export const useTracker = create<TrackerState>()(
  persist(
    (set) => ({
      entries: defaults,
      toggle: (id, field) =>
        set((s) => ({
          entries: {
            ...s.entries,
            [id]: { ...s.entries[id], [field]: !s.entries[id][field] },
          },
        })),
    }),
    {
      name: 'plza-tracker',
      merge: (persisted, current) => {
        const saved = (persisted as TrackerState | undefined)?.entries ?? {}
        // Merge: keep saved state, add defaults for any new pokemon
        const merged = { ...defaults }
        for (const key in saved) {
          if (merged[key]) merged[key] = saved[key]
        }
        return { ...current, entries: merged }
      },
    },
  ),
)
