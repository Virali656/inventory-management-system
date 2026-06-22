import React, { useEffect, useState } from 'react';
import { orderApi, customerApi, productApi } from '../services/api';
import { Order, Customer, Product, OrderCreate } from '../types';

interface OrderItem {
  product_id: number;
  quantity: number;
}

const Orders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<OrderCreate>({
    customer_id: 0,
    items: [],
  });
  const [selectedProduct, setSelectedProduct] = useState<number>(0);
  const [selectedQuantity, setSelectedQuantity] = useState<number>(1);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [ordersRes, customersRes, productsRes] = await Promise.all([
        orderApi.getAll(),
        customerApi.getAll(),
        productApi.getAll(),
      ]);
      setOrders(ordersRes.data);
      setCustomers(customersRes.data);
      setProducts(productsRes.data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = () => {
    if (selectedProduct === 0) {
      setError('Please select a product');
      return;
    }

    const product = products.find(p => p.id === selectedProduct);
    if (!product) return;

    if (selectedQuantity > product.quantity) {
      setError(`Only ${product.quantity} units available for ${product.name}`);
      return;
    }

    const existingItem = formData.items.find(item => item.product_id === selectedProduct);
    if (existingItem) {
      setFormData({
        ...formData,
        items: formData.items.map(item =>
          item.product_id === selectedProduct
            ? { ...item, quantity: item.quantity + selectedQuantity }
            : item
        ),
      });
    } else {
      setFormData({
        ...formData,
        items: [...formData.items, { product_id: selectedProduct, quantity: selectedQuantity }],
      });
    }

    setSelectedProduct(0);
    setSelectedQuantity(1);
    setError(null);
  };

  const handleRemoveItem = (productId: number) => {
    setFormData({
      ...formData,
      items: formData.items.filter(item => item.product_id !== productId),
    });
  };

  const calculateTotal = () => {
    return formData.items.reduce((total, item) => {
      const product = products.find(p => p.id === item.product_id);
      return total + (product ? product.price * item.quantity : 0);
    }, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.customer_id === 0) {
      setError('Please select a customer');
      return;
    }

    if (formData.items.length === 0) {
      setError('Please add at least one product');
      return;
    }

    try {
      await orderApi.create(formData);
      setShowForm(false);
      resetForm();
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create order');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this order?')) return;

    try {
      await orderApi.delete(id);
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to delete order');
    }
  };

  const resetForm = () => {
    setFormData({ customer_id: 0, items: [] });
    setSelectedProduct(0);
    setSelectedQuantity(1);
  };

  const handleCancel = () => {
    setShowForm(false);
    resetForm();
    setError(null);
  };

  const getProductName = (productId: number) => {
    const product = products.find(p => p.id === productId);
    return product ? product.name : 'Unknown';
  };

  const getCustomerName = (customerId: number) => {
    const customer = customers.find(c => c.id === customerId);
    return customer ? customer.name : 'Unknown';
  };

  if (loading) return <div className="loading">Loading orders...</div>;

  return (
    <div>
      <div className="page-header">
        <h2>📋 Orders</h2>
        {!showForm && (
          <button
            className="btn btn-primary"
            onClick={() => setShowForm(true)}
            disabled={customers.length === 0 || products.length === 0}
          >
            ➕ Create Order
          </button>
        )}
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {customers.length === 0 && (
        <div className="alert alert-error">
          Please add customers before creating orders
        </div>
      )}

      {products.length === 0 && (
        <div className="alert alert-error">
          Please add products before creating orders
        </div>
      )}

      {showForm && (
        <div className="card">
          <h3>Create New Order</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Customer *</label>
              <select
                value={formData.customer_id}
                onChange={(e) => setFormData({ ...formData, customer_id: parseInt(e.target.value) })}
                required
              >
                <option value={0}>Select a customer</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name} ({customer.email})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Add Products</label>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
                <div style={{ flex: 1 }}>
                  <select
                    value={selectedProduct}
                    onChange={(e) => setSelectedProduct(parseInt(e.target.value))}
                  >
                    <option value={0}>Select a product</option>
                    {products.map((product) => (
                      <option key={product.id} value={product.id} disabled={product.quantity === 0}>
                        {product.name} - ${product.price} (Stock: {product.quantity})
                      </option>
                    ))}
                  </select>
                </div>
                <div style={{ width: '100px' }}>
                  <input
                    type="number"
                    min="1"
                    value={selectedQuantity}
                    onChange={(e) => setSelectedQuantity(parseInt(e.target.value))}
                  />
                </div>
                <button type="button" className="btn btn-secondary" onClick={handleAddItem}>
                  ➕ Add Item
                </button>
              </div>
            </div>

            {formData.items.length > 0 && (
              <div className="form-group">
                <label>Order Items</label>
                <table style={{ marginTop: '10px' }}>
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Quantity</th>
                      <th>Price</th>
                      <th>Subtotal</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.items.map((item) => {
                      const product = products.find(p => p.id === item.product_id);
                      return (
                        <tr key={item.product_id}>
                          <td>{getProductName(item.product_id)}</td>
                          <td>{item.quantity}</td>
                          <td>${product?.price.toFixed(2)}</td>
                          <td>${((product?.price || 0) * item.quantity).toFixed(2)}</td>
                          <td>
                            <button
                              type="button"
                              className="btn btn-danger btn-sm"
                              onClick={() => handleRemoveItem(item.product_id)}
                            >
                              🗑️ Remove
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan={3} style={{ textAlign: 'right', fontWeight: 'bold' }}>Total:</td>
                      <td style={{ fontWeight: 'bold' }}>${calculateTotal().toFixed(2)}</td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}

            <div className="form-actions">
              <button type="submit" className="btn btn-success">
                ✓ Create Order
              </button>
              <button type="button" className="btn btn-secondary" onClick={handleCancel}>
                ✕ Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        {orders.length === 0 ? (
          <div className="empty-state">
            <h3>No orders found</h3>
            <p>Create your first order to get started</p>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Total Amount</th>
                  <th>Items</th>
                  <th>Created At</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td>#{order.id}</td>
                    <td>{getCustomerName(order.customer_id)}</td>
                    <td>${order.total_amount.toFixed(2)}</td>
                    <td>{order.items.length} items</td>
                    <td>{new Date(order.created_at).toLocaleString()}</td>
                    <td>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDelete(order.id)}
                      >
                        🗑️ Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
