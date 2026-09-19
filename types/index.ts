export interface Theme {
  primary: string;
  secondary: string;
  accent: string;
}

export type ProductStatus = 'active' | 'draft' | 'out_of_stock';

export interface ProductVariant {
  id: number;
  label: string;
  price: number | null;
  compare_at_price: number | null;
  stock: number;
  sku: string | null;
  is_active: boolean;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  compare_at_price?: number | null;
  category_id: string;
  image: string;
  unit?: string | null;
  stock?: number;
  status?: ProductStatus;
  variants?: ProductVariant[];
}

export interface Category {
  id: string;
  name: string;
  icon?: string | null;
}

export interface CartItem {
  key: string;
  product_id: number;
  variant_id: number | null;
  name: string;
  variant_label: string | null;
  price: number;
  image: string;
  quantity: number;
  maxStock: number;
}

export interface CustomerDetails {
  name: string;
  phone: string;
  address: string;
  notes: string;
}

export interface Tenant {
  id: string;
  business_name: string;
  whatsapp_number: string;
  description?: string;
  logo_url?: string | null;
  currency?: string;
  offer_text?: string | null;
  offer_active?: boolean;
  address?: string | null;
  industry?: string | null;
  theme: Theme;
  categories: Category[];
  products: Product[];
}

export type UserRole = 'seller' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  phone: string | null;
  is_active: boolean;
  created_at: string;
  last_login_at: string | null;
}

export type OrderStatus =
  | 'submitted'
  | 'confirmed'
  | 'packed'
  | 'delivered'
  | 'completed'
  | 'cancelled';

export interface OrderItem {
  id: number;
  product_id: number | null;
  variant_id: number | null;
  name: string;
  variant_label: string | null;
  price: number;
  quantity: number;
  subtotal: number;
}

export interface Order {
  id: string;
  order_number: number;
  tenant_id: string;
  customer_name: string;
  customer_phone: string | null;
  customer_address: string | null;
  notes: string | null;
  subtotal: number;
  discount: number;
  total: number;
  item_count: number;
  status: OrderStatus;
  created_at: string;
  items?: OrderItem[];
}

export interface Customer {
  id: number;
  tenant_id: string;
  phone: string;
  name: string | null;
  address: string | null;
  total_orders: number;
  total_spent: number;
  last_order_at: string | null;
  payment_status: 'paid' | 'unpaid';
  paid_at: string | null;
}

export interface AnalyticsPoint {
  day: string;
  views: number;
  carts: number;
  clicks: number;
  orders: number;
}

export interface FunnelStats {
  views: number;
  visitors: number;
  carts: number;
  whatsappClicks: number;
  orders: number;
  itemsSold: number;
  revenue: number;
}

export interface DashboardStats {
  products: number;
  categories: number;
  orders: number;
  revenue: number;
  itemsSold: number;
  views: number;
  carts: number;
  whatsappClicks: number;
  pendingOrders: number;
  lowStock: number;
}

export interface SellerSummary extends User {
  store_slug: string | null;
  store_name: string | null;
  store_active: boolean | null;
  orders: number;
  revenue: number;
  products: number;
}
