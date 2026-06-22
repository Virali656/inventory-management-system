import React, { useEffect, useState } from 'react';
import { dashboardApi } from '../services/api';
import { DashboardSummary } from '../types';

const Dashboard: React.FC = () => {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const response = await dashboardApi.getSummary();
      setSummary(response.data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading dashboard...</div>;
  if (error) return <div className="alert alert-error">{error}</div>;
  if (!summary) return null;

  return (
    <div>
      <div className="page-header">
        <h2>📊 Dashboard Overview</h2>
        <button className="btn btn-secondary btn-sm" onClick={fetchDashboard}>
          🔄 Refresh Data
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>📦 Total Products</h3>
          <p>{summary.total_products}</p>
        </div>

        <div className="stat-card success">
          <h3>👥 Total Customers</h3>
          <p>{summary.total_customers}</p>
        </div>

        <div className="stat-card warning">
          <h3>📋 Total Orders</h3>
          <p>{summary.total_orders}</p>
        </div>

        <div className="stat-card danger">
          <h3>⚠️ Low Stock Items</h3>
          <p>{summary.low_stock_products.length}</p>
        </div>
      </div>

      {summary.low_stock_products.length > 0 && (
        <div className="card">
          <h3 style={{ color: 'var(--danger-color)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            ⚠️ Low Stock Alert
          </h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            The following products need to be restocked soon
          </p>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Product Name</th>
                  <th>SKU</th>
                  <th>Price</th>
                  <th>Stock Level</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {summary.low_stock_products.map((product) => (
                  <tr key={product.id}>
                    <td><strong>{product.name}</strong></td>
                    <td><span style={{ fontFamily: 'monospace', fontSize: '0.9rem' }}>{product.sku}</span></td>
                    <td><strong style={{ color: 'var(--secondary-color)' }}>${product.price.toFixed(2)}</strong></td>
                    <td><strong style={{ color: 'var(--danger-color)' }}>{product.quantity}</strong></td>
                    <td>
                      <span className="badge badge-danger">
                        {product.quantity === 0 ? 'OUT OF STOCK' : 'LOW STOCK'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {summary.low_stock_products.length === 0 && (
        <div className="card">
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--secondary-color)' }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>✓ All Stock Levels Healthy</h3>
            <p style={{ color: 'var(--text-secondary)' }}>No products are running low on inventory</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
