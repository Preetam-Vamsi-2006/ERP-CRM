import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login, User } from '../api/auth'
import './Login.css'

interface LoginProps {
  setUser: (user: User) => void
}

export default function Login({ setUser }: LoginProps) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await login(username, password)
      localStorage.setItem('authToken', response.token)
      localStorage.setItem('user', JSON.stringify(response.user))
      setUser(response.user)
      navigate('/')
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-container">
      <div className="login-box">
        <h1>ERP/CRM Portal</h1>
        <h2>Login</h2>
        
        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <button type="submit" className="primary" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="demo-credentials">
          <p>Demo Credentials:</p>
          <ul>
            <li><strong>Admin:</strong> admin / admin123</li>
            <li><strong>Sales:</strong> sales / sales123</li>
            <li><strong>Warehouse:</strong> warehouse / warehouse123</li>
            <li><strong>Accounts:</strong> accounts / accounts123</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
