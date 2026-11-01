import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { UserEntry } from '../types/pokemon'
import pokemonData from '../data/pokemon.json'

interface TrackerState {
  entries: Record<number, UserEntry>
  hasDlc: boolean
  toggle: (id: number, field: 'included' | 'caught' | 'viaEvolution') => void
  adjustBag: (id: number, delta: number) => void
  setHasDlc: (v: boolean) => void
}

const defaults: Record<number, UserEntry> = {}
for (const p of pokemonData) {
  defaults[p.id] = {
    included: true,
    caught: false,
    viaEvolution: p.defaultViaEvolution,
    bagCount: 0,
  }
}

export const useTracker = create<TrackerState>()(
  persist(
    (set) => ({
      entries: defaults,
      hasDlc: true,
      toggle: (id, field) =>
        set((s) => {
          const prev = s.entries[id]
          const next = { ...prev, [field]: !prev[field] }
          // auto-decrement own bagCount when marking caught
          if (field === 'caught' && !prev.caught && next.bagCount > 0) {
            next.bagCount--
          }
          return { entries: { ...s.entries, [id]: next } }
        }),
      adjustBag: (id, delta) =>
        set((s) => {
          const e = s.entries[id]
          return { entries: { ...s.entries, [id]: { ...e, bagCount: Math.max(0, e.bagCount + delta) } } }
        }),
      setHasDlc: (v) => set({ hasDlc: v }),
    }),
    {
      name: 'plza-tracker',
      merge: (persisted, current) => {
        const saved = persisted as Partial<TrackerState> | undefined
        const savedEntries = saved?.entries ?? {}
        const merged = { ...defaults }
        for (const key in savedEntries) {
          if (merged[key]) merged[key] = savedEntries[key]
        }
        return { ...current, entries: merged, hasDlc: saved?.hasDlc ?? true }
      },
    },
  ),
)
