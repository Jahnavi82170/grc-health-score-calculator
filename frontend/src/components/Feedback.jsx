export function Spinner({ text = 'Loading…' }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-3">
      <div className="w-8 h-8 border-4 border-mint border-t-transparent rounded-full animate-spin" />
      <p className="text-sm text-navy-300">{text}</p>
    </div>
  )
}

export function Empty({ icon = '🩺', title = 'Nothing here yet', sub = '', action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
      <span className="text-5xl">{icon}</span>
      <p className="font-display text-lg text-navy-700">{title}</p>
      {sub && <p className="text-sm text-navy-300 max-w-xs">{sub}</p>}
      {action}
    </div>
  )
}

export function ErrorMsg({ msg }) {
  if (!msg) return null
  return (
    <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
      {msg}
    </div>
  )
}

export function SuccessMsg({ msg }) {
  if (!msg) return null
  return (
    <div className="bg-mint-50 border border-mint-400 text-mint-600 rounded-xl px-4 py-3 text-sm">
      {msg}
    </div>
  )
}
