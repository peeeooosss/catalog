'use client';
import { motion } from 'framer-motion';
import { ShoppingBag } from 'lucide-react';
import type { Theme } from '@/types';
import { formatMoney } from '@/lib/utils';

interface FloatingCartButtonProps {
  cartCount: number;
  cartTotal: number;
  onClick: () => void;
  theme: Theme;
  currency: string;
}

export default function FloatingCartButton({
  cartCount,
  cartTotal,
  onClick,
  theme,
  currency,
}: FloatingCartButtonProps) {
  if (cartCount === 0) return null;

  return (
    <motion.div
      initial={{ y: 80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 80, opacity: 0 }}
      transition={{ type: 'spring', damping: 20, stiffness: 260 }}
      className="fixed bottom-6 left-4 right-4 z-20 max-w-md mx-auto"
    >
      <motion.button
        onClick={onClick}
        whileTap={{ scale: 0.97 }}
        className="flex w-full items-center justify-between bg-primary px-6 py-4 font-bold text-white shadow-lift"
        style={{ backgroundColor: theme.primary, borderRadius: theme.radius ?? 18, boxShadow: `0 12px 34px ${theme.primary}40` }}
        aria-label={`Open cart with ${cartCount} items, total ${formatMoney(cartTotal, currency)}`}
      >
        <div className="flex items-center gap-3">
          <div className="bg-white/20 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">
            {cartCount}
          </div>
          <span>View Cart</span>
        </div>
        <span className="flex items-center gap-2">
          <ShoppingBag className="w-4 h-4" aria-hidden />
          {formatMoney(cartTotal, currency)}
        </span>
      </motion.button>
    </motion.div>
  );
}