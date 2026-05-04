import { useState, useEffect } from 'react'
import { getRecords, getStats } from '../services/api'
import { Spinner } from '../components/Feedback'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Cell, RadarChart, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, Radar, Legend
} from 'recharts'

const PERIODS = [
  { label: 'All time', days: 0 },
  { label: 'Last 30d', days: 30 },
  { label: 'Last 7d',  days: 7 },
]

const TIP = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-navy-100 rounded-xl shadow-hover px-3 py-2 text-xs">
      {label && <p className="font-semibold text-navy-600 mb-1">{label}</p>}
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }}>{p.name}: {typeof p.value === 'number' ? p.value.toFixed(1) : p.value}</p>
      ))}
    </div>
  )
}

export default function Analytics() {
  const [records, setRecords] = useState([])
  const [stats,   setStats]   = useState(null)
  const [period,  setPeriod]  = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getRecords(0, 200), getStats()])
      .then(([r, s]) => { setRecords(r.data.content || []); setStats(s.data) })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Spinner text="Loading analytics…" />

  // Filter by period
  const now = new Date()
  const filtered = period === 0 ? records : records.filter(r => {
    const diff = (now - new Date(r.createdAt)) / (1000 * 60 * 60 * 24)
    return diff <= period
  })

  // Score distribution
  const distData = [
    { name: '0–25',   count: filtered.filter(r => parseFloat(r.healthScore) <= 25).length,  fill: '#FF5757' },
    { name: '26–50',  count: filtered.filter(r => { const s = parseFloat(r.healthScore); return s > 25 && s <= 50 }).length, fill: '#F5A623' },
    { name: '51–75',  count: filtered.filter(r => { const s = parseFloat(r.healthScore); return s > 50 && s <= 75 }).length, fill: '#1B4F8A' },
    { name: '76–100', count: filtered.filter(r => parseFloat(r.healthScore) > 75).length,  fill: '#00C896' },
  ]

  // Score over time (group by creation date)
  const timeMap = {}
  filtered.forEach(r => {
    const d = new Date(r.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
    if (!timeMap[d]) timeMap[d] = { date: d, scores: [] }
    timeMap[d].scores.push(parseFloat(r.healthScore) || 0)
  })
  const timeData = Object.values(timeMap)
    .slice(-20)
    .map(d => ({ date: d.date, avg: d.scores.reduce((a, b) => a + b, 0) / d.scores.length }))

  // Radar: average lifestyle metrics (normalised to 0-10)
  const avg = key => {
    const vals = filtered.map(r => parseFloat(r[key])).filter(v => !isNaN(v))
    return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0
  }
  const radarData = [
    { subject: 'Exercise',  value: Math.min(10, avg('exerciseHoursPerWeek')), fullMark: 10 },
    { subject: 'Sleep',     value: Math.min(10, avg('sleepHoursPerDay')),     fullMark: 10 },
    { subject: 'Low Stress',value: Math.max(0, 10 - avg('stressLevel')),     fullMark: 10 },
    { subject: 'No Alcohol',value: Math.max(0, 10 - Math.min(10, avg('alcoholUnitsPerWeek') / 2)), fullMark: 10 },
    { subject: 'Score/10',  value: avg('healthScore') / 10,                  fullMark: 10 },
  ]

  // BMI distribution
  const bmiData = [
    { name: 'Underweight\n<18.5',   count: filtered.filter(r => r.bmi && parseFloat(r.bmi) < 18.5).length,              fill: '#1B4F8A' },
    { name: 'Normal\n18.5–25',      count: filtered.filter(r => r.bmi && parseFloat(r.bmi) >= 18.5 && parseFloat(r.bmi) < 25).length, fill: '#00C896' },
    { name: 'Overweight\n25–30',    count: filtered.filter(r => r.bmi && parseFloat(r.bmi) >= 25 && parseFloat(r.bmi) < 30).length,   fill: '#F5A623' },
    { name: 'Obese\n≥30',           count: filtered.filter(r => r.bmi && parseFloat(r.bmi) >= 30).length,               fill: '#FF5757' },
  ]

  const smokers    = filtered.filter(r => r.smoking).length
  const nonSmokers = filtered.length - smokers

  return (
    <div className="space-y-6">

      {/* Header + period selector */}
      <div className="flex flex-wrap items-center justify-between gap-3 animate-fade-in">
        <div>
          <h2 className="font-display text-2xl text-navy-800">Analytics</h2>
          <p className="text-sm text-navy-300 mt-0.5">{filtered.length} records analysed</p>
        </div>
        <div className="flex bg-white rounded-xl border border-navy-100 p-1 shadow-card">
          {PERIODS.map(p => (
            <button key={p.days} onClick={() => setPeriod(p.days)}
              className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${
                period === p.days ? 'bg-navy-800 text-white shadow-sm' : 'text-navy-400 hover:text-navy-700'
              }`}>
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Summary row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Records', value: filtered.length },
          { label: 'Avg Score', value: (filtered.reduce((a, r) => a + (parseFloat(r.healthScore) || 0), 0) / (filtered.length || 1)).toFixed(1) },
          { label: 'Smokers', value: `${smokers} / ${filtered.length}` },
          { label: 'Avg Stress', value: avg('stressLevel').toFixed(1) + ' / 10' },
        ].map((s, i) => (
          <div key={s.label} className="card animate-slide-up" style={{ animationDelay: `${i * 40}ms` }}>
            <p className="text-xs font-semibold uppercase tracking-widest text-navy-300 mb-1">{s.label}</p>
            <p className="font-display text-3xl text-navy-800">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Score over time */}
      <div className="card animate-slide-up stagger-1">
        <h3 className="font-semibold text-navy-700 text-sm mb-4">Average Health Score Over Time</h3>
        {timeData.length < 2 ? (
          <p className="text-sm text-navy-300 text-center py-8">Not enough data points for a timeline.</p>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={timeData}>
              <defs>
                <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#00C896" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#00C896" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#8FAEC4' }} tickLine={false} axisLine={false} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#8FAEC4' }} tickLine={false} axisLine={false} />
              <Tooltip content={<TIP />} />
              <Area type="monotone" dataKey="avg" name="Avg Score"
                stroke="#00C896" strokeWidth={2} fill="url(#scoreGrad)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Score distribution */}
        <div className="card animate-slide-up stagger-2">
          <h3 className="font-semibold text-navy-700 text-sm mb-4">Score Distribution</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={distData} barCategoryGap="30%">
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#8FAEC4' }} tickLine={false} axisLine={false} />
              <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: '#8FAEC4' }} tickLine={false} axisLine={false} />
              <Tooltip content={<TIP />} cursor={{ fill: '#F0F4F8' }} />
              <Bar dataKey="count" name="Records" radius={[4, 4, 0, 0]}>
                {distData.map((d, i) => <Cell key={i} fill={d.fill} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* BMI distribution */}
        <div className="card animate-slide-up stagger-3">
          <h3 className="font-semibold text-navy-700 text-sm mb-4">BMI Distribution</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={bmiData} barCategoryGap="30%">
              <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#8FAEC4' }} tickLine={false} axisLine={false} />
              <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: '#8FAEC4' }} tickLine={false} axisLine={false} />
              <Tooltip content={<TIP />} cursor={{ fill: '#F0F4F8' }} />
              <Bar dataKey="count" name="Records" radius={[4, 4, 0, 0]}>
                {bmiData.map((d, i) => <Cell key={i} fill={d.fill} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Radar */}
        <div className="card animate-slide-up stagger-4">
          <h3 className="font-semibold text-navy-700 text-sm mb-4">Avg Lifestyle Profile</h3>
          <ResponsiveContainer width="100%" height={180}>
            <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="65%">
              <PolarGrid stroke="#E8EDF2" />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 9, fill: '#8FAEC4' }} />
              <PolarRadiusAxis angle={30} domain={[0, 10]} tick={false} axisLine={false} />
              <Radar name="Average" dataKey="value" stroke="#00C896" fill="#00C896" fillOpacity={0.25} />
              <Tooltip content={<TIP />} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Smoking stat */}
      <div className="card animate-slide-up">
        <h3 className="font-semibold text-navy-700 text-sm mb-4">Smoking Status</h3>
        <div className="flex items-center gap-4">
          <div className="flex-1 bg-navy-50 rounded-full h-3 overflow-hidden">
            <div className="h-full bg-coral rounded-full transition-all duration-700"
              style={{ width: filtered.length ? `${(smokers / filtered.length) * 100}%` : '0%' }} />
          </div>
          <div className="text-right flex-shrink-0">
            <span className="text-sm font-semibold text-coral">{smokers}</span>
            <span className="text-xs text-navy-300"> smokers</span>
            <span className="mx-2 text-navy-200">·</span>
            <span className="text-sm font-semibold text-mint">{nonSmokers}</span>
            <span className="text-xs text-navy-300"> non-smokers</span>
          </div>
        </div>
      </div>
    </div>
  )
}
