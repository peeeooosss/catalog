'use client';
import { useEffect, useState, useCallback, type CSSProperties } from 'react';
import Image from 'next/image';
import { Search, Share2, Sparkles, SlidersHorizontal, ShoppingBag } from 'lucide-react';
import { toast } from 'sonner';
import CategoryPills from './CategoryPills';
import ProductGrid from './ProductGrid';
import VariantPicker from './VariantPicker';
import CartDrawer from './CartDrawer';
import FloatingCartButton from './FloatingCartButton';
import ShareModal from './ShareModal';
import type { CartItem, Product, ProductVariant, Tenant } from '@/types';
import { discountPercent, normalizeTheme } from '@/lib/utils';

type SortOption = 'featured' | 'price-low' | 'price-high' | 'discount';

function track(tenantId: string, event: string, productId?: number, sessionId?: string) {
  fetch('/api/analytics', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tenantId, event, productId, sessionId }),
    keepalive: true,
  }).catch(() => {});
}

export default function StoreFront({ tenant }: { tenant: Tenant }) {
  const theme = normalizeTheme(tenant.theme);
  const [activeCategory, setActiveCategory] = useState('all');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<SortOption>('featured');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [pickerProduct, setPickerProduct] = useState<Product | null>(null);
  const [sessionId] = useState(() =>
    typeof window !== 'undefined'
      ? localStorage.getItem('cp_session_id') || Math.random().toString(36).slice(2) + Date.now().toString(36)
      : 'server'
  );

  const storeUrl = `${(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').replace(/\/$/, '')}/store/${tenant.id}`;

  const themeStyle = {
    '--color-primary': theme.primary,
    '--color-secondary': theme.secondary,
    '--color-accent': theme.accent,
    '--store-radius': `${theme.radius}px`,
  } as CSSProperties;

  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('cp_session_id', sessionId);
    track(tenant.id, 'view', undefined, sessionId);
  }, [tenant.id, sessionId]);

  const visibleProducts = tenant.products
    .filter((product) => {
      const matchesCategory = activeCategory === 'all' || product.category_id === activeCategory;
      const matchesQuery = product.name.toLowerCase().includes(query.toLowerCase());
      return matchesCategory && matchesQuery;
    })
    .sort((a, b) => {
      if (sort === 'price-low') return a.price - b.price;
      if (sort === 'price-high') return b.price - a.price;
      if (sort === 'discount') return discountPercent(b.price, b.compare_at_price) - discountPercent(a.price, a.compare_at_price);
      return 0;
    });

  const categoryCounts = tenant.products.reduce<Record<string, number>>(
    (acc, product) => {
      acc[product.category_id] = (acc[product.category_id] ?? 0) + 1;
      return acc;
    },
    { all: tenant.products.length }
  );

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
      toast.success(`${product.name} added to cart`, {
        action: {
          label: 'View cart',
          onClick: () => setIsCartOpen(true),
        },
      });
    },
    [tenant.id, sessionId]
  );

  const updateQuantity = useCallback((key: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.key === key ? { ...item, quantity: Math.min(Math.max(item.quantity + delta, 1), item.maxStock || 99) } : item
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
    <div className="storefront min-h-screen max-w-md pb-32" data-template={theme.template} style={themeStyle}>
      <header className="sticky top-0 z-30 border-b border-slate-100 bg-white/90 px-4 py-3 backdrop-blur-xl">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            {tenant.logo_url ? (
              <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-full">
                <Image src={tenant.logo_url} alt={`${tenant.business_name} logo`} fill sizes="40px" className="object-cover" unoptimized />
              </div>
            ) : (
              <div
                className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-white shadow-sm"
                style={{ backgroundColor: theme.primary }}
                aria-hidden
              >
                {tenant.business_name.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="min-w-0">
              <h1 className="truncate text-base font-bold text-slate-900">{tenant.business_name}</h1>
              {tenant.description && <p className="truncate text-xs text-slate-500">{tenant.description}</p>}
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsShareOpen(true)}
            className="rounded-full p-2.5 text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
            aria-label="Share this store"
          >
            <Share2 className="h-5 w-5" aria-hidden />
          </button>
        </div>
      </header>

      <section className="store-hero px-4 py-6">
        <div className="relative z-10 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] opacity-80">Welcome to</p>
            <h2 className="mt-1 text-2xl font-bold tracking-tight">{tenant.business_name}</h2>
            <p className="mt-1.5 max-w-[240px] text-sm leading-relaxed opacity-90">
              {tenant.description || 'Browse our collection and order instantly on WhatsApp.'}
            </p>
          </div>
          <div className="flex-shrink-0 rounded-2xl bg-white/15 p-3 backdrop-blur">
            <Sparkles className="h-5 w-5" aria-hidden />
          </div>
        </div>
        <div className="relative z-10 mt-5 flex flex-wrap gap-2 text-[11px] font-semibold">
          <span className="rounded-full bg-white/15 px-3 py-1.5 backdrop-blur">{tenant.products.length} products</span>
          <span className="rounded-full bg-white/15 px-3 py-1.5 backdrop-blur">WhatsApp ordering</span>
        </div>
      </section>

      {tenant.offer_active && tenant.offer_text && (
        <div className="px-4 pt-3">
          <div
            className="rounded-2xl px-4 py-3 text-center text-sm font-bold text-white shadow-sm"
            style={{ backgroundColor: theme.accent }}
          >
            {tenant.offer_text}
          </div>
        </div>
      )}

      <div className="flex gap-2 px-4 pt-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden />
          <input
            type="search"
            placeholder={`Search in ${tenant.business_name}...`}
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setActiveCategory('all');
            }}
            aria-label="Search products"
            className="store-pill w-full rounded-2xl py-3 pl-10 pr-4 text-sm shadow-sm"
          />
        </div>
        <div className="relative flex-shrink-0">
          <SlidersHorizontal className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden />
          <select
            value={sort}
            onChange={(event) => setSort(event.target.value as SortOption)}
            aria-label="Sort products"
            className="store-pill h-full appearance-none rounded-2xl py-3 pl-9 pr-6 text-sm font-medium shadow-sm"
          >
            <option value="featured">Featured</option>
            <option value="price-low">Price: low</option>
            <option value="price-high">Price: high</option>
            <option value="discount">Top discount</option>
          </select>
        </div>
      </div>

      <CategoryPills
        categories={tenant.categories}
        counts={categoryCounts}
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
        theme={theme}
      />

      <div className="flex items-center justify-between px-4 pb-1 pt-3">
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
          {visibleProducts.length} {visibleProducts.length === 1 ? 'item' : 'items'}
        </p>
        <span className="text-[11px] text-slate-400">Curated for you</span>
      </div>

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
        theme={theme}
        currency={tenant.currency || 'INR'}
      />

      <FloatingCartButton
        cartCount={cartCount}
        cartTotal={cartTotal}
        onClick={() => setIsCartOpen(true)}
        theme={theme}
        currency={tenant.currency || 'INR'}
      />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQuantity={updateQuantity}
        onRemoveItem={removeItem}
        tenant={tenant}
        theme={theme}
        currency={tenant.currency || 'INR'}
      />

      <VariantPicker
        product={pickerProduct}
        currency={tenant.currency || 'INR'}
        theme={theme}
        onClose={() => setPickerProduct(null)}
        onAdd={(variant) => {
          if (pickerProduct) {
            addToCart(pickerProduct, variant);
            setPickerProduct(null);
          }
        }}
      />

      <ShareModal isOpen={isShareOpen} onClose={() => setIsShareOpen(false)} storeUrl={storeUrl} businessName={tenant.business_name} />

      {cartCount === 0 && (
        <div className="fixed bottom-5 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2 rounded-full border border-slate-200 bg-white/90 px-4 py-2 text-xs font-medium text-slate-500 shadow-sm backdrop-blur">
          <ShoppingBag className="h-3.5 w-3.5" aria-hidden />
          Add items to get started
        </div>
      )}
    </div>
  );
}
