'use client';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import { X, PackageOpen } from 'lucide-react';
import type { Product, ProductVariant } from '@/types';
import { formatMoney, discountPercent } from '@/lib/utils';

export default function VariantPicker({
  product,
  currency,
  theme,
  onClose,
  onAdd,
}: {
  product: Product | null;
  currency: string;
  theme: { primary: string };
  onClose: () => void;
  onAdd: (variant: ProductVariant) => void;
}) {
  const off = product ? discountPercent(product.price, product.compare_at_price) : 0;

  return (
    <AnimatePresence>
      {product && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 z-40 flex items-end sm:items-center justify-center"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 60 }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label={`Choose options for ${product.name}`}
            className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="p-5 border-b border-slate-100 flex items-start justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-14 h-14 rounded-xl bg-slate-100 overflow-hidden relative flex-shrink-0">
                  {product.image ? (
                    <Image src={product.image} alt={product.name} fill sizes="56px" className="object-cover" unoptimized />
                  ) : (
                    <PackageOpen className="w-6 h-6 text-slate-300 absolute inset-0 m-auto" aria-hidden />
                  )}
                </div>
                <div className="min-w-0">
                  <h2 className="font-bold text-slate-900 line-clamp-2">{product.name}</h2>
                  {off > 0 ? (
                    <p className="text-sm">
                      <span className="font-bold" style={{ color: theme.primary }}>
                        {formatMoney(product.price, currency)}
                      </span>
                      <span className="ml-2 text-slate-400 line-through text-xs">{formatMoney(product.compare_at_price ?? 0, currency)}</span>
                      <span className="ml-2 text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded">-{off}%</span>
                    </p>
                  ) : (
                    <p className="text-sm font-bold" style={{ color: theme.primary }}>
                      {formatMoney(product.price, currency)}
                    </p>
                  )}
                </div>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full" aria-label="Close">
                <X className="w-5 h-5" aria-hidden />
              </button>
            </div>

            <div className="p-5">
              <h3 className="text-sm font-semibold text-slate-700 mb-3">Choose an option</h3>
              <div className="space-y-2">
                {(product.variants ?? []).map((v) => {
                  const unavailable = !v.is_active || v.stock === 0;
                  const vOff = v.compare_at_price ? discountPercent(v.price ?? product.price, v.compare_at_price) : 0;
                  return (
                    <button
                      key={v.id}
                      disabled={unavailable}
                      onClick={() => onAdd(v)}
                      className="w-full flex items-center justify-between p-3.5 border-2 border-slate-100 hover:border-slate-300 rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-left"
                    >
                      <span className="text-sm font-medium text-slate-800">{v.label}</span>
                      <span className="flex items-center gap-2">
                        {vOff > 0 && (
                          <>
                            <span className="text-xs text-slate-400 line-through">{formatMoney(v.compare_at_price ?? 0, currency)}</span>
                            <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded">-{vOff}%</span>
                          </>
                        )}
                        <span className="text-sm font-bold" style={{ color: theme.primary }}>
                          {formatMoney(v.price != null ? v.price : product.price, currency)}
                        </span>
                      </span>
                    </button>
                  );
                })}
                {(product.variants ?? []).length === 0 && (
                  <p className="text-sm text-slate-400 text-center py-4">No options available.</p>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}