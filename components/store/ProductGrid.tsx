'use client';
import Image from 'next/image';
import { useState } from 'react';
import { Plus, PackageOpen, ChevronDown, ArrowUpRight } from 'lucide-react';
import type { Product, Theme } from '@/types';
import { formatMoney, discountPercent, normalizeProductImages } from '@/lib/utils';

interface ProductGridProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
  theme: Theme;
  currency: string;
}

function ProductCard({
  product,
  onAddToCart,
  theme,
  currency,
}: {
  product: Product;
  onAddToCart: (product: Product) => void;
  theme: Theme;
  currency: string;
}) {
  const [activeImage, setActiveImage] = useState(0);
  const images = normalizeProductImages(product.images ?? (product.image ? [product.image] : []));
  const image = images[Math.min(activeImage, Math.max(images.length - 1, 0))] ?? product.image;
  const off = discountPercent(product.price, product.compare_at_price);
  const hasVariants = (product.variants?.length ?? 0) > 0;
  const outOfStock = product.status === 'out_of_stock' || (product.stock ?? 0) === 0;
  const lowStock = !outOfStock && (product.stock ?? 0) > 0 && (product.stock ?? 0) <= 5;

  return (
    <article
      className="store-card group flex flex-col overflow-hidden"
      style={{ borderRadius: theme.radius ?? 18 }}
    >
      <div className="relative aspect-square overflow-hidden bg-slate-100">
        {image ? (
          <Image
            src={image}
            alt={product.name}
            fill
            sizes="(min-width: 640px) 25vw, 50vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            unoptimized
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-slate-300">
            <PackageOpen className="h-10 w-10" aria-hidden />
          </div>
        )}
        {off > 0 && (
          <span className="absolute left-2 top-2 rounded-full bg-rose-500 px-2 py-1 text-[10px] font-bold text-white shadow-sm">
            -{off}%
          </span>
        )}
        {lowStock && (
          <span className="absolute right-2 top-2 rounded-full bg-white/90 px-2 py-1 text-[10px] font-bold text-amber-700 shadow-sm backdrop-blur">
            Only {product.stock} left
          </span>
        )}
        {outOfStock && (
          <span className="absolute bottom-2 left-2 rounded-full bg-slate-900/80 px-2 py-1 text-[10px] font-bold text-white backdrop-blur">
            Out of stock
          </span>
        )}
        {images.length > 1 && (
          <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1.5">
            {images.map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setActiveImage(index)}
                className={`h-1.5 rounded-full transition-all ${
                  index === activeImage ? 'w-4 bg-white' : 'w-1.5 bg-white/60'
                }`}
                aria-label={`Show image ${index + 1} of ${product.name}`}
              />
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-3">
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-slate-900">{product.name}</h3>
        {product.description && (
          <p className="mt-1 line-clamp-1 text-[11px] text-slate-400">{product.description}</p>
        )}
        {hasVariants && (
          <p className="mt-1 text-[10px] font-medium text-slate-400">{product.variants?.length} options</p>
        )}

        <div className="mt-auto flex items-end justify-between gap-2 pt-3">
          <div className="min-w-0">
            <span className="block text-base font-bold leading-none" style={{ color: theme.primary }}>
              {formatMoney(product.price, currency)}
            </span>
            {product.compare_at_price ? (
              <span className="mt-1 block text-xs text-slate-400 line-through">
                {formatMoney(product.compare_at_price, currency)}
              </span>
            ) : (
              <span className="mt-1 block text-[10px] text-slate-400">{product.unit || 'per item'}</span>
            )}
          </div>
          <button
            type="button"
            onClick={() => onAddToCart(product)}
            disabled={outOfStock}
            className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full transition-transform active:scale-90 disabled:cursor-not-allowed disabled:opacity-40"
            style={{ backgroundColor: `${theme.primary}18`, color: theme.primary }}
            aria-label={hasVariants ? `Choose options for ${product.name}` : `Add ${product.name} to cart`}
          >
            {hasVariants ? (
              <ChevronDown className="h-4 w-4" aria-hidden />
            ) : (
              <Plus className="h-4 w-4" aria-hidden />
            )}
          </button>
        </div>
      </div>
      {off > 0 && !outOfStock && (
        <span className="flex items-center justify-center gap-1 border-t border-slate-100 bg-emerald-50/60 py-1.5 text-[10px] font-bold text-emerald-700">
          Save {formatMoney((product.compare_at_price ?? 0) - product.price, currency)}
          <ArrowUpRight className="h-3 w-3" aria-hidden />
        </span>
      )}
    </article>
  );
}

export default function ProductGrid({ products, onAddToCart, theme, currency }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <main className="p-4">
        <div className="surface-card px-6 py-14 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
            <PackageOpen className="h-8 w-8 text-slate-400" aria-hidden />
          </div>
          <p className="font-semibold text-slate-800">No products found</p>
          <p className="mt-1 text-sm text-slate-500">Try another search or category.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="grid grid-cols-2 gap-3 p-4">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onAddToCart={onAddToCart}
          theme={theme}
          currency={currency}
        />
      ))}
    </main>
  );
}
