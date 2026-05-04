import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { getRecord, deleteRecord, aiRecommend, aiReport } from '../services/api'
import ScoreBadge from '../components/ScoreBadge'
import { Spinner } from '../components/Feedback'

export default function RecordDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [record,  setRecord]  = useState(null)
  const [loading, setLoading] = useState(true)
  const [aiLoad,  setAiLoad]  = useState({ recommend: false, report: false })
  const [aiError, setAiError] = useState('')

  useEffect(() => {
    getRecord(id)
      .then(r => setRecord(r.data))
      .catch(() => navigate('/records'))
      .finally(() => setLoading(false))
  }, [id])

  const handleDelete = async () => {
    if (!confirm('Delete this record? This cannot be undone.')) return
    await deleteRecord(id)
    navigate('/records')
  }

  const handleAI = async (type) => {
    setAiError('')
    setAiLoad(l => ({ ...l, [type]: true }))
    try {
      const fn = type === 'recommend' ? aiRecommend : aiReport
      const res = await fn(id)
      setRecord(res.data)
    } catch {
      setAiError(`AI ${type} failed. Please try again.`)
    } finally {
      setAiLoad(l => ({ ...l, [type]: false }))
    }
  }

  if (loading) return <Spinner text="Loading record…" />
  if (!record)  return null

  const metrics = [
    { label: 'Age',            value: record.age,                         unit: 'years' },
    { label: 'BMI',            value: record.bmi,                         unit: '' },
    { label: 'Systolic BP',    value: record.bloodPressureSystolic,       unit: 'mmHg' },
    { label: 'Diastolic BP',   value: record.bloodPressureDiastolic,      unit: 'mmHg' },
    { label: 'Cholesterol',    value: record.cholesterol,                 unit: 'mg/dL' },
    { label: 'Blood Sugar',    value: record.bloodSugar,                  unit: 'mg/dL' },
    { label: 'Exercise',       value: record.exerciseHoursPerWeek,        unit: 'hrs/wk' },
    { label: 'Sleep',          value: record.sleepHoursPerDay,            unit: 'hrs/day' },
    { label: 'Smoking',        value: record.smoking ? 'Yes' : 'No',     unit: '' },
    { label: 'Alcohol',        value: record.alcoholUnitsPerWeek,         unit: 'units/wk' },
    { label: 'Stress Level',   value: record.stressLevel,                 unit: '/ 10' },
  ]

  // Parse AI recommendations safely
  let recs = []
  if (record.aiRecommendations) {
    try {
      const p = typeof record.aiRecommendations === 'string'
        ? JSON.parse(record.aiRecommendations) : record.aiRecommendations
      recs = Array.isArray(p) ? p : []
    } catch { recs = [] }
  }

  // Parse AI report safely
  let report = null
  if (record.aiReport) {
    try {
      const p = typeof record.aiReport === 'string'
        ? JSON.parse(record.aiReport) : record.aiReport
      if (p && typeof p === 'object' && p.summary) report = p
    } catch { report = null }
  }

  return (
    <div className="max-w-4xl space-y-5">

      {/* Back + header */}
      <div className="animate-fade-in">
        <Link to="/records"
          className="text-xs text-navy-300 hover:text-navy-600 flex items-center gap-1 mb-3 w-fit">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>
          Back to Records
        </Link>
        <div className="flex flex-wrap items-start gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-navy-100 flex items-center justify-center text-lg font-semibold text-navy-700 flex-shrink-0">
                {record.title?.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="font-display text-2xl text-navy-800">{record.title}</h2>
                <p className="text-sm text-navy-300">
                  Created {new Date(record.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
            </div>
            <div className="mt-3">
              <ScoreBadge score={record.healthScore} size="lg" />
              {record.isFallback && (
                <span className="ml-2 chip bg-amber-50 text-amber-700 border border-amber-200">AI Fallback</span>
              )}
            </div>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <Link to={`/records/${id}/edit`} className="btn-ghost text-sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              Edit
            </Link>
            <button onClick={handleDelete} className="btn-danger text-sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
              Delete
            </button>
          </div>
        </div>
      </div>

      {/* Metrics grid */}
      <div className="card animate-slide-up">
        <h3 className="font-semibold text-navy-700 text-sm mb-4">Health Metrics</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {metrics.map(m => (
            <div key={m.label} className="bg-navy-50 rounded-xl p-3 text-center">
              <p className="text-xs text-navy-300 mb-1">{m.label}</p>
              <p className="font-mono text-base font-semibold text-navy-800">
                {m.value ?? '—'}
                {m.unit && <span className="text-xs font-body text-navy-300 ml-0.5">{m.unit}</span>}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* AI Description */}
      {record.aiDescription && (
        <div className="ai-panel animate-slide-up">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-lg bg-mint flex items-center justify-center flex-shrink-0">
              <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
            </div>
            <h3 className="font-semibold text-navy-700 text-sm">AI Health Description</h3>
          </div>
          <p className="text-sm text-navy-600 leading-relaxed">{record.aiDescription}</p>
        </div>
      )}

      {/* AI action buttons */}
      <div className="flex flex-wrap gap-3 animate-slide-up">
        <button onClick={() => handleAI('recommend')} disabled={aiLoad.recommend}
          className="btn-mint text-sm disabled:opacity-60">
          {aiLoad.recommend
            ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Generating…</>
            : <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                AI Recommendations
              </>
          }
        </button>
        <button onClick={() => handleAI('report')} disabled={aiLoad.report}
          className="btn-ghost text-sm disabled:opacity-60">
          {aiLoad.report
            ? <><span className="w-4 h-4 border-2 border-navy-200 border-t-navy-600 rounded-full animate-spin" /> Generating…</>
            : <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                Generate Report
              </>
          }
        </button>
        {aiError && <p className="text-xs text-coral self-center">{aiError}</p>}
      </div>

      {/* AI Recommendations */}
      {recs.length > 0 && (
        <div className="card animate-slide-up">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-6 h-6 rounded-lg bg-mint flex items-center justify-center flex-shrink-0">
              <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
            </div>
            <h3 className="font-semibold text-navy-700 text-sm">AI Recommendations</h3>
          </div>
          <div className="space-y-3">
            {recs.map((rec, i) => {
              const pc = rec.priority === 'HIGH' ? 'bg-red-50 text-red-600 border border-red-200'
                       : rec.priority === 'MEDIUM' ? 'bg-amber-50 text-amber-700 border border-amber-200'
                       : 'bg-mint-50 text-mint-600 border border-mint-400/40'
              return (
                <div key={i} className="flex items-start gap-3 p-4 bg-navy-50 rounded-xl">
                  <span className={`chip mt-0.5 flex-shrink-0 ${pc}`}>{rec.priority}</span>
                  <div>
                    <p className="text-xs font-semibold text-navy-300 uppercase tracking-wider mb-1">{rec.action_type}</p>
                    <p className="text-sm text-navy-700 leading-relaxed">{rec.description}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* AI Report */}
      {report && (
        <div className="card border-t-4 border-mint animate-slide-up">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-navy-800 flex items-center justify-center flex-shrink-0">
                <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
              </div>
              <h3 className="font-semibold text-navy-700 text-sm">Health Assessment Report</h3>
            </div>
            <span className={`chip flex-shrink-0 ${
              report.risk_level === 'LOW'      ? 'bg-mint-50 text-mint-600 border border-mint-400/40' :
              report.risk_level === 'MODERATE' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
              report.risk_level === 'HIGH'     ? 'bg-orange-50 text-orange-700 border border-orange-200' :
              'bg-red-50 text-red-600 border border-red-200'
            }`}>Risk: {report.risk_level}</span>
          </div>

          {report.summary && (
            <p className="text-sm text-navy-500 italic mb-3 pb-3 border-b border-navy-50">{report.summary}</p>
          )}
          {report.overview && (
            <p className="text-sm text-navy-700 leading-relaxed mb-4">{report.overview}</p>
          )}

          {report.key_findings?.length > 0 && (
            <div className="mb-4">
              <p className="text-xs font-semibold text-navy-300 uppercase tracking-wider mb-2">Key Findings</p>
              <ul className="space-y-1.5">
                {report.key_findings.map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-navy-700">
                    <svg className="w-4 h-4 text-mint mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="9 11 12 14 22 4"/></svg>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {report.recommendations?.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-navy-300 uppercase tracking-wider mb-2">Recommendations</p>
              <ul className="space-y-1.5">
                {report.recommendations.map((r, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-navy-700">
                    <span className="text-mint font-bold mt-0.5 flex-shrink-0">→</span>{r}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <p className="text-xs text-navy-200 animate-fade-in">
        Record #{record.id} · Last updated {new Date(record.updatedAt).toLocaleString()}
      </p>
    </div>
  )
}
