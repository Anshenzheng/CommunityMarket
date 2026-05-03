import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { useAppContext } from '../App'

const AdminProducts = () => {
  const { categories, showMessage, setLoading, loading, admin, logoutAdmin, fetchCategories } = useAppContext()
  const [products, setProducts] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    category_id: '',
    image_url: '',
    is_active: true
  })

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const res = await axios.get('/api/products/all')
      setProducts(res.data)
    } catch (err) {
      console.error('获取商品失败:', err)
    } finally {
      setLoading(false)
    }
  }

  const openAddModal = () => {
    setEditingProduct(null)
    setForm({
      name: '',
      description: '',
      price: '',
      stock: '',
      category_id: categories[0]?.id || '',
      image_url: '',
      is_active: true
    })
    setShowModal(true)
  }

  const openEditModal = (product) => {
    setEditingProduct(product)
    setForm({
      name: product.name,
      description: product.description || '',
      price: product.price,
      stock: product.stock,
      category_id: product.category_id,
      image_url: product.image_url || '',
      is_active: product.is_active
    })
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      if (editingProduct) {
        await axios.put(`/api/products/${editingProduct.id}`, form)
        showMessage('商品更新成功！')
      } else {
        await axios.post('/api/products', form)
        showMessage('商品添加成功！')
      }
      setShowModal(false)
      fetchProducts()
    } catch (err) {
      showMessage(err.response?.data?.error || '操作失败', 'error')
    } finally {
      setLoading(false)
    }
  }

  const toggleStatus = async (product) => {
    try {
      await axios.post(`/api/products/${product.id}/toggle`)
      showMessage(product.is_active ? '商品已下架' : '商品已上架')
      fetchProducts()
    } catch (err) {
      showMessage('操作失败', 'error')
    }
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
          <Link to="/admin/products" className="active">📦 商品管理</Link>
          <Link to="/admin/orders">📋 订单管理</Link>
          <Link to="/admin/categories">🏷️ 分类管理</Link>
        </div>

        <div className="admin-content">
          <div className="page-header">
            <h2 className="page-title">商品管理</h2>
            <button className="btn btn-primary" onClick={openAddModal}>
              + 添加商品
            </button>
          </div>

          {loading && products.length === 0 ? (
            <div className="loading">加载中...</div>
          ) : (
            <div className="data-table">
              <table>
                <thead>
                  <tr>
                    <th>商品图片</th>
                    <th>商品名称</th>
                    <th>分类</th>
                    <th>价格</th>
                    <th>库存</th>
                    <th>状态</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(product => (
                    <tr key={product.id}>
                      <td>
                        {product.image_url ? (
                          <img src={product.image_url} alt={product.name} style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '6px' }} />
                        ) : (
                          <div style={{ width: '50px', height: '50px', background: '#f5f5f5', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: '#999' }}>暂无</div>
                        )}
                      </td>
                      <td>
                        <div style={{ fontWeight: '500' }}>{product.name}</div>
                        <div style={{ fontSize: '12px', color: '#999' }}>{product.description}</div>
                      </td>
                      <td>{product.category_name}</td>
                      <td style={{ color: '#e74c3c', fontWeight: '600' }}>¥{product.price.toFixed(2)}</td>
                      <td>
                        <span style={{ color: product.stock <= 10 ? '#e74c3c' : '#333' }}>
                          {product.stock}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${product.is_active ? 'badge-success' : 'badge-secondary'}`}>
                          {product.is_active ? '上架' : '下架'}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            className="btn btn-sm btn-outline"
                            onClick={() => openEditModal(product)}
                          >编辑</button>
                          <button
                            className={`btn btn-sm ${product.is_active ? 'btn-secondary' : 'btn-primary'}`}
                            onClick={() => toggleStatus(product)}
                          >
                            {product.is_active ? '下架' : '上架'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {products.length === 0 && (
                <div className="empty-state" style={{ padding: '40px' }}>
                  <p>暂无商品，点击上方按钮添加</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingProduct ? '编辑商品' : '添加商品'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">商品名称 *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="请输入商品名称"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">商品描述</label>
                  <textarea
                    className="form-input"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="请输入商品描述"
                    rows={2}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <div className="form-group">
                    <label className="form-label">价格 *</label>
                    <input
                      type="number"
                      step="0.01"
                      className="form-input"
                      value={form.price}
                      onChange={(e) => setForm({ ...form, price: e.target.value })}
                      placeholder="0.00"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">库存 *</label>
                    <input
                      type="number"
                      className="form-input"
                      value={form.stock}
                      onChange={(e) => setForm({ ...form, stock: e.target.value })}
                      placeholder="0"
                      required
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">分类 *</label>
                  <select
                    className="form-select"
                    value={form.category_id}
                    onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                    required
                  >
                    <option value="">请选择分类</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">图片URL</label>
                  <input
                    type="url"
                    className="form-input"
                    value={form.image_url}
                    onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
                {editingProduct && (
                  <div className="form-group">
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={form.is_active}
                        onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                      />
                      <span>上架状态</span>
                    </label>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>取消</button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? '保存中...' : '保存'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminProducts
