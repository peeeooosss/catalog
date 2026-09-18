'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Search, Share2 } from 'lucide-react';
import CategoryPills from './CategoryPills';
import ProductGrid from './ProductGrid';
import CartDrawer from './CartDrawer';
import FloatingCartButton from './FloatingCartButton';
import ShareModal from './ShareModal';
import type { CartItem, Tenant } from '@/types';

export default function StoreFront({ tenant }: { tenant: Tenant }) {
  const [activeCategory, setActiveCategory] = useState('all');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);

  const storeUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://localhost:3000'}/store/${tenant.id}`;

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--color-primary', tenant.theme.primary);
    root.style.setProperty('--color-secondary', tenant.theme.secondary);
    root.style.setProperty('--color-accent', tenant.theme.accent);
  }, [tenant.theme]);

  const filteredProducts =
    activeCategory === 'all'
      ? tenant.products
      : tenant.products.filter((p) => p.category_id === activeCategory);

  const addToCart = (product: Tenant['products'][number]) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (id: number, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.id === id ? { ...item, quantity: item.quantity + delta } : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="min-h-screen bg-slate-50 max-w-md mx-auto relative pb-32">
      <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-slate-100 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {tenant.logo_url ? (
              <div className="w-10 h-10 rounded-full overflow-hidden relative flex-shrink-0">
                <Image
                  src={tenant.logo_url}
                  alt={`${tenant.business_name} logo`}
                  fill
                  sizes="40px"
                  className="object-cover"
                />
              </div>
            ) : (
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                style={{ backgroundColor: tenant.theme.primary }}
                aria-hidden
              >
                {tenant.business_name.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <h1 className="text-lg font-bold text-slate-900">{tenant.business_name}</h1>
              {tenant.description && <p className="text-xs text-slate-500">{tenant.description}</p>}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 rounded-full hover:bg-slate-100 transition-colors" aria-label="Search catalog">
              <Search className="w-5 h-5 text-slate-600" aria-hidden />
            </button>
            <button
              onClick={() => setIsShareOpen(true)}
              className="p-2 rounded-full hover:bg-slate-100 transition-colors"
              aria-label="Share this store"
            >
              <Share2 className="w-5 h-5 text-slate-600" aria-hidden />
            </button>
          </div>
        </div>
      </header>

      <CategoryPills
        categories={tenant.categories}
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
        theme={tenant.theme}
      />

      <ProductGrid products={filteredProducts} onAddToCart={addToCart} theme={tenant.theme} />

      <FloatingCartButton
        cartCount={cartCount}
        cartTotal={cartTotal}
        onClick={() => setIsCartOpen(true)}
        theme={tenant.theme}
      />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQuantity={updateQuantity}
        tenant={tenant}
      />

      <ShareModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        storeUrl={storeUrl}
        businessName={tenant.business_name}
      />
    </div>
  );
}