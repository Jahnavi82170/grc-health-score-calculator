import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]     = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token    = localStorage.getItem('token')
    const username = localStorage.getItem('username')
    const role     = localStorage.getItem('role')
    if (token && username) setUser({ token, username, role })
    setLoading(false)
  }, [])

  const loginUser = data => {
    localStorage.setItem('token',    data.token)
    localStorage.setItem('username', data.username)
    localStorage.setItem('role',     data.role)
    setUser(data)
  }

  const logoutUser = () => {
    localStorage.clear()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loginUser, logoutUser, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
