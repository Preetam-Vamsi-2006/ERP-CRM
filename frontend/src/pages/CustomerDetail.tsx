import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getCustomer, updateCustomer, addFollowUpNote, Customer, FollowUpNote } from '../api/customers'
import './CustomerDetail.css'

export default function CustomerDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [notes, setNotes] = useState<FollowUpNote[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editMode, setEditMode] = useState(false)
  const [formData, setFormData] = useState<Partial<Customer>>({})
  const [newNote, setNewNote] = useState('')

  useEffect(() => {
    if (id) fetchCustomer()
  }, [id])

  const fetchCustomer = async () => {
    try {
      setLoading(true)
      const data = await getCustomer(Number(id))
      setCustomer(data.customer)
      setNotes(data.follow_up_notes)
      setFormData(data.customer)
    } catch (err: any) {
      setError('Failed to load customer')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const updated = await updateCustomer(Number(id), formData)
      setCustomer(updated)
      setEditMode(false)
    } catch (err: any) {
      setError('Failed to update customer')
    }
  }

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newNote.trim()) return
    try {
      const note = await addFollowUpNote(Number(id), newNote)
      setNotes([note, ...notes])
      setNewNote('')
    } catch (err: any) {
      setError('Failed to add note')
    }
  }

  if (loading) return <div className="loading">Loading...</div>
  if (!customer) return <div className="error-message">Customer not found</div>

  return (
    <div className="container">
      <button onClick={() => navigate('/customers')} className="back-btn">← Back</button>

      {error && <div className="error-message">{error}</div>}

      <div className="card">
        <div className="detail-header">
          <h1>{customer.customer_name}</h1>
          <button onClick={() => setEditMode(!editMode)} className="btn primary">
            {editMode ? 'Cancel' : 'Edit'}
          </button>
        </div>

        {editMode ? (
          <form onSubmit={handleUpdate}>
            <div className="form-grid">
              <div className="form-group">
                <label>Customer Name</label>
                <input value={formData.customer_name || ''} onChange={(e) => setFormData({...formData, customer_name: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" value={formData.email || ''} onChange={(e) => setFormData({...formData, email: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Mobile</label>
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
              <div className="form-group">
                <label>Follow-up Date</label>
                <input type="date" value={formData.follow_up_date?.split('T')[0] || ''} onChange={(e) => setFormData({...formData, follow_up_date: e.target.value})} />
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
            <button type="submit" className="btn primary">Save Changes</button>
          </form>
        ) : (
          <div className="detail-view">
            <div className="detail-grid">
              <div><strong>Email:</strong> {customer.email || '-'}</div>
              <div><strong>Mobile:</strong> {customer.mobile_number || '-'}</div>
              <div><strong>Business:</strong> {customer.business_name || '-'}</div>
              <div><strong>GST:</strong> {customer.gst_number || '-'}</div>
              <div><strong>Type:</strong> {customer.customer_type || '-'}</div>
              <div><strong>Status:</strong> <span className={`status ${(customer.status || '').toLowerCase()}`}>{customer.status || '-'}</span></div>
              <div><strong>Follow-up Date:</strong> {customer.follow_up_date ? new Date(customer.follow_up_date).toLocaleDateString() : '-'}</div>
            </div>
            <div><strong>Address:</strong> {customer.address || '-'}</div>
            <div><strong>Notes:</strong> {customer.notes || '-'}</div>
          </div>
        )}
      </div>

      <div className="card">
        <h2>Follow-up Notes</h2>
        <form onSubmit={handleAddNote} className="note-form">
          <textarea placeholder="Add a follow-up note..." value={newNote} onChange={(e) => setNewNote(e.target.value)} />
          <button type="submit" className="btn primary">Add Note</button>
        </form>

        <div className="notes-list">
          {notes.length === 0 ? (
            <p>No follow-up notes yet</p>
          ) : (
            notes.map((note) => (
              <div key={note.id} className="note-item">
                <p>{note.note}</p>
                <small>{new Date(note.created_at).toLocaleString()}</small>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
