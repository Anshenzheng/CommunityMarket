import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useAppContext } from '../App'

const AdminDashboard = () => {
  const { admin, logoutAdmin, setLoading, loading } = useAppContext()
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    setLoading(true)
    try {
      const res = await axios.get('/api/stats')
      setStats(res.data)
    } catch (err) {
      console.error('获取统计数据失败:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    logoutAdmin()
    navigate('/admin/login')
  }

  return (
    <div>
      <header className="header">
        <div className="container">
          <Link to="/admin" className="header-logo">
            <h1>🏪 超市管理后台</h1>
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <span style={{ color: 'white', fontSize: '14px' }}>管理员：{admin?.username}</span>
            <button
              onClick={handleLogout}
              style={{ background: 'none', border: '1px solid rgba(255,255,255,0.5)', color: 'white', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}
            >
              退出
            </button>
          </div>
        </div>
      </header>

      <div className="admin-layout">
        <div className="admin-sidebar">
          <Link to="/admin" className="active">📊 数据概览</Link>
          <Link to="/admin/products">📦 商品管理</Link>
          <Link to="/admin/orders">📋 订单管理</Link>
          <Link to="/admin/categories">🏷️ 分类管理</Link>
          <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #eee' }}>
            <a href="/" style={{ color: '#999', fontSize: '13px', textDecoration: 'none' }}>← 回到用户端</a>
          </div>
        </div>

        <div className="admin-content">
          <div className="page-header">
            <h2 className="page-title">数据概览</h2>
          </div>

          {loading ? (
            <div className="loading">加载中...</div>
          ) : (
            <>
              <div className="admin-stats">
                <div className="stat-card warning">
                  <div className="stat-label">待配送订单</div>
                  <div className="stat-value">{stats?.pending_orders || 0}</div>
                </div>
                <div className="stat-card info">
                  <div className="stat-label">配送中订单</div>
                  <div className="stat-value">{stats?.delivering_orders || 0}</div>
                </div>
                <div className="stat-card success">
                  <div className="stat-label">已完成订单</div>
                  <div className="stat-value">{stats?.completed_orders || 0}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">总订单数</div>
                  <div className="stat-value">{stats?.total_orders || 0}</div>
                </div>
                <div className="stat-card success">
                  <div className="stat-label">上架商品</div>
                  <div className="stat-value">{stats?.total_products || 0}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">商品分类</div>
                  <div className="stat-value">{stats?.total_categories || 0}</div>
                </div>
              </div>

              <div className="card">
                <h3 className="card-title">快捷操作</h3>
                <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                  <Link to="/admin/products" className="btn btn-primary">
                    📦 管理商品
                  </Link>
                  <Link to="/admin/orders" className="btn btn-primary">
                    📋 查看订单
                  </Link>
                  <Link to="/admin/categories" className="btn btn-secondary">
                    🏷️ 管理分类
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
