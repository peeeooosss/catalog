'use client';
import type { CSSProperties } from 'react';
import Image from 'next/image';
import { Search, ShoppingBag, Plus, Heart, Sparkles } from 'lucide-react';
import type { Theme } from '@/types';
import { normalizeTheme } from '@/lib/utils';

const DEMO_PRODUCTS = [
  { id: 1, name: 'Premium Cotton Shirt', price: 45.0, image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=400&q=80' },
  { id: 2, name: 'Classic Denim Jeans', price: 65.0, image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=400&q=80' },
  { id: 3, name: 'Summer Maxi Dress', price: 89.0, image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=400&q=80' },
  { id: 4, name: 'Leather Jacket', price: 120.0, image: 'https://images.unsplash.com/photo-1551028719-00575905b463?auto=format&fit=crop&w=400&q=80' },
];

export default function MobilePreview({ theme }: { theme: Theme }) {
  const value = normalizeTheme(theme);
  const style = {
    '--color-primary': value.primary,
    '--color-secondary': value.secondary,
    '--color-accent': value.accent,
    '--store-radius': `${value.radius}px`,
  } as CSSProperties;

  return (
    <div className="storefront" data-template={value.template} style={style}>
      <div className="relative h-[560px] w-[280px] max-w-full">
        <div className="phone-frame absolute inset-0 rounded-[2.8rem]" aria-hidden>
          <div className="absolute -left-[2px] top-24 h-10 w-[3px] rounded-l bg-slate-700" />
          <div className="absolute -left-[2px] top-40 h-14 w-[3px] rounded-l bg-slate-700" />
          <div className="absolute -right-[2px] top-32 h-16 w-[3px] rounded-r bg-slate-700" />
        </div>

        <div className="absolute inset-[7px] overflow-hidden rounded-[2.4rem] bg-white">
          <div className="absolute left-1/2 top-[7px] z-30 flex h-[18px] w-24 -translate-x-1/2 items-center justify-end rounded-full bg-slate-900 pr-2">
            <div className="h-2 w-2 rounded-full bg-slate-700" />
          </div>
          <div className="absolute left-1/2 top-[12px] z-30 h-[7px] w-16 -translate-x-1/2 rounded-full bg-slate-800/80" />

          <div className="flex h-8 items-center justify-between bg-white px-6 pt-2">
            <span className="text-[9px] font-semibold text-slate-700">9:41</span>
            <div className="flex items-center gap-1">
              <span className="text-[8px] text-slate-500">5G</span>
              <div className="flex items-end gap-[2px]">
                <div className="h-[6px] w-[3px] rounded-sm bg-slate-600" />
                <div className="h-[8px] w-[3px] rounded-sm bg-slate-600" />
                <div className="h-[10px] w-[3px] rounded-sm bg-slate-600" />
              </div>
            </div>
          </div>

          <div className="scrollbar-hide h-[calc(100%-2rem)] overflow-y-auto bg-slate-50">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white/95 px-4 py-3 backdrop-blur-md">
              <h1 className="text-base font-bold text-slate-900">Your Store</h1>
              <Search className="h-4 w-4 text-slate-600" aria-hidden />
            </div>

            <div className="store-hero mx-3 mt-3 rounded-2xl p-3 shadow-sm">
              <div className="relative z-10 flex items-start justify-between">
                <div>
                  <p className="text-[8px] font-bold uppercase tracking-[0.2em] opacity-80">Welcome to</p>
                  <p className="mt-0.5 text-sm font-bold">Your Store</p>
                  <p className="mt-0.5 text-[9px] opacity-90">Order quickly on WhatsApp</p>
                </div>
                <div className="rounded-full bg-white/20 p-1.5 backdrop-blur">
                  <Sparkles className="h-3 w-3" aria-hidden />
                </div>
              </div>
            </div>

            <div className="scrollbar-hide sticky top-[49px] z-10 flex gap-2 overflow-x-auto bg-slate-50 px-4 py-2">
              {['All', 'Tops', 'Bottoms', 'Dresses'].map((cat, idx) => (
                <button
                  key={cat}
                  type="button"
                  className={`store-pill whitespace-nowrap rounded-full px-3 py-1 text-[11px] font-medium shadow-sm ${
                    idx === 0 ? 'text-white shadow-none' : ''
                  }`}
                  style={idx === 0 ? { backgroundColor: value.primary } : {}}
                  aria-label={`Category ${cat}`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-2 p-3">
              {DEMO_PRODUCTS.map((product) => (
                <div
                  key={product.id}
                  className="store-card overflow-hidden"
                  style={{ borderRadius: value.radius }}
                >
                  <div className="relative aspect-square overflow-hidden bg-slate-100">
                    <Image src={product.image} alt={product.name} fill sizes="140px" className="object-cover" />
                    <button
                      type="button"
                      className="absolute right-1.5 top-1.5 rounded-full bg-white/80 p-1 backdrop-blur"
                      aria-label={`Add ${product.name} to wishlist`}
                    >
                      <Heart className="h-2.5 w-2.5 text-slate-600" aria-hidden />
                    </button>
                  </div>
                  <div className="p-2">
                    <h3 className="mb-1 line-clamp-1 text-[10px] font-semibold text-slate-900">{product.name}</h3>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold" style={{ color: value.primary }}>${product.price}</span>
                      <button
                        type="button"
                        className="rounded-full p-0.5"
                        style={{ backgroundColor: `${value.primary}20` }}
                        aria-label={`Add ${product.name} to cart`}
                      >
                        <Plus className="h-2.5 w-2.5" style={{ color: value.primary }} aria-hidden />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="absolute bottom-3 left-3 right-3 z-20">
            <button
              type="button"
              className="flex w-full items-center justify-between rounded-xl px-4 py-2.5 text-sm font-bold text-white shadow-lg"
              style={{ backgroundColor: value.primary, borderRadius: Math.min(value.radius, 18) }}
              aria-label="View cart"
            >
              <span className="flex items-center gap-2">
                <ShoppingBag className="h-3.5 w-3.5" aria-hidden />
                View Cart
              </span>
              <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-bold">2</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
