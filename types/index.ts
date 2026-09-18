export interface Theme {
  primary: string;
  secondary: string;
  accent: string;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category_id: string;
  image: string;
}

export interface Category {
  id: string;
  name: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface CustomerDetails {
  name: string;
  address: string;
  notes: string;
}

export interface Tenant {
  id: string;
  business_name: string;
  whatsapp_number: string;
  description?: string;
  logo_url?: string | null;
  theme: Theme;
  categories: Category[];
  products: Product[];
}