import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getChallans, Challan } from '../api/challans'
import './Challans.css'

export default function Challans() {
  const [challans, setChallans] = useState<any[]>([])
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const limit = 20

  useEffect(() => {
    fetchChallans()
  }, [page, statusFilter])

  const fetchChallans = async () => {
    try {
      setLoading(true)
      const data = await getChallans(page, limit, statusFilter || undefined)
      setChallans(data.data)
      setTotal(data.pagination.total)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const totalPages = Math.ceil(total / limit)

  return (
    <div className="container">
      <div className="page-header">
        <h1>Sales Challans</h1>
        <Link to="/challans/new" className="btn primary">Create Challan</Link>
      </div>

      <div className="filters">
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}>
          <option value="">All Status</option>
          <option value="Draft">Draft</option>
          <option value="Confirmed">Confirmed</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>

      {loading ? (
        <div className="loading">Loading...</div>
      ) : challans.length === 0 ? (
        <div className="card"><p>No challans found</p></div>
      ) : (
        <>
          <div className="card table-card">
            <table>
              <thead>
                <tr>
                  <th>Challan #</th>
                  <th>Customer</th>
                  <th>Total Qty</th>
                  <th>Status</th>
                  <th>Created By</th>
                  <th>Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {challans.map((c) => (
                  <tr key={c.id}>
                    <td>{c.challan_number}</td>
                    <td>{c.customer_name}</td>
                    <td>{c.total_quantity}</td>
                    <td><span className={`status ${c.status.toLowerCase()}`}>{c.status}</span></td>
                    <td>{c.username}</td>
                    <td>{new Date(c.created_at).toLocaleDateString()}</td>
                    <td><Link to={`/challans/${c.id}`} className="link">View</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="pagination">
            <button onClick={() => setPage(1)} disabled={page === 1}>«</button>
            <button onClick={() => setPage(p => p - 1)} disabled={page === 1}>‹</button>
            <button className="active">{page}</button>
            <button onClick={() => setPage(p => p + 1)} disabled={page === totalPages}>›</button>
            <button onClick={() => setPage(totalPages)} disabled={page === totalPages}>»</button>
          </div>
        </>
      )}
    </div>
  )
}
