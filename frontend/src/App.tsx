import React, { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Customers from './pages/Customers'
import CustomerDetail from './pages/CustomerDetail'
import Products from './pages/Products'
import Challans from './pages/Challans'
import ChallanForm from './pages/ChallanForm'
import ChallanDetail from './pages/ChallanDetail'
import Layout from './components/Layout'
import { User } from './api/auth'
import './App.css'

function App() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setLoading(false)
  }, [])

  if (loading) {
    return <div className="loading">Loading...</div>
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login setUser={setUser} />} />
        {user ? (
          <Route element={<Layout user={user} setUser={setUser} />}>
            <Route path="/" element={<Dashboard user={user} />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/customers/:id" element={<CustomerDetail />} />
            <Route path="/products" element={<Products />} />
            <Route path="/challans" element={<Challans />} />
            <Route path="/challans/new" element={<ChallanForm />} />
            <Route path="/challans/:id" element={<ChallanDetail />} />
          </Route>
        ) : (
          <Route path="*" element={<Navigate to="/login" />} />
        )}
      </Routes>
    </BrowserRouter>
  )
}

export default App
