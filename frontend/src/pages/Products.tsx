import React, { useEffect, useState } from 'react';
import { productApi } from '../services/api';
import { Product, ProductCreate } from '../types';

const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState<ProductCreate>({
    name: '',
    sku: '',
    price: 0,
    quantity: 0,
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    // Filter products based on search term
    const filtered = products.filter(product =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredProducts(filtered);
  }, [searchTerm, products]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await productApi.getAll();
      setProducts(response.data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await productApi.update(editingProduct.id, formData);
      } else {
        await productApi.create(formData);
      }
      setShowForm(false);
      setEditingProduct(null);
      resetForm();
      fetchProducts();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to save product');
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      sku: product.sku,
      price: product.price,
      quantity: product.quantity,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;

    try {
      await productApi.delete(id);
      fetchProducts();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to delete product');
    }
  };

  const resetForm = () => {
    setFormData({ name: '', sku: '', price: 0, quantity: 0 });
    setEditingProduct(null);
  };

  const handleCancel = () => {
    setShowForm(false);
    resetForm();
  };

  const getStockStatus = (quantity: number) => {
    if (quantity === 0) return { label: 'Out of Stock', className: 'stock-low' };
    if (quantity < 10) return { label: 'Low Stock', className: 'stock-low' };
    if (quantity < 50) return { label: 'Medium', className: 'stock-medium' };
    return { label: 'In Stock', className: 'stock-high' };
  };

  if (loading) return <div className="loading">Loading products...</div>;

  return (
    <div>
      <div className="page-header">
        <h2>📦 Products</h2>
        {!showForm && (
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>
            ➕ Add Product
          </button>
        )}
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {!showForm && products.length > 0 && (
        <div className="filter-bar">
          <input
            type="text"
            className="search-input"
            placeholder="🔍 Search products by name or SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            {filteredProducts.length} of {products.length} products
          </div>
        </div>
      )}

      {showForm && (
        <div className="card">
          <h3>{editingProduct ? 'Edit Product' : 'Add New Product'}</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Product Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>SKU *</label>
              <input
                type="text"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>Price *</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                required
              />
            </div>

            <div className="form-group">
              <label>Quantity *</label>
              <input
                type="number"
                min="0"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
                required
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-success">
                {editingProduct ? '✓ Update Product' : '✓ Create Product'}
              </button>
              <button type="button" className="btn btn-secondary" onClick={handleCancel}>
                ✕ Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        {filteredProducts.length === 0 && !searchTerm ? (
          <div className="empty-state">
            <h3>No products found</h3>
            <p>Add your first product to get started</p>
          </div>
        ) : filteredProducts.length === 0 && searchTerm ? (
          <div className="empty-state">
            <h3>No products match your search</h3>
            <p>Try different keywords</p>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Product Name</th>
                  <th>SKU</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => {
                  const stockStatus = getStockStatus(product.quantity);
                  return (
                    <tr key={product.id}>
                      <td><strong>#{product.id}</strong></td>
                      <td><strong>{product.name}</strong></td>
                      <td><span style={{ fontFamily: 'monospace', fontSize: '0.9rem' }}>{product.sku}</span></td>
                      <td><strong style={{ color: 'var(--secondary-color)' }}>${product.price.toFixed(2)}</strong></td>
                      <td><strong>{product.quantity}</strong></td>
                      <td>
                        <span className={`stock-indicator ${stockStatus.className}`}>
                          {stockStatus.label}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => handleEdit(product)}
                          >
                            ✏️ Edit
                          </button>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleDelete(product.id)}
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;
