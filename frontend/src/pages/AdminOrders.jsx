import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { useAppContext } from '../App'

const AdminOrders = () => {
  const { showMessage, setLoading, loading, admin, logoutAdmin } = useAppContext()
  const [orders, setOrders] = useState([])
  const [filters, setFilters] = useState({
    status: '',
    start_date: '',
    end_date: ''
  })

  useEffect(() => {
    fetchOrders()
  }, [filters])

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const params = {}
      if (filters.status) params.status = filters.status
      if (filters.start_date) params.start_date = filters.start_date
      if (filters.end_date) params.end_date = filters.end_date
      
      const res = await axios.get('/api/orders', { params })
      setOrders(res.data)
    } catch (err) {
      console.error('获取订单失败:', err)
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = async (orderId, status) => {
    try {
      await axios.put(`/api/orders/${orderId}/status`, { status })
      showMessage('订单状态已更新')
      fetchOrders()
    } catch (err) {
      showMessage('更新失败', 'error')
    }
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

  const statusOptions = [
    { value: '', label: '全部状态' },
    { value: 'pending', label: '待配送' },
    { value: 'delivering', label: '配送中' },
    { value: 'completed', label: '已完成' },
    { value: 'cancelled', label: '已取消' }
  ]

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
              onClick={logoutAdmin}
              style={{ background: 'none', border: '1px solid rgba(255,255,255,0.5)', color: 'white', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}
            >
              退出
            </button>
          </div>
        </div>
      </header>

      <div className="admin-layout">
        <div className="admin-sidebar">
          <Link to="/admin">📊 数据概览</Link>
          <Link to="/admin/products">📦 商品管理</Link>
          <Link to="/admin/orders" className="active">📋 订单管理</Link>
          <Link to="/admin/categories">🏷️ 分类管理</Link>
        </div>

        <div className="admin-content">
          <div className="page-header">
            <h2 className="page-title">订单管理</h2>
          </div>

          <div className="filters">
            <div className="filter-item">
              <label>订单状态</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              >
                {statusOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div className="filter-item">
              <label>开始日期</label>
              <input
                type="date"
                value={filters.start_date}
                onChange={(e) => setFilters({ ...filters, start_date: e.target.value })}
              />
            </div>
            <div className="filter-item">
              <label>结束日期</label>
              <input
                type="date"
                value={filters.end_date}
                onChange={(e) => setFilters({ ...filters, end_date: e.target.value })}
              />
            </div>
            <div className="filter-item">
              <label style={{ visibility: 'hidden' }}>操作</label>
              <button className="btn btn-sm btn-secondary" onClick={() => setFilters({ status: '', start_date: '', end_date: '' })}>
                重置筛选
              </button>
            </div>
          </div>

          {loading ? (
            <div className="loading">加载中...</div>
          ) : (
            <div className="data-table">
              <table>
                <thead>
                  <tr>
                    <th>订单号</th>
                    <th>下单时间</th>
                    <th>配送地址</th>
                    <th>商品</th>
                    <th>金额</th>
                    <th>状态</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(order => (
                    <tr key={order.id}>
                      <td style={{ fontWeight: '500' }}>{order.order_number}</td>
                      <td style={{ fontSize: '13px', color: '#666' }}>
                        {new Date(order.created_at).toLocaleString('zh-CN')}
                      </td>
                      <td>
                        <div>{order.building} {order.room_number}</div>
                        {order.delivery_note && (
                          <div style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>
                            备注：{order.delivery_note}
                          </div>
                        )}
                      </td>
                      <td>
                        <div style={{ maxWidth: '200px' }}>
                          {order.items?.slice(0, 2).map((item, idx) => (
                            <div key={idx} style={{ fontSize: '13px' }}>
                              {item.product_name} × {item.quantity}
                            </div>
                          ))}
                          {order.items?.length > 2 && (
                            <div style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>
                              等{order.items.length}件商品
                            </div>
                          )}
                        </div>
                      </td>
                      <td style={{ color: '#e74c3c', fontWeight: '600' }}>
                        ¥{order.total_amount.toFixed(2)}
                      </td>
                      <td>
                        <span className={`order-status-badge ${getStatusClass(order.status)}`}>
                          {getStatusText(order.status)}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                          {order.status === 'pending' && (
                            <>
                              <button
                                className="btn btn-sm btn-primary"
                                onClick={() => updateOrderStatus(order.id, 'delivering')}
                              >开始配送</button>
                              <button
                                className="btn btn-sm btn-danger"
                                onClick={() => updateOrderStatus(order.id, 'cancelled')}
                              >取消订单</button>
                            </>
                          )}
                          {order.status === 'delivering' && (
                            <>
                              <button
                                className="btn btn-sm btn-primary"
                                onClick={() => updateOrderStatus(order.id, 'completed')}
                              >完成配送</button>
                              <button
                                className="btn btn-sm btn-danger"
                                onClick={() => updateOrderStatus(order.id, 'cancelled')}
                              >取消订单</button>
                            </>
                          )}
                          {(order.status === 'completed' || order.status === 'cancelled') && (
                            <span style={{ fontSize: '13px', color: '#999' }}>已结束</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {orders.length === 0 && (
                <div className="empty-state" style={{ padding: '40px' }}>
                  <p>暂无订单</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminOrders
