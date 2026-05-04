export default function ScoreBadge({ score, size = 'md' }) {
  const s = parseFloat(score) || 0
  const { cls, label } =
    s >= 75 ? { cls: 'score-excellent', label: 'Excellent' } :
    s >= 50 ? { cls: 'score-good',      label: 'Good' }      :
    s >= 30 ? { cls: 'score-fair',      label: 'Fair' }      :
              { cls: 'score-poor',      label: 'Poor' }

  const sizes = { sm: 'text-xs px-2 py-0.5', md: 'text-sm px-3 py-1', lg: 'text-base px-4 py-1.5 font-bold' }

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border font-semibold font-mono ${cls} ${sizes[size]}`}>
      {s.toFixed(1)}
      <span className={`font-body font-medium ${size === 'lg' ? 'text-sm' : 'text-xs'}`}>— {label}</span>
    </span>
  )
}
