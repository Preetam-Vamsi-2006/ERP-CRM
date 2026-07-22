import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { User } from '../api/auth'
import apiClient from '../api/client'
import './Dashboard.css'

interface DashboardProps {
  user: User
}

interface Stats {
  totalCustomers: number
  totalProducts: number
  totalChallans: number
  lowStockProducts: number
}

export default function Dashboard({ user }: DashboardProps) {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      setLoading(true)
      const [customersRes, productsRes, challansRes] = await Promise.all([
        apiClient.get('/customers?limit=1'),
        apiClient.get('/products?limit=1'),
        apiClient.get('/challans?limit=1'),
      ])

      // Get low stock products
      const productsListRes = await apiClient.get('/products?limit=100')
      const lowStockCount = productsListRes.data.data.filter((p: any) => 
        p.current_stock <= p.minimum_stock_alert
      ).length

      setStats({
        totalCustomers: customersRes.data.pagination.total,
        totalProducts: productsRes.data.pagination.total,
        totalChallans: challansRes.data.pagination.total,
        lowStockProducts: lowStockCount,
      })
    } catch (err: any) {
      setError('Failed to load dashboard stats')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="loading">Loading dashboard...</div>
  }

  return (
    <div className="container">
      <div className="dashboard-header">
        <h1>Welcome, {user.username}!</h1>
        <p>Role: {user.role}</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      {stats && (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-value">{stats.totalCustomers}</div>
            <div className="stat-label">Total Customers</div>
            <Link to="/customers" className="stat-link">View All</Link>
          </div>

          <div className="stat-card">
            <div className="stat-value">{stats.totalProducts}</div>
            <div className="stat-label">Total Products</div>
            <Link to="/products" className="stat-link">View All</Link>
          </div>

          <div className="stat-card">
            <div className="stat-value">{stats.totalChallans}</div>
            <div className="stat-label">Total Challans</div>
            <Link to="/challans" className="stat-link">View All</Link>
          </div>

          <div className="stat-card alert">
            <div className="stat-value">{stats.lowStockProducts}</div>
            <div className="stat-label">Low Stock Items</div>
            <Link to="/products" className="stat-link">Check Stock</Link>
          </div>
        </div>
      )}

      <div className="dashboard-actions">
        <h2>Quick Actions</h2>
        <div className="action-buttons">
          {(user.role === 'Sales' || user.role === 'Admin') && (
            <>
              <Link to="/customers" className="action-btn primary">
                Add/View Customers
              </Link>
              <Link to="/challans/new" className="action-btn primary">
                Create Challan
              </Link>
            </>
          )}
          {(user.role === 'Warehouse' || user.role === 'Admin') && (
            <Link to="/products" className="action-btn primary">
              Manage Products
            </Link>
          )}
          {(user.role === 'Accounts' || user.role === 'Admin') && (
            <Link to="/challans" className="action-btn primary">
              View Challans
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
