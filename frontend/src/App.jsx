import React, { useState, useEffect, createContext, useContext } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import axios from 'axios'
import Header from './components/Header'
import Home from './pages/Home'
import Cart from './pages/Cart'
import Orders from './pages/Orders'
import AdminLogin from './pages/AdminLogin'
import AdminDashboard from './pages/AdminDashboard'
import AdminProducts from './pages/AdminProducts'
import AdminOrders from './pages/AdminOrders'
import AdminCategories from './pages/AdminCategories'

export const AppContext = createContext()

const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [admin, setAdmin] = useState(null)
  const [cart, setCart] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)

  useEffect(() => {
    const savedUser = localStorage.getItem('market_user')
    const savedAdmin = localStorage.getItem('market_admin')
    const savedCart = localStorage.getItem('market_cart')
    
    if (savedUser) setUser(JSON.parse(savedUser))
    if (savedAdmin) setAdmin(JSON.parse(savedAdmin))
    if (savedCart) setCart(JSON.parse(savedCart))
    
    fetchCategories()
  }, [])

  useEffect(() => {
    localStorage.setItem('market_cart', JSON.stringify(cart))
  }, [cart])

  const fetchCategories = async () => {
    try {
      const res = await axios.get('/api/categories')
      setCategories(res.data)
    } catch (err) {
      console.error('获取分类失败:', err)
    }
  }

  const showMessage = (msg, type = 'success') => {
    setMessage({ text: msg, type })
    setTimeout(() => setMessage(null), 3000)
  }

  const loginOrRegisterUser = async (username, phone = '') => {
    try {
      const res = await axios.post('/api/users', { username, phone })
      setUser(res.data)
      localStorage.setItem('market_user', JSON.stringify(res.data))
      showMessage('登录成功！')
      return res.data
    } catch (err) {
      showMessage('登录失败', 'error')
      throw err
    }
  }

  const logoutUser = () => {
    setUser(null)
    localStorage.removeItem('market_user')
  }

  const loginAdmin = async (username, password) => {
    try {
      const res = await axios.post('/api/admin/login', { username, password })
      if (res.data.success) {
        setAdmin(res.data.admin)
        localStorage.setItem('market_admin', JSON.stringify(res.data.admin))
        showMessage('管理员登录成功！')
        return true
      }
      showMessage(res.data.error || '登录失败', 'error')
      return false
    } catch (err) {
      showMessage('登录失败', 'error')
      return false
    }
  }

  const logoutAdmin = () => {
    setAdmin(null)
    localStorage.removeItem('market_admin')
  }

  const addToCart = (product, quantity = 1) => {
    setCart(prev => {
      const existing = prev.find(item => item.product_id === product.id)
      if (existing) {
        return prev.map(item =>
          item.product_id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      }
      return [...prev, {
        product_id: product.id,
        product_name: product.name,
        product_image: product.image_url,
        price: product.price,
        quantity
      }]
    })
    showMessage('已添加到购物车')
  }

  const updateCartQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId)
      return
    }
    setCart(prev =>
      prev.map(item =>
        item.product_id === productId ? { ...item, quantity } : item
      )
    )
  }

  const removeFromCart = (productId) => {
    setCart(prev => prev.filter(item => item.product_id !== productId))
  }

  const clearCart = () => {
    setCart([])
  }

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <AppContext.Provider value={{
      user,
      admin,
      cart,
      categories,
      loading,
      message,
      setLoading,
      showMessage,
      loginOrRegisterUser,
      logoutUser,
      loginAdmin,
      logoutAdmin,
      addToCart,
      updateCartQuantity,
      removeFromCart,
      clearCart,
      cartTotal,
      cartCount,
      fetchCategories
    }}>
      {message && (
        <div className={`alert alert-${message.type}`} style={{ position: 'fixed', top: '80px', right: '20px', zIndex: 1000 }}>
          {message.text}
        </div>
      )}
      {children}
    </AppContext.Provider>
  )
}

export const useAppContext = () => useContext(AppContext)

const AdminRoute = ({ children }) => {
  const { admin } = useAppContext()
  return admin ? children : <Navigate to="/admin/login" />
}

const App = () => {
  return (
    <BrowserRouter>
      <AppProvider>
        <Routes>
          <Route path="/" element={
            <>
              <Header />
              <Home />
            </>
          } />
          <Route path="/cart" element={
            <>
              <Header />
              <Cart />
            </>
          } />
          <Route path="/orders" element={
            <>
              <Header />
              <Orders />
            </>
          } />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          } />
          <Route path="/admin/products" element={
            <AdminRoute>
              <AdminProducts />
            </AdminRoute>
          } />
          <Route path="/admin/orders" element={
            <AdminRoute>
              <AdminOrders />
            </AdminRoute>
          } />
          <Route path="/admin/categories" element={
            <AdminRoute>
              <AdminCategories />
            </AdminRoute>
          } />
        </Routes>
      </AppProvider>
    </BrowserRouter>
  )
}

export default App
