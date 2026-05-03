import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useAppContext } from '../App'

const Orders = () => {
  const { user, showMessage, setLoading, loading } = useAppContext()
  const [orders, setOrders] = useState([])

  useEffect(() => {
    if (user) {
      fetchOrders()
    }
  }, [user])

  const fetchOrders = async () => {
    if (!user) return
    setLoading(true)
    try {
      const res = await axios.get('/api/orders', {
        params: { user_id: user.id }
      })
      setOrders(res.data)
    } catch (err) {
      console.error('获取订单失败:', err)
      showMessage('获取订单失败', 'error')
    } finally {
      setLoading(false)
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

  if (!user) {
    return (
      <div className="container">
        <div style={{ marginTop: '40px' }}>
          <div className="empty-state">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
            <h3 style={{ marginBottom: '10px' }}>请先登录</h3>
            <p style={{ color: '#999' }}>登录后可查看您的订单记录</p>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="container">
        <div className="loading">加载中...</div>
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="container">
        <div style={{ marginTop: '40px' }}>
          <div className="empty-state">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
            <h3 style={{ marginBottom: '10px' }}>暂无订单</h3>
            <p style={{ color: '#999', marginBottom: '20px' }}>您还没有任何订单记录</p>
            <button className="btn btn-primary" onClick={() => window.location.href = '/'}>去购物</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container">
      <div style={{ marginTop: '20px' }}>
        <h2 style={{ marginBottom: '20px', fontSize: '22px', color: '#2c3e50' }}>📋 我的订单</h2>

        {orders.map(order => (
          <div key={order.id} className="order-card">
            <div className="order-header">
              <div>
                <div className="order-number">订单号：{order.order_number}</div>
                <div style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>
                  下单时间：{new Date(order.created_at).toLocaleString('zh-CN')}
                </div>
              </div>
              <span className={`order-status-badge ${getStatusClass(order.status)}`}>
                {getStatusText(order.status)}
              </span>
            </div>

            <div className="order-items">
              {order.items?.map((item, idx) => (
                <div key={idx} className="order-item">
                  {item.product_image ? (
                    <img src={item.product_image} alt={item.product_name} className="order-item-image" />
                  ) : (
                    <div className="order-item-image" style={{ background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999', fontSize: '12px' }}>暂无</div>
                  )}
                  <div className="order-item-info">
                    <div className="order-item-name">{item.product_name}</div>
                    <div className="order-item-price">¥{item.price.toFixed(2)} × {item.quantity}</div>
                  </div>
                  <div className="order-item-subtotal">¥{(item.price * item.quantity).toFixed(2)}</div>
                </div>
              ))}
            </div>

            <div className="order-delivery-info">
              <p>📍 配送地址：{order.building} {order.room_number}</p>
              {order.delivery_note && <p>📝 备注：{order.delivery_note}</p>}
            </div>

            <div className="order-footer">
              <div></div>
              <div className="order-total">
                共 {order.items?.reduce((sum, item) => sum + item.quantity, 0)} 件商品，
                合计 <span>¥{order.total_amount.toFixed(2)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Orders
