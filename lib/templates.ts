import type { Theme } from '@/types';

export interface IndustryTemplate {
  id: string;
  label: string;
  emoji: string;
  description: string;
  theme: Theme;
  offerText: string;
  categories: { name: string; icon: string }[];
}

export const INDUSTRY_TEMPLATES: IndustryTemplate[] = [
  {
    id: 'grocery',
    label: 'Grocery / Kirana',
    emoji: '🥬',
    description: 'Fruits, vegetables, dairy, staples',
    theme: { primary: '#16A34A', secondary: '#57534E', accent: '#F59E0B' },
    offerText: 'Free delivery on orders above $25',
    categories: [
      { name: 'Fruits', icon: '🍎' },
      { name: 'Vegetables', icon: '🥦' },
      { name: 'Dairy & Eggs', icon: '🥚' },
      { name: 'Staples & Grains', icon: '🌾' },
      { name: 'Snacks', icon: '🍪' },
      { name: 'Beverages', icon: '🥤' },
    ],
  },
  {
    id: 'electronics',
    label: 'Electronics / Mobile',
    emoji: '📱',
    description: 'Phones, accessories, gadgets',
    theme: { primary: '#2563EB', secondary: '#475569', accent: '#06B6D4' },
    offerText: 'Free shipping + 6-month warranty',
    categories: [
      { name: 'Smartphones', icon: '📱' },
      { name: 'Chargers & Cables', icon: '🔌' },
      { name: 'Headphones', icon: '🎧' },
      { name: 'Smart Watches', icon: '⌚' },
      { name: 'Power Banks', icon: '🔋' },
      { name: 'Accessories', icon: '🔧' },
    ],
  },
  {
    id: 'fashion',
    label: 'Fashion / Clothing',
    emoji: '👗',
    description: 'Men, women, kids apparel',
    theme: { primary: '#DB2777', secondary: '#78716C', accent: '#F59E0B' },
    offerText: 'Buy 2 get 1 free on selected items',
    categories: [
      { name: "Men's Wear", icon: '👔' },
      { name: "Women's Wear", icon: '👗' },
      { name: 'Kids', icon: '🧒' },
      { name: 'Footwear', icon: '👟' },
      { name: 'Bags', icon: '👜' },
      { name: 'Accessories', icon: '💍' },
    ],
  },
  {
    id: 'flowers',
    label: 'Flowers / Gifts',
    emoji: '💐',
    description: 'Bouquets, plants, gift hampers',
    theme: { primary: '#E11D48', secondary: '#71717A', accent: '#F472B6' },
    offerText: 'Same-day delivery before 6pm',
    categories: [
      { name: 'Bouquets', icon: '💐' },
      { name: 'Roses', icon: '🌹' },
      { name: 'Plants', icon: '🪴' },
      { name: 'Gift Hampers', icon: '🎁' },
      { name: 'Cakes', icon: '🎂' },
      { name: 'Cards', icon: '💌' },
    ],
  },
  {
    id: 'bakery',
    label: 'Bakery / Confectionery',
    emoji: '🧁',
    description: 'Cakes, breads, sweets',
    theme: { primary: '#D97706', secondary: '#78716C', accent: '#BE185D' },
    offerText: 'Order 24h in advance for fresh bakes',
    categories: [
      { name: 'Cakes', icon: '🎂' },
      { name: 'Breads', icon: '🍞' },
      { name: 'Pastries', icon: '🥐' },
      { name: 'Cookies', icon: '🍪' },
      { name: 'Chocolates', icon: '🍫' },
      { name: 'Beverages', icon: '☕' },
    ],
  },
  {
    id: 'pharmacy',
    label: 'Pharmacy / Wellness',
    emoji: '💊',
    description: 'Medicines, supplements, care',
    theme: { primary: '#0891B2', secondary: '#64748B', accent: '#22C55E' },
    offerText: 'Genuine medicines — home delivery',
    categories: [
      { name: 'Medicines', icon: '💊' },
      { name: 'Supplements', icon: '🧴' },
      { name: 'Personal Care', icon: '🧼' },
      { name: 'Baby Care', icon: '🍼' },
      { name: 'First Aid', icon: '🩹' },
      { name: 'Devices', icon: '🩺' },
    ],
  },
  {
    id: 'food',
    label: 'Restaurant / Food',
    emoji: '🍔',
    description: 'Meals, combos, drinks',
    theme: { primary: '#DC2626', secondary: '#78350F', accent: '#F59E0B' },
    offerText: 'Free delivery on orders above $15',
    categories: [
      { name: 'Starters', icon: '🍟' },
      { name: 'Main Course', icon: '🍽️' },
      { name: 'Combos', icon: '🍱' },
      { name: 'Desserts', icon: '🍨' },
      { name: 'Beverages', icon: '🥤' },
    ],
  },
  {
    id: 'general',
    label: 'General Store',
    emoji: '🛍️',
    description: 'Anything and everything',
    theme: { primary: '#10B981', secondary: '#64748B', accent: '#F59E0B' },
    offerText: 'Special launch discount — order now!',
    categories: [
      { name: 'Featured', icon: '⭐' },
      { name: 'New Arrivals', icon: '🆕' },
      { name: 'Best Sellers', icon: '🔥' },
      { name: 'Offer Zone', icon: '🏷️' },
    ],
  },
];

export function findTemplate(id: string | null | undefined) {
  return INDUSTRY_TEMPLATES.find((t) => t.id === id) ?? INDUSTRY_TEMPLATES[INDUSTRY_TEMPLATES.length - 1];
}
