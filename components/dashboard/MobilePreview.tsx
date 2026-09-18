'use client';
import Image from 'next/image';
import { Search, ShoppingBag, Plus, Heart } from 'lucide-react';

const DEMO_PRODUCTS = [
  { id: 1, name: 'Premium Cotton Shirt', price: 45.0, image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=400&q=80' },
  { id: 2, name: 'Classic Denim Jeans', price: 65.0, image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=400&q=80' },
  { id: 3, name: 'Summer Maxi Dress', price: 89.0, image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=400&q=80' },
  { id: 4, name: 'Leather Jacket', price: 120.0, image: 'https://images.unsplash.com/photo-1551028719-00575905b463?auto=format&fit=crop&w=400&q=80' },
];

interface MobilePreviewProps {
  theme: { primary: string; secondary: string; accent: string };
}

export default function MobilePreview({ theme }: MobilePreviewProps) {
  return (
    <div className="relative w-[280px] max-w-full h-[560px] flex justify-center">
      {/* Realistic phone frame */}
      <div className="absolute inset-0 bg-slate-900 rounded-[2.8rem] shadow-[0_0_0_2px_#1a1a1a,0_0_0_4px_#333,0_20px_60px_rgba(0,0,0,0.3)]">
        {/* side buttons */}
        <div className="absolute -left-[2px] top-24 w-[3px] h-10 bg-slate-700 rounded-l"></div>
        <div className="absolute -left-[2px] top-40 w-[3px] h-14 bg-slate-700 rounded-l"></div>
        <div className="absolute -right-[2px] top-32 w-[3px] h-16 bg-slate-700 rounded-r"></div>
      </div>

      <div className="absolute inset-[7px] bg-white rounded-[2.4rem] overflow-hidden relative">
        {/* Notch / Dynamic Island */}
        <div className="absolute top-[7px] left-1/2 -translate-x-1/2 w-24 h-[18px] bg-slate-900 rounded-full flex items-center justify-end pr-2 z-30">
          <div className="w-2 h-2 rounded-full bg-slate-700"></div>
        </div>
        {/* speaker */}
        <div className="absolute top-[12px] left-1/2 -translate-x-1/2 w-16 h-[7px] bg-slate-800/80 rounded-full z-30"></div>

        <div className="h-8 bg-white flex items-center justify-between px-6 pt-2">
          <span className="text-[9px] font-semibold text-slate-700">9:41</span>
          <div className="flex items-center gap-1">
            <span className="text-[8px] text-slate-500">5G</span>
            <div className="flex items-end gap-[2px]">
              <div className="w-[3px] h-[6px] bg-slate-600 rounded-sm"></div>
              <div className="w-[3px] h-[8px] bg-slate-600 rounded-sm"></div>
              <div className="w-[3px] h-[10px] bg-slate-600 rounded-sm"></div>
            </div>
          </div>
        </div>

        <div className="h-[calc(100%-2rem)] overflow-y-auto bg-slate-50 scrollbar-hide">
          <div className="sticky top-0 bg-white/95 backdrop-blur-md border-b border-slate-100 px-4 py-3 z-10">
            <div className="flex items-center justify-between">
              <h1 className="text-base font-bold text-slate-900">Your Store</h1>
              <Search className="w-4 h-4 text-slate-600" aria-hidden />
            </div>
          </div>

          <div className="sticky top-[49px] bg-slate-50 px-4 py-2 overflow-x-auto flex gap-2 z-10 scrollbar-hide">
            {['All', 'Tops', 'Bottoms', 'Dresses'].map((cat, idx) => (
              <button
                key={cat}
                className={`whitespace-nowrap px-3 py-1 rounded-full text-[11px] font-medium transition-all ${
                  idx === 0
                    ? 'text-white shadow-sm'
                    : 'bg-white text-slate-600 border border-slate-200'
                }`}
                style={idx === 0 ? { backgroundColor: theme.primary } : {}}
                aria-label={`Category ${cat}`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="p-3 grid grid-cols-2 gap-2">
            {DEMO_PRODUCTS.map((product) => (
              <div key={product.id} className="bg-white rounded-xl overflow-hidden border border-slate-100 shadow-sm">
                <div className="aspect-square bg-slate-100 relative overflow-hidden">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    sizes="140px"
                    className="object-cover"
                  />
                  <button className="absolute top-1.5 right-1.5 p-1 bg-white/80 backdrop-blur rounded-full" aria-label={`Add ${product.name} to wishlist`}>
                    <Heart className="w-2.5 h-2.5 text-slate-600" aria-hidden />
                  </button>
                </div>
                <div className="p-2">
                  <h3 className="text-[10px] font-semibold line-clamp-1 mb-1">{product.name}</h3>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold" style={{ color: theme.primary }}>
                      ${product.price}
                    </span>
                    <button
                      className="p-0.5 rounded-full"
                      style={{ backgroundColor: `${theme.primary}20` }}
                      aria-label={`Add ${product.name} to cart`}
                    >
                      <Plus className="w-2.5 h-2.5" style={{ color: theme.primary }} aria-hidden />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="absolute bottom-3 left-3 right-3 z-20">
          <button
            className="w-full text-white font-bold py-2.5 rounded-xl shadow-lg flex items-center justify-between px-4 text-sm active:scale-[0.98] transition-transform"
            style={{ backgroundColor: theme.primary }}
            aria-label="View cart"
          >
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-3.5 h-3.5" aria-hidden />
              <span>View Cart</span>
            </div>
            <div className="bg-white/20 px-2 py-0.5 rounded-full text-[10px] font-bold">2</div>
          </button>
        </div>
      </div>
    </div>
  );
}