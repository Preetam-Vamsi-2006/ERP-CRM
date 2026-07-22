import React, { useEffect, useState } from 'react'
import { getProducts, createProduct, Product } from '../api/products'
import './Products.css'

export default function Products() {
  const [products, setProducts] = useState<Product[]>([])
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState<Partial<Product>>({})
  const limit = 20

  useEffect(() => {
    fetchProducts()
  }, [page, search])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const data = await getProducts(page, limit, search)
      setProducts(data.data)
      setTotal(data.pagination.total)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await createProduct(formData)
      setFormData({})
      setShowForm(false)
      fetchProducts()
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to create product')
    }
  }

  const totalPages = Math.ceil(total / limit)

  return (
    <div className="container">
      <div className="page-header">
        <h1>Products</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn primary">
          {showForm ? 'Cancel' : 'Add Product'}
        </button>
      </div>

      {showForm && (
        <div className="card">
          <h2>Add New Product</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label>Product Name</label>
                <input required value={formData.product_name || ''} onChange={(e) => setFormData({...formData, product_name: e.target.value})} />
              </div>
              <div className="form-group">
                <label>SKU</label>
                <input required value={formData.sku || ''} onChange={(e) => setFormData({...formData, sku: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Category</label>
                <input value={formData.category || ''} onChange={(e) => setFormData({...formData, category: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Unit Price</label>
                <input required type="number" step="0.01" value={formData.unit_price || ''} onChange={(e) => setFormData({...formData, unit_price: parseFloat(e.target.value)})} />
              </div>
              <div className="form-group">
                <label>Stock</label>
                <input type="number" value={formData.current_stock || ''} onChange={(e) => setFormData({...formData, current_stock: parseInt(e.target.value)})} />
              </div>
              <div className="form-group">
                <label>Min Stock Alert</label>
                <input type="number" value={formData.minimum_stock_alert || ''} onChange={(e) => setFormData({...formData, minimum_stock_alert: parseInt(e.target.value)})} />
              </div>
              <div className="form-group">
                <label>Warehouse Location</label>
                <input value={formData.location_warehouse || ''} onChange={(e) => setFormData({...formData, location_warehouse: e.target.value})} />
              </div>
            </div>
            <button type="submit" className="btn primary">Create Product</button>
          </form>
        </div>
      )}

      <div className="search-bar">
        <input type="text" placeholder="Search products..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }} />
      </div>

      {loading ? (
        <div className="loading">Loading...</div>
      ) : products.length === 0 ? (
        <div className="card"><p>No products found</p></div>
      ) : (
        <>
          <div className="card table-card">
            <table>
              <thead>
                <tr>
                  <th>Product Name</th>
                  <th>SKU</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Min Alert</th>
                  <th>Location</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id} className={p.current_stock <= p.minimum_stock_alert ? 'low-stock' : ''}>
                    <td>{p.product_name}</td>
                    <td>{p.sku}</td>
                    <td>{p.category || '-'}</td>
                    <td>${typeof p.unit_price === 'number' ? p.unit_price.toFixed(2) : (parseFloat(p.unit_price) || 0).toFixed(2)}</td>
                    <td>{p.current_stock}</td>
                    <td>{p.minimum_stock_alert}</td>
                    <td>{p.location_warehouse || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="pagination">
            <button onClick={() => setPage(1)} disabled={page === 1}>«</button>
            <button onClick={() => setPage(p => p - 1)} disabled={page === 1}>‹</button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => page - 2 + i).filter(p => p > 0 && p <= totalPages).map((p) => (
              <button key={p} onClick={() => setPage(p)} className={page === p ? 'active' : ''}>{p}</button>
            ))}
            <button onClick={() => setPage(p => p + 1)} disabled={page === totalPages}>›</button>
            <button onClick={() => setPage(totalPages)} disabled={page === totalPages}>»</button>
          </div>
        </>
      )}
    </div>
  )
}
