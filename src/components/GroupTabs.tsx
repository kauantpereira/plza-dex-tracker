import type { Group } from '../types/pokemon'

const tabs: { key: Group; label: string }[] = [
  { key: 'living', label: 'Living Forms' },
  { key: 'dlc', label: 'DLC' },
  { key: 'special', label: 'Special' },
]

export function GroupTabs({ current, onChange }: { current: Group; onChange: (g: Group) => void }) {
  return (
    <div className="flex gap-1 my-2">
      {tabs.map((t) => (
        <button
          key={t.key}
          onClick={() => onChange(t.key)}
          className={`flex-1 py-1.5 text-sm rounded-md font-medium transition-colors ${
            current === t.key
              ? 'bg-indigo-600 text-white'
              : 'bg-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  )
}
