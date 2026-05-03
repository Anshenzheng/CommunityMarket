import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useAppContext } from '../App'

const Home = () => {
  const { categories, addToCart, loading, setLoading } = useAppContext()
  const [products, setProducts] = useState([])
  const [selectedCategory, setSelectedCategory] = useState(null)

  useEffect(() => {
    fetchProducts()
  }, [selectedCategory])

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const params = {}
      if (selectedCategory) {
        params.category_id = selectedCategory
      }
      const res = await axios.get('/api/products', { params })
      setProducts(res.data)
    } catch (err) {
      console.error('获取商品失败:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = (product) => {
    if (product.stock <= 0) return
    addToCart(product)
  }

  return (
    <div className="container">
      <div style={{ marginTop: '20px' }}>
        <h2 style={{ marginBottom: '20px', fontSize: '22px', color: '#2c3e50' }}>🏪 精选商品</h2>
        
        <div className="category-tabs">
          <button
            className={`category-tab ${!selectedCategory ? 'active' : ''}`}
            onClick={() => setSelectedCategory(null)}
          >
            全部
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              className={`category-tab ${selectedCategory === cat.id ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat.id)}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="loading">加载中...</div>
        ) : products.length === 0 ? (
          <div className="empty-state">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="3" width="20" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
            <p>暂无商品</p>
          </div>
        ) : (
          <div className="product-grid">
            {products.map(product => (
              <div key={product.id} className={`product-card ${!product.is_active ? 'inactive' : ''}`}>
                {product.image_url ? (
                  <img src={product.image_url} alt={product.name} className="product-image" />
                ) : (
                  <div className="image-placeholder">暂无图片</div>
                )}
                <div className="product-info">
                  <h3 className="product-name">{product.name}</h3>
                  <p className="product-description">{product.description}</p>
                  <div className="product-price-row">
                    <span className="product-price">¥{product.price.toFixed(2)}</span>
                    <span className="product-stock">库存: {product.stock}</span>
                  </div>
                  <button
                    className={`btn btn-primary add-to-cart-btn ${product.stock <= 0 ? 'btn-secondary' : ''}`}
                    onClick={() => handleAddToCart(product)}
                    disabled={product.stock <= 0}
                  >
                    {product.stock <= 0 ? '暂无库存' : '加入购物车'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Home
