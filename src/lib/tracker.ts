import type { Pokemon, UserEntry, Group } from '../types/pokemon'

const SLOTS_PER_BOX = 30

export interface BoxPosition {
  box: number
  row: number
  slot: number
}

/**
 * Compute box positions for all included pokemon.
 * Boxes are continuous across groups, each group starts on a new box.
 */
export function computeBoxPositions(
  pokemon: Pokemon[],
  entries: Record<number, UserEntry>,
): Record<number, BoxPosition> {
  const groups: Group[] = ['living', 'dlc', 'special']
  const result: Record<number, BoxPosition> = {}
  let boxOffset = 0

  for (const group of groups) {
    const included = pokemon.filter(
      (p) => p.group === group && entries[p.id]?.included,
    )
    let idx = 0
    for (const p of included) {
      const box = boxOffset + Math.floor(idx / SLOTS_PER_BOX) + 1
      const posInBox = idx % SLOTS_PER_BOX
      result[p.id] = {
        box,
        row: Math.floor(posInBox / 6) + 1,
        slot: (posInBox % 6) + 1,
      }
      idx++
    }
    if (idx > 0) boxOffset += Math.ceil(idx / SLOTS_PER_BOX)
  }

  return result
}

/**
 * Catch Qty: for a base form, how many of it you still need to catch.
 * = (1 if base not caught) + count of uncaught included family members marked viaEvolution
 */
export function computeCatchQty(
  basePokemon: Pokemon,
  familyMembers: Pokemon[],
  entries: Record<number, UserEntry>,
): number {
  const base = entries[basePokemon.id]
  if (!base?.included) return 0

  let qty = base.caught ? 0 : 1
  for (const m of familyMembers) {
    const e = entries[m.id]
    if (m.id !== basePokemon.id && e?.included && e.viaEvolution && !e.caught) {
      qty++
    }
  }
  return qty
}
