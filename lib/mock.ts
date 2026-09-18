import type { Tenant } from '@/types';

export const MOCK_TENANT: Tenant = {
  id: 'lumiere-boutique',
  business_name: 'Lumière Boutique',
  whatsapp_number: '1234567890',
  description: 'Premium clothing for the modern individual',
  logo_url: null,
  theme: {
    primary: '#10B981',
    secondary: '#64748B',
    accent: '#F59E0B',
  },
  categories: [
    { id: '1', name: 'Tops' },
    { id: '2', name: 'Bottoms' },
    { id: '3', name: 'Dresses' },
    { id: '4', name: 'Outerwear' },
  ],
  products: [
    { id: 1, name: 'Premium Cotton Shirt', price: 45.0, category_id: '1', image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=400&q=80', description: 'Breathable 100% organic cotton' },
    { id: 2, name: 'Classic Denim Jeans', price: 65.0, category_id: '2', image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=400&q=80', description: 'Stretch denim for comfort' },
    { id: 3, name: 'Summer Maxi Dress', price: 89.0, category_id: '3', image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=400&q=80', description: 'Lightweight chiffon with pockets' },
    { id: 4, name: 'Leather Biker Jacket', price: 120.0, category_id: '4', image: 'https://images.unsplash.com/photo-1551028719-00575905b463?auto=format&fit=crop&w=400&q=80', description: 'Genuine distressed leather' },
  ],
};

export interface AnalyticsPoint {
  day: string;
  views: number;
  carts: number;
  clicks: number;
}

export const MOCK_ANALYTICS: AnalyticsPoint[] = [
  { day: 'Mon', views: 180, carts: 34, clicks: 12 },
  { day: 'Tue', views: 220, carts: 41, clicks: 16 },
  { day: 'Wed', views: 198, carts: 38, clicks: 14 },
  { day: 'Thu', views: 265, carts: 52, clicks: 21 },
  { day: 'Fri', views: 310, carts: 61, clicks: 27 },
  { day: 'Sat', views: 402, carts: 74, clicks: 33 },
  { day: 'Sun', views: 356, carts: 68, clicks: 29 },
];

export const MOCK_ANALYTICS_TOTALS = {
  views: 1931,
  cartAdditions: 368,
  whatsappClicks: 152,
  orders: 87,
};