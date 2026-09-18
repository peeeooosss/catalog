'use client';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Plus, PackageOpen, ChevronDown } from 'lucide-react';
import type { Product } from '@/types';
import { formatMoney, discountPercent } from '@/lib/utils';

interface ProductGridProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
  theme: { primary: string };
  currency: string;
}

export default function ProductGrid({ products, onAddToCart, theme, currency }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <main className="p-4">
        <div className="text-center py-16 text-slate-500">
          <PackageOpen className="w-16 h-16 mx-auto mb-4 text-slate-300" aria-hidden />
          <p className="font-semibold text-slate-700 mb-1">No products found</p>
          <p className="text-sm">Check back soon for new items.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="p-4 grid grid-cols-2 gap-3">
      {products.map((product, index) => {
        const off = discountPercent(product.price, product.compare_at_price);
        const hasVariants = (product.variants?.length ?? 0) > 0;
        const outOfStock = product.status === 'out_of_stock' || (product.stock ?? 0) === 0;
        return (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: index * 0.03 }}
            whileHover={{ y: -3 }}
            className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm flex flex-col group"
          >
            <div className="aspect-square bg-slate-100 relative overflow-hidden">
              {product.image ? (
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  sizes="(min-width: 640px) 25vw, 50vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  unoptimized
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-300">
                  <PackageOpen className="w-10 h-10" aria-hidden />
                </div>
              )}
              {off > 0 && (
                <span className="absolute top-2 left-2 bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  -{off}%
                </span>
              )}
              {outOfStock && (
                <span className="absolute bottom-2 left-2 bg-slate-900/80 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  Out of stock
                </span>
              )}
            </div>
            <div className="p-3 flex flex-col flex-1">
              <h3 className="text-sm font-semibold line-clamp-2 mb-0.5 text-slate-900">{product.name}</h3>
              {product.unit && <p className="text-xs text-slate-400 mb-2">{product.unit}</p>}
              <div className="mt-auto flex items-center justify-between gap-2">
                <div className="min-w-0">
                  {product.compare_at_price ? (
                    <div className="flex items-center gap-1 flex-wrap">
                      <span className="text-base font-bold" style={{ color: theme.primary }}>
                        {formatMoney(product.price, currency)}
                      </span>
                      <span className="text-xs text-slate-400 line-through">
                        {formatMoney(product.compare_at_price, currency)}
                      </span>
                    </div>
                  ) : (
                    <span className="text-base font-bold" style={{ color: theme.primary }}>
                      {formatMoney(product.price, currency)}
                    </span>
                  )}
                </div>
                <motion.button
                  onClick={() => onAddToCart(product)}
                  whileTap={{ scale: 0.85 }}
                  disabled={outOfStock}
                  className="p-1.5 rounded-full transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ backgroundColor: `${theme.primary}15` }}
                  aria-label={hasVariants ? `Choose options for ${product.name}` : `Add ${product.name} to cart`}
                >
                  {hasVariants ? (
                    <ChevronDown className="w-4 h-4" style={{ color: theme.primary }} aria-hidden />
                  ) : (
                    <Plus className="w-4 h-4" style={{ color: theme.primary }} aria-hidden />
                  )}
                </motion.button>
              </div>
            </div>
          </motion.div>
        );
      })}
    </main>
  );
}