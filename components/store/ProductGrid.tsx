'use client';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Plus, Heart } from 'lucide-react';
import type { Product } from '@/types';

interface ProductGridProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
  theme: { primary: string };
}

export default function ProductGrid({ products, onAddToCart, theme }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <main className="p-4">
        <div className="text-center py-16 text-slate-500">
          <svg className="w-20 h-20 mx-auto mb-4 text-slate-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
          </svg>
          <p className="font-semibold text-slate-700 mb-1">No products yet</p>
          <p className="text-sm">Check back soon for new items.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="p-4 grid grid-cols-2 gap-3">
      {products.map((product, index) => (
        <motion.div
          key={product.id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: index * 0.03 }}
          whileHover={{ y: -3 }}
          className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm flex flex-col group"
        >
          <div className="aspect-square bg-slate-100 relative overflow-hidden">
            <Image
              src={product.image}
              alt={product.name}
              fill
              sizes="(min-width: 640px) 25vw, 50vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <button
              className="absolute top-2 right-2 p-1.5 bg-white/80 backdrop-blur rounded-full transition-colors"
              aria-label={`Add ${product.name} to wishlist`}
            >
              <Heart className="w-3.5 h-3.5 text-slate-600" aria-hidden />
            </button>
          </div>
          <div className="p-3 flex flex-col flex-1">
            <h3 className="text-sm font-semibold line-clamp-2 mb-1 text-slate-900">{product.name}</h3>
            {product.description && <p className="text-xs text-slate-500 mb-2 line-clamp-1">{product.description}</p>}
            <div className="mt-auto flex items-center justify-between">
              <span className="text-base font-bold" style={{ color: theme.primary }}>
                ${product.price.toFixed(2)}
              </span>
              <motion.button
                onClick={() => onAddToCart(product)}
                whileTap={{ scale: 0.85 }}
                className="p-1.5 rounded-full transition-colors"
                style={{ backgroundColor: `${theme.primary}15` }}
                aria-label={`Add ${product.name} to cart`}
              >
                <Plus className="w-4 h-4" style={{ color: theme.primary }} aria-hidden />
              </motion.button>
            </div>
          </div>
        </motion.div>
      ))}
    </main>
  );
}