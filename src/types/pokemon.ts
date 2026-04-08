export type Group = 'living' | 'dlc' | 'special'

export interface Pokemon {
  id: number
  name: string
  dexNumber: string
  nationalDex: number
  group: Group
  stage: number
  defaultViaEvolution: boolean
  location: string
  baseForm: string
  evolutionMethod: string
  form: number | null
  gender: string | null
}

export interface UserEntry {
  included: boolean
  caught: boolean
  viaEvolution: boolean
}
