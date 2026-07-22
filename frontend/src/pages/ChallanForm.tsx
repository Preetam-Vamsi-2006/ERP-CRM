import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getCustomers } from '../api/customers'
import { getProducts } from '../api/products'
import { createChallan } from '../api/challans'
import './ChallanForm.css'

interface ChallanItem {
  product_id: number
  product_name: string
  sku: string
  unit_price: number
  quantity: number
}

export default function ChallanForm() {
  const navigate = useNavigate()
  const [customers, setCustomers] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [selectedCustomer, setSelectedCustomer] = useState('')
  const [items, setItems] = useState<ChallanItem[]>([])
  const [selectedProduct, setSelectedProduct] = useState('')
  const [quantity, setQuantity] = useState('')
  const [status, setStatus] = useState('Draft')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [custData, prodData] = await Promise.all([
        getCustomers(1, 100),
        getProducts(1, 100),
      ])
      setCustomers(custData.data)
      setProducts(prodData.data)
    } catch (err) {
      setError('Failed to load data')
    }
  }

  const handleAddItem = () => {
    if (!selectedProduct || !quantity) return

    const product = products.find((p) => p.id === parseInt(selectedProduct))
    if (!product) return

    const newItem: ChallanItem = {
      product_id: product.id,
      product_name: product.product_name,
      sku: product.sku,
      unit_price: product.unit_price,
      quantity: parseInt(quantity),
    }

    if (status === 'Confirmed' && product.current_stock < newItem.quantity) {
      setError(`Insufficient stock for ${product.product_name}`)
      return
    }

    setItems([...items, newItem])
    setSelectedProduct('')
    setQuantity('')
    setError('')
  }

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedCustomer || items.length === 0) {
      setError('Please select customer and add items')
      return
    }

    try {
      setLoading(true)
      const challanItems = items.map((item) => ({
        product_id: item.product_id,
        quantity: item.quantity,
      }))
      await createChallan(parseInt(selectedCustomer), challanItems, status as any)
      navigate('/challans')
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create challan')
    } finally {
      setLoading(false)
    }
  }

  const totalAmount = items.reduce((sum, item) => sum + item.unit_price * item.quantity, 0)

  return (
    <div className="container">
      <button onClick={() => navigate('/challans')} className="back-btn">← Back</button>

      <div className="card">
        <h1>Create Sales Challan</h1>
        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Customer *</label>
            <select value={selectedCustomer} onChange={(e) => setSelectedCustomer(e.target.value)} required>
              <option value="">Select Customer</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.customer_name} ({c.business_name})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option>Draft</option>
              <option>Confirmed</option>
            </select>
          </div>

          <div className="form-group">
            <label>Add Items</label>
            <div className="add-item-row">
              <select value={selectedProduct} onChange={(e) => setSelectedProduct(e.target.value)}>
                <option value="">Select Product</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.product_name} (Stock: {p.current_stock})
                  </option>
                ))}
              </select>
              <input type="number" placeholder="Quantity" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
              <button type="button" onClick={handleAddItem} className="btn primary">Add</button>
            </div>
          </div>

          <div className="items-table">
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>SKU</th>
                  <th>Price</th>
                  <th>Qty</th>
                  <th>Total</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => (
                  <tr key={idx}>
                    <td>{item.product_name}</td>
                    <td>{item.sku}</td>
                    <td>${typeof item.unit_price === 'number' ? item.unit_price.toFixed(2) : parseFloat(item.unit_price || '0').toFixed(2)}</td>
                    <td>{item.quantity}</td>
                    <td>${typeof item.unit_price === 'number' ? (item.unit_price * item.quantity).toFixed(2) : (parseFloat(item.unit_price || '0') * item.quantity).toFixed(2)}</td>
                    <td><button type="button" onClick={() => handleRemoveItem(idx)} className="btn danger">Remove</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="summary">
            <strong>Total Amount: ${totalAmount.toFixed(2)}</strong>
          </div>

          <button type="submit" className="btn primary" disabled={loading}>
            {loading ? 'Creating...' : 'Create Challan'}
          </button>
        </form>
      </div>
    </div>
  )
}
