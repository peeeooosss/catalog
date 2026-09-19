import type { AnalyticsPoint, Tenant } from '@/types';

export type { AnalyticsPoint };

export const MOCK_TENANT: Tenant = {
  id: 'lumiere-boutique',
  business_name: 'Lumière Boutique',
  whatsapp_number: '1234567890',
  description: 'Premium clothing for the modern individual',
  logo_url: null,
  currency: 'INR',
  offer_text: 'Flat 20% off this week',
  offer_active: true,
  industry: 'Fashion',
  theme: {
    primary: '#10B981',
    secondary: '#64748B',
    accent: '#F59E0B',
  },
  categories: [
    { id: 'tops', name: 'Tops', icon: '👕' },
    { id: 'bottoms', name: 'Bottoms', icon: '👖' },
    { id: 'dresses', name: 'Dresses', icon: '👗' },
    { id: 'outerwear', name: 'Outerwear', icon: '🧥' },
  ],
  products: [
    {
      id: 1,
      name: 'Premium Cotton Shirt',
      price: 45.0,
      compare_at_price: 60.0,
      category_id: 'tops',
      image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=400&q=80',
      description: 'Breathable 100% organic cotton',
      stock: 12,
      status: 'active',
      unit: 'per pc',
    },
    {
      id: 2,
      name: 'Classic Denim Jeans',
      price: 65.0,
      compare_at_price: null,
      category_id: 'bottoms',
      image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=400&q=80',
      description: 'Stretch denim for comfort',
      stock: 8,
      status: 'active',
      unit: 'per pc',
    },
    {
      id: 3,
      name: 'Summer Maxi Dress',
      price: 89.0,
      compare_at_price: 110.0,
      category_id: 'dresses',
      image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=400&q=80',
      description: 'Lightweight chiffon with pockets',
      stock: 0,
      status: 'out_of_stock',
      unit: 'per pc',
    },
    {
      id: 4,
      name: 'Leather Biker Jacket',
      price: 120.0,
      compare_at_price: null,
      category_id: 'outerwear',
      image: 'https://images.unsplash.com/photo-1551028719-00575905b463?auto=format&fit=crop&w=400&q=80',
      description: 'Genuine distressed leather',
      stock: 5,
      status: 'active',
      unit: 'per pc',
    },
  ],
};

export const MOCK_ANALYTICS: AnalyticsPoint[] = [
  { day: 'Mon', views: 180, carts: 34, clicks: 12, orders: 8 },
  { day: 'Tue', views: 220, carts: 41, clicks: 16, orders: 11 },
  { day: 'Wed', views: 198, carts: 38, clicks: 14, orders: 9 },
  { day: 'Thu', views: 265, carts: 52, clicks: 21, orders: 15 },
  { day: 'Fri', views: 310, carts: 61, clicks: 27, orders: 19 },
  { day: 'Sat', views: 402, carts: 74, clicks: 33, orders: 24 },
  { day: 'Sun', views: 356, carts: 68, clicks: 29, orders: 21 },
];

export const MOCK_ANALYTICS_TOTALS = {
  views: 1931,
  cartAdditions: 368,
  whatsappClicks: 152,
  orders: 107,
};
