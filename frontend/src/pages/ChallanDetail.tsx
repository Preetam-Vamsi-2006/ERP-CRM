import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getChallan, confirmChallan, cancelChallan } from '../api/challans'
import './ChallanDetail.css'

export default function ChallanDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [challan, setChallan] = useState<any>(null)
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    if (id) fetchChallan()
  }, [id])

  const fetchChallan = async () => {
    try {
      const data = await getChallan(Number(id))
      setChallan(data.challan)
      setItems(data.items)
    } catch (err) {
      setError('Failed to load challan')
    } finally {
      setLoading(false)
    }
  }

  const handleConfirm = async () => {
    try {
      setActionLoading(true)
      const updated = await confirmChallan(Number(id))
      setChallan(updated)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to confirm')
    } finally {
      setActionLoading(false)
    }
  }

  const handleCancel = async () => {
    if (!window.confirm('Are you sure?')) return
    try {
      setActionLoading(true)
      const updated = await cancelChallan(Number(id))
      setChallan(updated)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to cancel')
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) return <div className="loading">Loading...</div>
  if (!challan) return <div className="error-message">Challan not found</div>

  const totalAmount = items.reduce((sum, item) => sum + item.unit_price * item.quantity, 0)

  return (
    <div className="container">
      <button onClick={() => navigate('/challans')} className="back-btn">← Back</button>

      {error && <div className="error-message">{error}</div>}

      <div className="card">
        <div className="challan-header">
          <h1>Challan {challan.challan_number}</h1>
          <span className={`status ${challan.status.toLowerCase()}`}>{challan.status}</span>
        </div>

        <div className="info-grid">
          <div><strong>Customer:</strong> {challan.customer_name}</div>
          <div><strong>Business:</strong> {challan.business_name}</div>
          <div><strong>Email:</strong> {challan.email}</div>
          <div><strong>Phone:</strong> {challan.mobile_number}</div>
          <div><strong>Created By:</strong> {challan.username}</div>
          <div><strong>Date:</strong> {new Date(challan.created_at).toLocaleDateString()}</div>
        </div>

        <h2 style={{ marginTop: '30px' }}>Items</h2>
        <div className="table-card">
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>SKU</th>
                <th>Unit Price</th>
                <th>Qty</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => (
                <tr key={idx}>
                  <td>{item.product_name}</td>
                  <td>{item.sku}</td>
                  <td>${item.unit_price.toFixed(2)}</td>
                  <td>{item.quantity}</td>
                  <td>${(item.unit_price * item.quantity).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="summary">
          <strong>Total Amount: ${totalAmount.toFixed(2)}</strong>
        </div>

        {challan.status === 'Draft' && (
          <div className="actions">
            <button onClick={handleConfirm} disabled={actionLoading} className="btn success">
              Confirm Challan
            </button>
            <button onClick={handleCancel} disabled={actionLoading} className="btn danger">
              Cancel
            </button>
          </div>
        )}

        {challan.status === 'Confirmed' && (
          <div className="actions">
            <button onClick={handleCancel} disabled={actionLoading} className="btn danger">
              Cancel Challan (Reverse Stock)
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
