import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../services/AuthContext'
import { authLogin } from '../services/api'

export default function Login() {
  const [form, setForm]   = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { loginUser } = useAuth()
  const navigate = useNavigate()

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await authLogin(form)
      loginUser(res.data)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid username or password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel — branding */}
      <div className="hidden lg:flex w-1/2 bg-navy-800 flex-col items-center justify-center p-12 relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute w-96 h-96 rounded-full border border-white/5 top-[-80px] left-[-80px]" />
        <div className="absolute w-64 h-64 rounded-full border border-white/5 bottom-[-40px] right-[-40px]" />
        <div className="absolute w-32 h-32 rounded-full bg-mint/10 bottom-20 left-20" />

        <div className="relative z-10 text-center max-w-sm">
          <div className="w-16 h-16 rounded-2xl bg-mint flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          </div>
          <h1 className="font-display text-4xl text-white mb-3">Health Score Calculator</h1>
          <p className="text-navy-200 text-sm leading-relaxed">
            AI-powered health score calculator. Enter your metrics and get an instant health assessment powered by LLaMA 3.
          </p>

          <div className="mt-10 grid grid-cols-3 gap-4 text-center">
            {[['30+', 'Metrics tracked'], ['AI', 'Powered analysis'], ['Real-time', 'Score updates']].map(([val, lbl]) => (
              <div key={lbl} className="bg-white/5 rounded-2xl p-4">
                <p className="font-display text-xl text-mint">{val}</p>
                <p className="text-navy-300 text-xs mt-1">{lbl}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-[#F0F4F8]">
        <div className="w-full max-w-sm animate-fade-in">

          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="w-12 h-12 rounded-2xl bg-mint flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
            </div>
            <h1 className="font-display text-2xl text-navy-800">Health Score Calculator</h1>
          </div>

          <div className="card">
            <h2 className="font-display text-2xl text-navy-800 mb-1">Welcome back</h2>
            <p className="text-navy-300 text-sm mb-6">Sign in to your account</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
                  {error}
                </div>
              )}

              <div>
                <label className="input-label">Username</label>
                <input className="input" type="text" placeholder="Enter your username"
                  value={form.username} onChange={set('username')} required autoFocus />
              </div>

              <div>
                <label className="input-label">Password</label>
                <input className="input" type="password" placeholder="Enter your password"
                  value={form.password} onChange={set('password')} required />
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3 mt-2">
                {loading
                  ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Signing in…</>
                  : 'Sign in'}
              </button>
            </form>

            <p className="text-center text-sm text-black -300 mt-5">
              No account?{' '}
              <Link to="/register" className="text-black font-medium hover:underline">Create one</Link>
            </p>
          </div>

          {/* Demo credentials hint */}
          <div className="mt-4 card-sm text-center">
            <p className="text-xs text-navy-300">Demo login</p>
            <p className="font-mono text-xs text-navy-600 mt-1">
              <span className="bg-navy-50 px-2 py-0.5 rounded">admin</span>
              {' / '}
              <span className="bg-navy-50 px-2 py-0.5 rounded">admin@123</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
