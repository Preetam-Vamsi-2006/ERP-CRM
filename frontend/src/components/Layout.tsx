import React from 'react'
import { Outlet, Link, useNavigate } from 'react-router-dom'
import { User } from '../api/auth'
import './Layout.css'

interface LayoutProps {
  user: User
  setUser: (user: User | null) => void
}

export default function Layout({ user, setUser }: LayoutProps) {
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.removeItem('authToken')
    localStorage.removeItem('user')
    setUser(null)
    navigate('/login')
  }

  return (
    <div className="layout">
      <nav className="navbar">
        <div className="navbar-brand">
          <h1>ERP/CRM Portal</h1>
        </div>
        <ul className="navbar-menu">
          <li><Link to="/">Dashboard</Link></li>
          <li><Link to="/customers">Customers</Link></li>
          <li><Link to="/products">Products</Link></li>
          <li><Link to="/challans">Challans</Link></li>
        </ul>
        <div className="navbar-right">
          <span className="user-info">
            {user.username} ({user.role})
          </span>
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </div>
      </nav>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  )
}
