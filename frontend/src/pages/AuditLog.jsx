import { useState, useEffect } from 'react'
import { getAuditLogs } from '../services/api'
import { Spinner, Empty } from '../components/Feedback'

export default function AuditLog() {
  const [logs,    setLogs]    = useState([])
  const [total,   setTotal]   = useState(0)
  const [page,    setPage]    = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    getAuditLogs(page)
      .then(r => { setLogs(r.data.content || []); setTotal(r.data.totalElements || 0) })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [page])

  const totalPages = Math.ceil(total / 20)

  const actionColor = a =>
    a === 'CREATE' ? 'bg-mint-50 text-mint-600 border border-mint-400/40' :
    a === 'UPDATE' ? 'bg-blue-50 text-blue-600 border border-blue-200'    :
    'bg-red-50 text-red-600 border border-red-200'

  return (
    <div className="space-y-4">
      <div className="animate-fade-in">
        <h2 className="font-display text-2xl text-navy-800">Audit Log</h2>
        <p className="text-sm text-navy-300 mt-0.5">{total} total actions tracked</p>
      </div>

      <div className="card !p-0 overflow-hidden animate-slide-up">
        {loading ? <Spinner text="Loading audit log…" /> : logs.length === 0 ? (
          <Empty icon="🛡️" title="No audit entries yet" sub="Actions on health records will appear here." />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    {['Time', 'Action', 'Entity', 'Record ID', 'Performed By'].map(h => (
                      <th key={h} className="tbl-th">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {logs.map((l, i) => (
                    <tr key={l.id} className="hover:bg-navy-50/50 transition-colors animate-fade-in"
                      style={{ animationDelay: `${i * 20}ms` }}>
                      <td className="tbl-td font-mono text-xs text-navy-400">
                        {new Date(l.createdAt).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="tbl-td">
                        <span className={`chip ${actionColor(l.action)}`}>{l.action}</span>
                      </td>
                      <td className="tbl-td text-navy-500">{l.entityName}</td>
                      <td className="tbl-td font-mono text-navy-400">#{l.entityId}</td>
                      <td className="tbl-td">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-navy-100 flex items-center justify-center text-xs font-semibold text-navy-600">
                            {l.performedBy?.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-navy-700">{l.performedBy}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-navy-50">
                <p className="text-xs text-navy-300">Page {page + 1} of {totalPages}</p>
                <div className="flex gap-1">
                  <button onClick={() => setPage(p => Math.max(0, p-1))} disabled={page === 0}
                    className="btn-icon w-7 h-7 disabled:opacity-40">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>
                  </button>
                  <button onClick={() => setPage(p => Math.min(totalPages-1, p+1))} disabled={page >= totalPages-1}
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
