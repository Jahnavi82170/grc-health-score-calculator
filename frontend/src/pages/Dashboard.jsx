import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getStats, getRecords, exportCsv } from '../services/api'
import ScoreBadge from '../components/ScoreBadge'
import StatCard   from '../components/StatCard'
import { Spinner } from '../components/Feedback'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  Cell, PieChart, Pie, Legend
} from 'recharts'

const BINS = [
  { name: '0–25  Poor',       min: 0,  max: 25,  fill: '#FF5757' },
  { name: '26–50 Fair',       min: 26, max: 50,  fill: '#F5A623' },
  { name: '51–75 Good',       min: 51, max: 75,  fill: '#1B4F8A' },
  { name: '76–100 Excellent', min: 76, max: 100, fill: '#00C896' },
]

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-navy-100 rounded-xl shadow-hover px-4 py-3 text-sm">
      <p className="font-semibold text-navy-800">{payload[0].name}</p>
      <p className="text-navy-400">{payload[0].value} records</p>
    </div>
  )
}

export default function Dashboard() {
  const [stats,   setStats]   = useState(null)
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getStats(), getRecords(0, 100)])
      .then(([s, r]) => { setStats(s.data); setRecords(r.data.content || []) })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const handleExport = async () => {
    try {
      const res = await exportCsv()
      const url = URL.createObjectURL(new Blob([res.data]))
      Object.assign(document.createElement('a'), { href: url, download: 'health_records.csv' }).click()
      URL.revokeObjectURL(url)
    } catch { alert('Export failed') }
  }

  if (loading) return <Spinner text="Loading dashboard…" />

  const barData = BINS.map(b => ({
    name: b.name,
    count: records.filter(r => { const s = parseFloat(r.healthScore); return s >= b.min && s <= b.max }).length,
    fill: b.fill,
  }))

  const pieData = BINS.map(b => ({
    name: b.name.split(' ').slice(1).join(' '),
    value: records.filter(r => { const s = parseFloat(r.healthScore); return s >= b.min && s <= b.max }).length,
    fill: b.fill,
  })).filter(d => d.value > 0)

  const avgScore = stats?.avgScore ? parseFloat(stats.avgScore).toFixed(1) : '—'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between animate-fade-in">
        <div>
          <h2 className="font-display text-2xl text-navy-800">Overview</h2>
          <p className="text-sm text-navy-300 mt-0.5">Health score analytics & recent activity</p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleExport} className="btn-ghost text-xs">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Export CSV
          </button>
          <Link to="/records/new" className="btn-mint text-xs">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            New Record
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Records"  value={stats?.total ?? 0}  sub="All time"           delay={0} />
        <StatCard label="Active"         value={stats?.active ?? 0} sub="Currently monitored" delay={50} />
        <StatCard label="Avg Health Score" value={avgScore}         sub="Out of 100"          delay={100} />
        <StatCard label="Excellent"
          value={records.filter(r => parseFloat(r.healthScore) >= 75).length}
          sub="Score ≥ 75" delay={150} />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

        {/* Bar chart — takes 3 cols */}
        <div className="card lg:col-span-3 animate-slide-up stagger-1">
          <h3 className="font-semibold text-navy-700 text-sm mb-4">Score Distribution</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={barData} barCategoryGap="28%">
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#8FAEC4' }}
                tickLine={false} axisLine={false}
                tickFormatter={v => v.split(' ')[0]} />
              <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: '#8FAEC4' }}
                tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: '#F0F4F8' }} />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                {barData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie chart — takes 2 cols */}
        <div className="card lg:col-span-2 animate-slide-up stagger-2">
          <h3 className="font-semibold text-navy-700 text-sm mb-4">Status Breakdown</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={pieData} cx="45%" cy="50%" innerRadius={48} outerRadius={78}
                paddingAngle={3} dataKey="value">
                {pieData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend iconSize={8} iconType="circle"
                formatter={v => <span style={{ fontSize: 11, color: '#5C8DAD' }}>{v}</span>} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Records */}
      <div className="card animate-slide-up stagger-3">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-navy-700 text-sm">Recent Records</h3>
          <Link to="/records" className="text-xs text-mint hover:underline font-medium">View all →</Link>
        </div>

        {records.length === 0 ? (
          <p className="text-sm text-navy-300 text-center py-8">No records yet. Create your first one!</p>
        ) : (
          <div className="space-y-1">
            {records.slice(0, 8).map(r => (
              <Link key={r.id} to={`/records/${r.id}`}
                className="flex items-center gap-4 px-3 py-2.5 rounded-xl hover:bg-navy-50 transition-colors group">
                {/* Avatar */}
                <div className="w-8 h-8 rounded-full bg-navy-100 flex items-center justify-center text-xs font-semibold text-navy-600 flex-shrink-0 group-hover:bg-navy-200 transition-colors">
                  {r.title?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-navy-800 truncate">{r.title}</p>
                  <p className="text-xs text-navy-300">Age {r.age} · {new Date(r.createdAt).toLocaleDateString()}</p>
                </div>
                <ScoreBadge score={r.healthScore} size="sm" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
