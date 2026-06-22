import axios from 'axios';
import { Product, ProductCreate, Customer, CustomerCreate, Order, OrderCreate, DashboardSummary } from '../types';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Product API
export const productApi = {
  getAll: () => api.get<Product[]>('/products'),
  getById: (id: number) => api.get<Product>(`/products/${id}`),
  create: (product: ProductCreate) => api.post<Product>('/products', product),
  update: (id: number, product: Partial<ProductCreate>) => api.put<Product>(`/products/${id}`, product),
  delete: (id: number) => api.delete(`/products/${id}`),
};

// Customer API
export const customerApi = {
  getAll: () => api.get<Customer[]>('/customers'),
  getById: (id: number) => api.get<Customer>(`/customers/${id}`),
  create: (customer: CustomerCreate) => api.post<Customer>('/customers', customer),
  delete: (id: number) => api.delete(`/customers/${id}`),
};

// Order API
export const orderApi = {
  getAll: () => api.get<Order[]>('/orders'),
  getById: (id: number) => api.get<Order>(`/orders/${id}`),
  create: (order: OrderCreate) => api.post<Order>('/orders', order),
  delete: (id: number) => api.delete(`/orders/${id}`),
};

// Dashboard API
export const dashboardApi = {
  getSummary: () => api.get<DashboardSummary>('/dashboard'),
};

export default api;
