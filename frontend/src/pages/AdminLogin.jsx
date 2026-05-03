import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppContext } from '../App'

const AdminLogin = () => {
  const { loginAdmin, setLoading, loading } = useAppContext()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    username: '',
    password: ''
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.username || !form.password) return
    
    const success = await loginAdmin(form.username, form.password)
    if (success) {
      navigate('/admin')
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <h2>🏪 管理后台登录</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">用户名</label>
            <input
              type="text"
              className="form-input"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              placeholder="请输入用户名"
              required
              autoFocus
            />
          </div>
          <div className="form-group">
            <label className="form-label">密码</label>
            <input
              type="password"
              className="form-input"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="请输入密码"
              required
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '10px', padding: '12px' }}
            disabled={loading}
          >
            {loading ? '登录中...' : '登录'}
          </button>
        </form>
        <div style={{ marginTop: '20px', padding: '12px', background: '#f8f9fa', borderRadius: '8px', fontSize: '13px', color: '#666' }}>
          <p style={{ marginBottom: '6px' }}>默认管理员账号：</p>
          <p>用户名：<strong>admin</strong></p>
          <p>密码：<strong>admin123</strong></p>
        </div>
        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <a href="/" style={{ color: '#4CAF50', textDecoration: 'none', fontSize: '14px' }}>← 返回用户端</a>
        </div>
      </div>
    </div>
  )
}

export default AdminLogin
