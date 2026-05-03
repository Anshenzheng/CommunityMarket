import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAppContext } from '../App'

const Header = () => {
  const location = useLocation()
  const { user, cartCount, loginOrRegisterUser, logoutUser } = useAppContext()
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [loginUsername, setLoginUsername] = useState('')
  const [loginPhone, setLoginPhone] = useState('')

  const isActive = (path) => location.pathname === path

  const handleLogin = async (e) => {
    e.preventDefault()
    if (!loginUsername.trim()) return
    await loginOrRegisterUser(loginUsername.trim(), loginPhone.trim())
    setShowLoginModal(false)
    setLoginUsername('')
    setLoginPhone('')
  }

  const getStatusText = (status) => {
    const statusMap = {
      'pending': '待配送',
      'delivering': '配送中',
      'completed': '已完成',
      'cancelled': '已取消'
    }
    return statusMap[status] || status
  }

  const getStatusClass = (status) => {
    const classMap = {
      'pending': 'order-status-pending',
      'delivering': 'order-status-delivering',
      'completed': 'order-status-completed',
      'cancelled': 'order-status-cancelled'
    }
    return classMap[status] || ''
  }

  return (
    <>
      <header className="header">
        <div className="container">
          <Link to="/" className="header-logo">
            <h1>🏪 小区超市</h1>
          </Link>
          <nav className="header-nav">
            <Link to="/" className={isActive('/') ? 'active' : ''}>
              首页
            </Link>
            <Link to="/cart" className={isActive('/cart') ? 'active' : ''}>
              购物车
              {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </Link>
            <Link to="/orders" className={isActive('/orders') ? 'active' : ''}>
              我的订单
            </Link>
            {user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ color: 'white', fontSize: '14px' }}>欢迎, {user.username}</span>
                <button
                  onClick={logoutUser}
                  style={{ background: 'none', border: '1px solid rgba(255,255,255,0.5)', color: 'white', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}
                >
                  退出
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowLoginModal(true)}
                style={{ background: 'white', border: 'none', color: '#4CAF50', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: '500', fontSize: '14px' }}
              >
                登录
              </button>
            )}
          </nav>
        </div>
      </header>

      {showLoginModal && (
        <div className="modal-overlay" onClick={() => setShowLoginModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>业主登录</h3>
              <button className="modal-close" onClick={() => setShowLoginModal(false)}>×</button>
            </div>
            <form onSubmit={handleLogin}>
              <div className="modal-body">
                <p style={{ fontSize: '13px', color: '#666', marginBottom: '20px' }}>请输入您的姓名或手机号，首次使用将自动注册</p>
                <div className="form-group">
                  <label className="form-label">姓名/昵称 *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={loginUsername}
                    onChange={(e) => setLoginUsername(e.target.value)}
                    placeholder="请输入您的姓名或昵称"
                    required
                    autoFocus
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">手机号 (选填)</label>
                  <input
                    type="tel"
                    className="form-input"
                    value={loginPhone}
                    onChange={(e) => setLoginPhone(e.target.value)}
                    placeholder="请输入手机号"
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowLoginModal(false)}>取消</button>
                <button type="submit" className="btn btn-primary">登录</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}

export default Header
