import React, { useState } from 'react';
import { customerApi } from '../services/api';
import './CustomerSignup.css';

const CustomerSignup: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await customerApi.create(formData);
      setSuccess(true);
      setFormData({ name: '', email: '', phone: '' });
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="signup-container">
        <div className="signup-card success-card">
          <div className="success-animation">
            <span className="success-icon">✓</span>
          </div>
          <h2>Registration Successful!</h2>
          <p>Your customer account has been created successfully.</p>
          <p className="success-details">
            A confirmation has been sent to <strong>{formData.email}</strong>
          </p>
          <button
            className="btn btn-primary btn-lg"
            onClick={() => window.location.href = '/'}
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="signup-container">
      <div className="signup-background">
        <div className="signup-shape shape-1"></div>
        <div className="signup-shape shape-2"></div>
      </div>

      <div className="signup-card">
        <div className="signup-header">
          <h1>📦 Customer Registration</h1>
          <p>Create your customer account to place orders</p>
        </div>

        <form onSubmit={handleSubmit} className="signup-form">
          {error && (
            <div className="signup-error">
              <span className="error-icon">⚠️</span>
              {error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="name">Full Name *</label>
            <div className="input-wrapper">
              <span className="input-icon">👤</span>
              <input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter your full name"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address *</label>
            <div className="input-wrapper">
              <span className="input-icon">📧</span>
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="your.email@example.com"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="phone">Phone Number *</label>
            <div className="input-wrapper">
              <span className="input-icon">📱</span>
              <input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+1 (555) 123-4567"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-success btn-lg signup-button"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="spinner"></span>
                Creating Account...
              </>
            ) : (
              <>
                ✓ Create Account
              </>
            )}
          </button>

          <div className="signup-footer">
            <p>
              Already have an account?{' '}
              <a href="/" className="login-link">
                Sign in here
              </a>
            </p>
          </div>
        </form>
      </div>

      <div className="signup-bottom">
        <p>© 2026 Inventory Management System. All rights reserved.</p>
      </div>
    </div>
  );
};

export default CustomerSignup;
