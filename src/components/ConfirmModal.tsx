interface Props {
  title: string
  message: string
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmModal({ title, message, onConfirm, onCancel }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onCancel}>
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 mx-4 max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-sm font-semibold text-slate-100 mb-1">{title}</h2>
        <p className="text-xs text-slate-400 mb-4">{message}</p>
        <div className="flex gap-2 justify-end">
          <button onClick={onCancel} className="px-3 py-1.5 text-xs rounded-md bg-slate-700 text-slate-300 hover:bg-slate-600">Cancel</button>
          <button onClick={onConfirm} className="px-3 py-1.5 text-xs rounded-md bg-indigo-600 text-white hover:bg-indigo-500">Confirm</button>
        </div>
      </div>
    </div>
  )
}
