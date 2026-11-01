import { useTracker } from '../store/tracker'
import { ArrowLeft } from 'lucide-react'

export function SettingsScreen({ onClose }: { onClose: () => void }) {
  const hasDlc = useTracker((s) => s.hasDlc)
  const setHasDlc = useTracker((s) => s.setHasDlc)

  return (
    <div className="fixed inset-0 z-40 bg-slate-900 flex flex-col">
      <header className="flex items-center gap-3 px-4 py-3 border-b border-slate-700">
        <button onClick={onClose} className="text-slate-400 hover:text-slate-200"><ArrowLeft size={18} /></button>
        <h2 className="text-sm font-semibold text-slate-100">Settings</h2>
      </header>
      <div className="px-4 py-4 flex flex-col gap-4 max-w-lg mx-auto w-full">
        <label className="flex items-center justify-between gap-3 bg-slate-800 rounded-lg px-4 py-3 border border-slate-700">
          <div>
            <div className="text-sm text-slate-200">I have the DLC</div>
            <div className="text-xs text-slate-500">Show Hyperspace locations</div>
          </div>
          <input
            type="checkbox"
            checked={hasDlc}
            onChange={(e) => setHasDlc(e.target.checked)}
            className="w-5 h-5 accent-indigo-500"
          />
        </label>
      </div>
    </div>
  )
}
