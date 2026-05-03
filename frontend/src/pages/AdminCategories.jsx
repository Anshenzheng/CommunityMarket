import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { useAppContext } from '../App'

const AdminCategories = () => {
  const { categories, showMessage, setLoading, loading, admin, logoutAdmin, fetchCategories } = useAppContext()
  const [showModal, setShowModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)
  const [form, setForm] = useState({
    name: '',
    description: ''
  })

  const openAddModal = () => {
    setEditingCategory(null)
    setForm({ name: '', description: '' })
    setShowModal(true)
  }

  const openEditModal = (category) => {
    setEditingCategory(category)
    setForm({
      name: category.name,
      description: category.description || ''
    })
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      if (editingCategory) {
        await axios.put(`/api/categories/${editingCategory.id}`, form)
        showMessage('分类更新成功！')
      } else {
        await axios.post('/api/categories', form)
        showMessage('分类添加成功！')
      }
      setShowModal(false)
      fetchCategories()
    } catch (err) {
      showMessage(err.response?.data?.error || '操作失败', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (category) => {
    if (!window.confirm(`确定要删除分类"${category.name}"吗？\n（注意：该分类下不能有商品）`)) return
    
    setLoading(true)
    try {
      await axios.delete(`/api/categories/${category.id}`)
      showMessage('分类删除成功！')
      fetchCategories()
    } catch (err) {
      showMessage(err.response?.data?.error || '删除失败', 'error')
    } finally {
      setLoading(false)
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
          <Link to="/admin/products">📦 商品管理</Link>
          <Link to="/admin/orders">📋 订单管理</Link>
          <Link to="/admin/categories" className="active">🏷️ 分类管理</Link>
        </div>

        <div className="admin-content">
          <div className="page-header">
            <h2 className="page-title">分类管理</h2>
            <button className="btn btn-primary" onClick={openAddModal}>
              + 添加分类
            </button>
          </div>

          {loading ? (
            <div className="loading">加载中...</div>
          ) : (
            <div className="data-table">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>分类名称</th>
                    <th>描述</th>
                    <th>创建时间</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map(category => (
                    <tr key={category.id}>
                      <td>{category.id}</td>
                      <td style={{ fontWeight: '500' }}>{category.name}</td>
                      <td style={{ color: '#666' }}>{category.description || '-'}</td>
                      <td style={{ fontSize: '13px', color: '#999' }}>
                        {category.created_at ? new Date(category.created_at).toLocaleDateString('zh-CN') : '-'}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            className="btn btn-sm btn-outline"
                            onClick={() => openEditModal(category)}
                          >编辑</button>
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => handleDelete(category)}
                          >删除</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {categories.length === 0 && (
                <div className="empty-state" style={{ padding: '40px' }}>
                  <p>暂无分类，点击上方按钮添加</p>
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
              <h3>{editingCategory ? '编辑分类' : '添加分类'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">分类名称 *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="例如：零食、饮品、速食"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">分类描述</label>
                  <textarea
                    className="form-input"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="请输入分类描述（选填）"
                    rows={2}
                  />
                </div>
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

export default AdminCategories
