import { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getRecords, searchRecords, deleteRecord } from '../services/api'
import ScoreBadge from '../components/ScoreBadge'
import { Spinner, Empty } from '../components/Feedback'

export default function RecordList() {
  const [records, setRecords] = useState([])
  const [total,   setTotal]   = useState(0)
  const [page,    setPage]    = useState(0)
  const [search,  setSearch]  = useState('')
  const [debSearch, setDebSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(null)
  const navigate = useNavigate()

  // Debounce search input 400ms
  useEffect(() => {
    const t = setTimeout(() => { setDebSearch(search); setPage(0) }, 400)
    return () => clearTimeout(t)
  }, [search])

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = debSearch
        ? await searchRecords(debSearch, page)
        : await getRecords(page, 10)
      setRecords(res.data.content || [])
      setTotal(res.data.totalElements || 0)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }, [debSearch, page])

  useEffect(() => { load() }, [load])

  const handleDelete = async (id, title) => {
    if (!confirm(`Delete record "${title}"?`)) return
    setDeleting(id)
    try { await deleteRecord(id); load() }
    catch { alert('Delete failed') }
    finally { setDeleting(null) }
  }

  const totalPages = Math.ceil(total / 10)

  return (
    <div className="space-y-4">

      {/* Header */}
      <div className="flex items-center justify-between animate-fade-in">
        <div>
          <h2 className="font-display text-2xl text-navy-800">Health Records</h2>
          <p className="text-sm text-navy-300 mt-0.5">{total} records found</p>
        </div>
        <Link to="/records/new" className="btn-mint text-xs">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          New Record
        </Link>
      </div>

      {/* Search */}
      <div className="card !p-3 animate-slide-up">
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-300"
            fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            className="input pl-9"
            placeholder="Search by name…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-navy-300 hover:text-navy-600">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          )}
        </div>
      </div>

      {/* Table card */}
      <div className="card !p-0 overflow-hidden animate-slide-up stagger-1">
        {loading ? (
          <Spinner text="Loading records…" />
        ) : records.length === 0 ? (
          <Empty
            title={debSearch ? 'No results found' : 'No records yet'}
            sub={debSearch ? `Nothing matched "${debSearch}"` : 'Create your first health record'}
            action={<Link to="/records/new" className="btn-mint text-sm">Create record</Link>}
          />
        ) : (
          <>
            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    {['Name', 'Age', 'BMI', 'Blood Pressure', 'Health Score', 'Status', 'Actions']
                      .map(h => <th key={h} className="tbl-th">{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {records.map((r, idx) => (
                    <tr key={r.id}
                      className="hover:bg-navy-50/50 transition-colors animate-fade-in"
                      style={{ animationDelay: `${idx * 30}ms` }}>
                      <td className="tbl-td">
                        <Link to={`/records/${r.id}`} className="flex items-center gap-2.5 group">
                          <div className="w-7 h-7 rounded-full bg-navy-100 flex items-center justify-center text-xs font-semibold text-navy-600 flex-shrink-0 group-hover:bg-mint group-hover:text-white transition-colors">
                            {r.title?.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-medium text-navy-800 group-hover:text-mint transition-colors">{r.title}</span>
                        </Link>
                      </td>
                      <td className="tbl-td text-navy-500">{r.age}</td>
                      <td className="tbl-td font-mono text-navy-500">{r.bmi ?? '—'}</td>
                      <td className="tbl-td font-mono text-navy-500">
                        {r.bloodPressureSystolic && r.bloodPressureDiastolic
                          ? `${r.bloodPressureSystolic}/${r.bloodPressureDiastolic}`
                          : '—'}
                      </td>
                      <td className="tbl-td"><ScoreBadge score={r.healthScore} size="sm" /></td>
                      <td className="tbl-td">
                        <StatusChip status={r.status} />
                      </td>
                      <td className="tbl-td">
                        <div className="flex items-center gap-1">
                          <button onClick={() => navigate(`/records/${r.id}`)}
                            className="btn-icon w-7 h-7 text-navy-400" title="View">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                          </button>
                          <button onClick={() => navigate(`/records/${r.id}/edit`)}
                            className="btn-icon w-7 h-7 text-navy-400" title="Edit">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                          </button>
                          <button onClick={() => handleDelete(r.id, r.title)}
                            disabled={deleting === r.id}
                            className="btn-icon w-7 h-7 text-red-400 hover:bg-red-50" title="Delete">
                            {deleting === r.id
                              ? <span className="w-3.5 h-3.5 border-2 border-red-300 border-t-red-500 rounded-full animate-spin" />
                              : <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                            }
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-navy-50 bg-navy-50/30">
                <p className="text-xs text-navy-300">
                  Page {page + 1} of {totalPages} · {total} records
                </p>
                <div className="flex items-center gap-1">
                  <button onClick={() => setPage(p => Math.max(0, p - 1))}
                    disabled={page === 0}
                    className="btn-icon w-7 h-7 disabled:opacity-40">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>
                  </button>
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    const pg = totalPages <= 5 ? i : Math.max(0, Math.min(page - 2 + i, totalPages - 5 + i))
                    return (
                      <button key={pg} onClick={() => setPage(pg)}
                        className={`w-7 h-7 rounded-lg text-xs font-medium transition-colors ${pg === page ? 'bg-navy-800 text-white' : 'text-navy-400 hover:bg-navy-100'}`}>
                        {pg + 1}
                      </button>
                    )
                  })}
                  <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                    disabled={page >= totalPages - 1}
                    className="btn-icon w-7 h-7 disabled:opacity-40">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

function StatusChip({ status }) {
  const map = {
    EXCELLENT: 'bg-mint-50 text-mint-600 border border-mint-400/40',
    GOOD:      'bg-blue-50 text-blue-600 border border-blue-200',
    FAIR:      'bg-amber-50 text-amber-700 border border-amber-200',
    POOR:      'bg-red-50 text-red-600 border border-red-200',
    ACTIVE:    'bg-navy-50 text-navy-500 border border-navy-100',
    DELETED:   'bg-gray-50 text-gray-400 border border-gray-200',
  }
  return (
    <span className={`chip ${map[status] || map.ACTIVE}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60" />
      {status}
    </span>
  )
}
