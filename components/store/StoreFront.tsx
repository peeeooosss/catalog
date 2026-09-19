'use client';
import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Search, Share2 } from 'lucide-react';
import CategoryPills from './CategoryPills';
import ProductGrid from './ProductGrid';
import VariantPicker from './VariantPicker';
import CartDrawer from './CartDrawer';
import FloatingCartButton from './FloatingCartButton';
import ShareModal from './ShareModal';
import type { CartItem, Product, ProductVariant, Tenant } from '@/types';
import { formatMoney } from '@/lib/utils';

function track(tenantId: string, event: string, productId?: number, sessionId?: string) {
  fetch('/api/analytics', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tenantId, event, productId, sessionId }),
    keepalive: true,
  }).catch(() => {});
}

export default function StoreFront({ tenant }: { tenant: Tenant }) {
  const [activeCategory, setActiveCategory] = useState('all');
  const [query, setQuery] = useState('');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [pickerProduct, setPickerProduct] = useState<Product | null>(null);
  const [sessionId] = useState(() =>
    typeof window !== 'undefined'
      ? localStorage.getItem('cp_session_id') ||
        Math.random().toString(36).slice(2) + Date.now().toString(36)
      : 'server'
  );

  const storeUrl = `${(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').replace(/\/$/, '')}/store/${tenant.id}`;

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--color-primary', tenant.theme.primary);
    root.style.setProperty('--color-secondary', tenant.theme.secondary);
    root.style.setProperty('--color-accent', tenant.theme.accent);
  }, [tenant.theme]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('cp_session_id', sessionId);
      track(tenant.id, 'view', undefined, sessionId);
    }
  }, [tenant.id, sessionId]);

  const visibleProducts = tenant.products.filter((p) => {
    const matchesCat = activeCategory === 'all' || p.category_id === activeCategory;
    const matchesQuery = p.name.toLowerCase().includes(query.toLowerCase());
    return matchesCat && matchesQuery;
  });

  const addToCart = useCallback(
    (product: Product, variant: ProductVariant | null = null) => {
      const key = `${product.id}-${variant?.id ?? 'base'}`;
      const price = variant ? (variant.price ?? product.price) : product.price;
      const maxStock = variant ? variant.stock : product.stock ?? 0;
      setCart((prev) => {
        const existing = prev.find((item) => item.key === key);
        if (existing) {
          return prev.map((item) =>
            item.key === key ? { ...item, quantity: Math.min(item.quantity + 1, item.maxStock || 99) } : item
          );
        }
        return [
          ...prev,
          {
            key,
            product_id: product.id,
            variant_id: variant?.id ?? null,
            name: product.name,
            variant_label: variant ? variant.label : null,
            price,
            image: product.image,
            quantity: 1,
            maxStock: maxStock || 99,
          },
        ];
      });
      track(tenant.id, 'add_to_cart', product.id, sessionId);
    },
    [tenant.id, sessionId]
  );

  const updateQuantity = useCallback((key: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.key === key
            ? { ...item, quantity: Math.min(Math.max(item.quantity + delta, 1), item.maxStock || 99) }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  }, []);

  const removeItem = useCallback((key: string) => {
    setCart((prev) => prev.filter((item) => item.key !== key));
  }, []);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="min-h-screen bg-slate-50 max-w-md mx-auto relative pb-32">
      <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-slate-100 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            {tenant.logo_url ? (
              <div className="w-10 h-10 rounded-full overflow-hidden relative flex-shrink-0">
                <Image src={tenant.logo_url} alt={`${tenant.business_name} logo`} fill sizes="40px" className="object-cover" unoptimized />
              </div>
            ) : (
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0"
                style={{ backgroundColor: tenant.theme.primary }}
                aria-hidden
              >
                {tenant.business_name.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="min-w-0">
              <h1 className="text-lg font-bold text-slate-900 truncate">{tenant.business_name}</h1>
              {tenant.description && <p className="text-xs text-slate-500 truncate">{tenant.description}</p>}
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Share2
              onClick={() => setIsShareOpen(true)}
              role="button"
              tabIndex={0}
              aria-label="Share this store"
              className="w-5 h-5 text-slate-600 p-4 box-content rounded-full hover:bg-slate-100 cursor-pointer"
            />
          </div>
        </div>
      </header>

      {tenant.offer_active && tenant.offer_text && (
        <div
          className="text-white text-sm font-semibold text-center px-4 py-2.5"
          style={{ backgroundColor: tenant.theme.accent }}
        >
          {tenant.offer_text}
        </div>
      )}

      <div className="px-4 pt-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" aria-hidden />
          <input
            type="search"
            placeholder={`Search in ${tenant.business_name}...`}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActiveCategory('all');
            }}
            aria-label="Search products"
            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-transparent focus:border-slate-400 outline-none shadow-sm"
          />
        </div>
      </div>

      <CategoryPills
        categories={tenant.categories}
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
        theme={tenant.theme}
      />

      <ProductGrid
        products={visibleProducts}
        onAddToCart={(product) => {
          if (product.variants?.length) {
            setPickerProduct(product);
            track(tenant.id, 'product_view', product.id, sessionId);
          } else {
            addToCart(product);
          }
        }}
        theme={tenant.theme}
        currency={tenant.currency || 'INR'}
      />

      <FloatingCartButton
        cartCount={cartCount}
        cartTotal={cartTotal}
        onClick={() => setIsCartOpen(true)}
        theme={tenant.theme}
        currency={tenant.currency || 'INR'}
      />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQuantity={updateQuantity}
        onRemoveItem={removeItem}
        tenant={tenant}
        currency={tenant.currency || 'INR'}
      />

      <VariantPicker
        product={pickerProduct}
        currency={tenant.currency || 'INR'}
        theme={tenant.theme}
        onClose={() => setPickerProduct(null)}
        onAdd={(variant) => {
          if (pickerProduct) {
            addToCart(pickerProduct, variant);
            setPickerProduct(null);
          }
        }}
      />

      <ShareModal isOpen={isShareOpen} onClose={() => setIsShareOpen(false)} storeUrl={storeUrl} businessName={tenant.business_name} />
    </div>
  );
}