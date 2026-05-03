import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useAppContext } from '../App'

const Cart = () => {
  const { user, cart, cartTotal, updateCartQuantity, removeFromCart, clearCart, showMessage, setLoading, loading } = useAppContext()
  const navigate = useNavigate()
  const [showCheckoutModal, setShowCheckoutModal] = useState(false)
  const [checkoutForm, setCheckoutForm] = useState({
    building: '',
    room_number: '',
    delivery_note: ''
  })

  const handleCheckout = async (e) => {
    e.preventDefault()
    if (!user) {
      showMessage('请先登录', 'error')
      return
    }
    if (!checkoutForm.building || !checkoutForm.room_number) {
      showMessage('请填写楼栋和房号', 'error')
      return
    }

    setLoading(true)
    try {
      const res = await axios.post('/api/orders', {
        user_id: user.id,
        items: cart,
        building: checkoutForm.building,
        room_number: checkoutForm.room_number,
        delivery_note: checkoutForm.delivery_note
      })
      showMessage('下单成功！')
      clearCart()
      setShowCheckoutModal(false)
      setCheckoutForm({ building: '', room_number: '', delivery_note: '' })
      navigate('/orders')
    } catch (err) {
      showMessage(err.response?.data?.error || '下单失败', 'error')
    } finally {
      setLoading(false)
    }
  }

  if (cart.length === 0) {
    return (
      <div className="container">
        <div style={{ marginTop: '40px' }}>
          <div className="empty-state">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            <h3 style={{ marginBottom: '10px' }}>购物车是空的</h3>
            <p style={{ color: '#999', marginBottom: '20px' }}>去逛逛，把喜欢的商品加入购物车吧</p>
            <button className="btn btn-primary" onClick={() => navigate('/')}>去购物</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container">
      <div style={{ marginTop: '20px' }}>
        <h2 style={{ marginBottom: '20px', fontSize: '22px', color: '#2c3e50' }}>🛒 我的购物车</h2>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '20px' }}>
          <div className="card">
            <h3 className="card-title">商品列表 ({cart.length}件)</h3>
            {cart.map(item => (
              <div key={item.product_id} className="cart-item">
                {item.product_image ? (
                  <img src={item.product_image} alt={item.product_name} className="cart-item-image" />
                ) : (
                  <div className="cart-item-image" style={{ background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' }}>暂无图片</div>
                )}
                <div className="cart-item-info">
                  <div className="cart-item-name">{item.product_name}</div>
                  <div className="cart-item-price">¥{item.price.toFixed(2)}</div>
                </div>
                <div className="cart-item-actions">
                  <div className="quantity-controls">
                    <button
                      className="quantity-btn"
                      onClick={() => updateCartQuantity(item.product_id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                    >-</button>
                    <span className="quantity-display">{item.quantity}</span>
                    <button
                      className="quantity-btn"
                      onClick={() => updateCartQuantity(item.product_id, item.quantity + 1)}
                    >+</button>
                  </div>
                  <div style={{ minWidth: '80px', textAlign: 'right', fontWeight: '600', color: '#e74c3c' }}>
                    ¥{(item.price * item.quantity).toFixed(2)}
                  </div>
                  <button
                    className="remove-btn"
                    onClick={() => removeFromCart(item.product_id)}
                    title="删除"
                  >×</button>
                </div>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            <h3 className="card-title">订单摘要</h3>
            <div className="cart-summary-row">
              <span className="cart-summary-label">商品数量</span>
              <span>{cart.reduce((sum, item) => sum + item.quantity, 0)} 件</span>
            </div>
            <div className="cart-summary-row">
              <span className="cart-summary-label">商品金额</span>
              <span>¥{cartTotal.toFixed(2)}</span>
            </div>
            <div className="cart-summary-row">
              <span className="cart-summary-label">配送费</span>
              <span style={{ color: '#4CAF50' }}>免费</span>
            </div>
            <div className="cart-summary-row">
              <span className="cart-summary-label" style={{ fontSize: '16px' }}>应付总额</span>
              <span className="cart-summary-value" style={{ fontSize: '22px' }}>¥{cartTotal.toFixed(2)}</span>
            </div>
            <button
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '20px', fontSize: '16px', padding: '14px' }}
              onClick={() => {
                if (!user) {
                  showMessage('请先登录', 'error')
                  return
                }
                setShowCheckoutModal(true)
              }}
              disabled={loading}
            >
              {loading ? '提交中...' : '去结算'}
            </button>
          </div>
        </div>
      </div>

      {showCheckoutModal && (
        <div className="modal-overlay" onClick={() => setShowCheckoutModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>填写配送信息</h3>
              <button className="modal-close" onClick={() => setShowCheckoutModal(false)}>×</button>
            </div>
            <form onSubmit={handleCheckout}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">楼栋 *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={checkoutForm.building}
                    onChange={(e) => setCheckoutForm({ ...checkoutForm, building: e.target.value })}
                    placeholder="例如：1栋、2栋"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">房号 *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={checkoutForm.room_number}
                    onChange={(e) => setCheckoutForm({ ...checkoutForm, room_number: e.target.value })}
                    placeholder="例如：101、202"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">配送备注</label>
                  <textarea
                    className="form-input"
                    value={checkoutForm.delivery_note}
                    onChange={(e) => setCheckoutForm({ ...checkoutForm, delivery_note: e.target.value })}
                    placeholder="例如：放在门口、晚上8点后配送等"
                    rows={3}
                  />
                </div>
                <div style={{ background: '#f8f9fa', padding: '12px', borderRadius: '8px', marginTop: '10px' }}>
                  <div className="flex justify-between">
                    <span>订单总额：</span>
                    <span style={{ fontSize: '18px', fontWeight: '700', color: '#e74c3c' }}>¥{cartTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowCheckoutModal(false)}>取消</button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? '提交中...' : '确认下单'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Cart
