import axios from 'axios'

const API = axios.create({ baseURL: '/api', timeout: 15000 })

// Attach JWT on every request
API.interceptors.request.use(cfg => {
  const token = localStorage.getItem('token')
  if (token) cfg.headers.Authorization = `Bearer ${token}`
  return cfg
})

// Global 401 handler
API.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.clear()
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

// ── Auth ────────────────────────────────────────────────────
export const authLogin    = data => API.post('/auth/login', data)
export const authRegister = data => API.post('/auth/register', data)

// ── Health Records ──────────────────────────────────────────
export const getRecords    = (page = 0, size = 10, sort = 'createdAt') =>
  API.get(`/health-records?page=${page}&size=${size}&sortBy=${sort}`)

export const getRecord     = id  => API.get(`/health-records/${id}`)
export const createRecord  = data => API.post('/health-records', data)
export const updateRecord  = (id, data) => API.put(`/health-records/${id}`, data)
export const deleteRecord  = id  => API.delete(`/health-records/${id}`)
export const searchRecords = (q, page = 0) =>
  API.get(`/health-records/search?q=${encodeURIComponent(q)}&page=${page}`)
export const getStats      = ()  => API.get('/health-records/stats')
export const exportCsv     = ()  => API.get('/health-records/export', { responseType: 'blob' })

// ── AI ──────────────────────────────────────────────────────
export const aiRecommend   = id  => API.post(`/health-records/${id}/ai/recommend`)
export const aiReport      = id  => API.post(`/health-records/${id}/ai/report`)

// ── Audit Logs ──────────────────────────────────────────────
export const getAuditLogs  = (page = 0) =>
  API.get(`/audit-logs?page=${page}&size=20`)
