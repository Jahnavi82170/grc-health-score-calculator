export default function StatCard({ label, value, sub, accent = 'navy', delay = 0 }) {
  const accents = {
    navy:  'bg-navy-800 text-white',
    mint:  'bg-mint text-white',
    gold:  'bg-gold text-white',
    coral: 'bg-coral text-white',
  }
  return (
    <div
      className={`card animate-slide-up flex flex-col gap-2`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <p className="text-xs font-semibold uppercase tracking-widest text-navy-300">{label}</p>
      <p className="font-display text-4xl text-navy-800 leading-none">{value ?? '—'}</p>
      {sub && <p className="text-xs text-navy-300 mt-1">{sub}</p>}
    </div>
  )
}
