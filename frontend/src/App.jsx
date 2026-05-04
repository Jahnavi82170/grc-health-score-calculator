import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './services/AuthContext'
import Layout    from './components/Layout'
import Login     from './pages/Login'
import Register  from './pages/Register'
import Dashboard from './pages/Dashboard'
import RecordList   from './pages/RecordList'
import RecordDetail from './pages/RecordDetail'
import RecordForm   from './pages/RecordForm'
import Analytics    from './pages/Analytics'
import AuditLog     from './pages/AuditLog'

function Protected({ children }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-navy-50">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-mint border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-navy-300 font-body">Loading Tool-86…</p>
      </div>
    </div>
  )
  return user ? children : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login"    element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<Protected><Layout /></Protected>}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard"       element={<Dashboard />} />
            <Route path="records"         element={<RecordList />} />
            <Route path="records/new"     element={<RecordForm />} />
            <Route path="records/:id"     element={<RecordDetail />} />
            <Route path="records/:id/edit" element={<RecordForm />} />
            <Route path="analytics"       element={<Analytics />} />
            <Route path="audit-log"       element={<AuditLog />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
