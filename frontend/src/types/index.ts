export interface Product {
  id: number;
  name: string;
  sku: string;
  price: number;
  quantity: number;
  created_at: string;
  updated_at?: string;
}

export interface ProductCreate {
  name: string;
  sku: string;
  price: number;
  quantity: number;
}

export interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  created_at: string;
}

export interface CustomerCreate {
  name: string;
  email: string;
  phone: string;
}

export interface OrderItem {
  product_id: number;
  quantity: number;
  price_at_order?: number;
}

export interface Order {
  id: number;
  customer_id: number;
  total_amount: number;
  created_at: string;
  items: OrderItem[];
}

export interface OrderCreate {
  customer_id: number;
  items: Array<{
    product_id: number;
    quantity: number;
  }>;
}

export interface DashboardSummary {
  total_products: number;
  total_customers: number;
  total_orders: number;
  low_stock_products: Product[];
}
