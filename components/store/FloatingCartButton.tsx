'use client';
import { motion } from 'framer-motion';
import { ShoppingBag } from 'lucide-react';

interface FloatingCartButtonProps {
  cartCount: number;
  cartTotal: number;
  onClick: () => void;
  theme: { primary: string };
}

export default function FloatingCartButton({
  cartCount,
  cartTotal,
  onClick,
  theme,
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
        className="w-full text-white font-bold py-4 rounded-2xl shadow-lg flex items-center justify-between px-6 transition-shadow"
        style={{ backgroundColor: theme.primary, boxShadow: `0 10px 30px ${theme.primary}40` }}
        aria-label={`Open cart with ${cartCount} items, total $${cartTotal.toFixed(2)}`}
      >
        <div className="flex items-center gap-3">
          <div className="bg-white/20 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">
            {cartCount}
          </div>
          <span>View Cart</span>
        </div>
        <span className="flex items-center gap-2">
          <ShoppingBag className="w-4 h-4" aria-hidden />
          ${cartTotal.toFixed(2)}
        </span>
      </motion.button>
    </motion.div>
  );
}