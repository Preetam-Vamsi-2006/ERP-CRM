import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getCustomers, Customer } from '../api/customers'
import './Customers.css'

export default function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState<Partial<Customer>>({})
  const limit = 20

  useEffect(() => {
    fetchCustomers()
  }, [page, search])

  const fetchCustomers = async () => {
    try {
      setLoading(true)
      const data = await getCustomers(page, limit, search)
      setCustomers(data.data)
      setTotal(data.pagination.total)
    } catch (err: any) {
      setError('Failed to load customers')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const { createCustomer } = await import('../api/customers')
      await createCustomer(formData)
      setFormData({})
      setShowForm(false)
      fetchCustomers()
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create customer')
    }
  }

  const totalPages = Math.ceil(total / limit)

  return (
    <div className="container">
      <div className="page-header">
        <h1>Customers</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn primary">
          {showForm ? 'Cancel' : 'Add Customer'}
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {showForm && (
        <div className="card">
          <h2>Add New Customer</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label>Customer Name *</label>
                <input required value={formData.customer_name || ''} onChange={(e) => setFormData({...formData, customer_name: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" value={formData.email || ''} onChange={(e) => setFormData({...formData, email: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Mobile Number</label>
                <input value={formData.mobile_number || ''} onChange={(e) => setFormData({...formData, mobile_number: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Business Name</label>
                <input value={formData.business_name || ''} onChange={(e) => setFormData({...formData, business_name: e.target.value})} />
              </div>
              <div className="form-group">
                <label>GST Number</label>
                <input value={formData.gst_number || ''} onChange={(e) => setFormData({...formData, gst_number: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Type</label>
                <select value={formData.customer_type || ''} onChange={(e) => setFormData({...formData, customer_type: e.target.value as any})}>
                  <option>Retail</option>
                  <option>Wholesale</option>
                  <option>Distributor</option>
                </select>
              </div>
              <div className="form-group">
                <label>Status</label>
                <select value={formData.status || ''} onChange={(e) => setFormData({...formData, status: e.target.value as any})}>
                  <option>Lead</option>
                  <option>Active</option>
                  <option>Inactive</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label>Address</label>
              <textarea value={formData.address || ''} onChange={(e) => setFormData({...formData, address: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Notes</label>
              <textarea value={formData.notes || ''} onChange={(e) => setFormData({...formData, notes: e.target.value})} />
            </div>
            <button type="submit" className="btn primary">Create Customer</button>
          </form>
        </div>
      )}

      <div className="search-bar">
        <input
          type="text"
          placeholder="Search by name, email, or phone..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setPage(1)
          }}
        />
      </div>

      {loading ? (
        <div className="loading">Loading customers...</div>
      ) : customers.length === 0 ? (
        <div className="card">
          <p>No customers found</p>
        </div>
      ) : (
        <>
          <div className="card table-card">
            <table>
              <thead>
                <tr>
                  <th>Customer Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Follow-up Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer) => (
                  <tr key={customer.id}>
                    <td>{customer.customer_name}</td>
                    <td>{customer.email || '-'}</td>
                    <td>{customer.mobile_number || '-'}</td>
                    <td>{customer.customer_type || '-'}</td>
                    <td>
                      <span className={`status ${(customer.status || '').toLowerCase()}`}>
                        {customer.status || '-'}
                      </span>
                    </td>
                    <td>{customer.follow_up_date ? new Date(customer.follow_up_date).toLocaleDateString() : '-'}</td>
                    <td>
                      <Link to={`/customers/${customer.id}`} className="link">View</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="pagination">
            <button onClick={() => setPage(1)} disabled={page === 1}>«</button>
            <button onClick={() => setPage(p => p - 1)} disabled={page === 1}>‹</button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={page === p ? 'active' : ''}
              >
                {p}
              </button>
            ))}
            <button onClick={() => setPage(p => p + 1)} disabled={page === totalPages}>›</button>
            <button onClick={() => setPage(totalPages)} disabled={page === totalPages}>»</button>
          </div>
        </>
      )}
    </div>
  )
}
