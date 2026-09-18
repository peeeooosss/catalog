'use client';
import { useState } from 'react';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import {
  X,
  Plus,
  Minus,
  Trash2,
  MessageCircle,
  ShoppingBag,
  CheckCircle2,
  Loader2,
  Phone,
} from 'lucide-react';
import type { CartItem, Tenant } from '@/types';
import { formatMoney } from '@/lib/utils';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onUpdateQuantity: (key: string, delta: number) => void;
  onRemoveItem: (key: string) => void;
  tenant: Tenant;
  currency: string;
}

export default function CartDrawer({
  isOpen,
  onClose,
  cart,
  onUpdateQuantity,
  onRemoveItem,
  tenant,
  currency,
}: CartDrawerProps) {
  const [customer, setCustomer] = useState({ name: '', phone: '', address: '', notes: '' });
  const [placing, setPlacing] = useState(false);
  const [placed, setPlaced] = useState(false);

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartEmpty = cart.length === 0;

  const placeOrder = async () => {
    if (!customer.name.trim()) return;
    setPlacing(true);
    const sessionId = localStorage.getItem('cp_session_id') || undefined;
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId: tenant.id,
          sessionId,
          customer,
          items: cart.map((i) => ({
            product_id: i.product_id,
            variant_id: i.variant_id,
            quantity: i.quantity,
          })),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) throw new Error(data.error || 'Failed to place order');

      setPlaced(true);
      window.open(data.whatsappUrl, '_blank', 'noopener,noreferrer');
      setTimeout(() => {
        setPlaced(false);
        onClose();
      }, 1600);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Could not place your order. Please try again.');
    } finally {
      setPlacing(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-30"
            onClick={onClose}
            aria-hidden
          />
        )}
      </AnimatePresence>

      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: isOpen ? 0 : '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 260 }}
        className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white z-40 rounded-t-3xl shadow-2xl flex flex-col max-h-[85vh]"
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
      >
        <div className="flex items-center justify-between p-4 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-900">
            Your Cart ({cart.reduce((s, i) => s + i.quantity, 0)})
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors" aria-label="Close cart">
            <X className="w-5 h-5" aria-hidden />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {cartEmpty ? (
            <div className="text-center py-10 text-slate-500">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <ShoppingBag className="w-7 h-7 text-slate-300" aria-hidden />
              </div>
              <p className="font-semibold text-slate-700">Your cart is empty</p>
              <p className="text-sm mt-1">Add some products from the catalog to get started.</p>
            </div>
          ) : placed ? (
            <div className="text-center py-12">
              <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-4" aria-hidden />
              <p className="font-bold text-slate-900 text-lg">Order sent!</p>
              <p className="text-sm text-slate-500 mt-1">We&apos;ve opened WhatsApp to send your order.</p>
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {cart.map((item) => (
                  <div key={item.key} className="flex gap-3 bg-slate-50 p-2 rounded-xl">
                    <div className="w-20 h-20 rounded-lg overflow-hidden relative flex-shrink-0 bg-slate-100">
                      {item.image ? (
                        <Image src={item.image} alt={item.name} fill sizes="80px" className="object-cover" unoptimized />
                      ) : (
                        <ShoppingBag className="w-6 h-6 text-slate-300 absolute inset-0 m-auto" aria-hidden />
                      )}
                    </div>
                    <div className="flex-1 flex flex-col justify-between min-w-0">
                      <div className="flex justify-between items-start gap-2">
                        <div className="min-w-0">
                          <h3 className="text-sm font-semibold line-clamp-2 text-slate-900">{item.name}</h3>
                          {item.variant_label && <p className="text-xs text-slate-500">{item.variant_label}</p>}
                        </div>
                        <button
                          onClick={() => onRemoveItem(item.key)}
                          className="text-slate-400 hover:text-rose-500 transition-colors flex-shrink-0"
                          aria-label={`Remove ${item.name} from cart`}
                        >
                          <Trash2 className="w-4 h-4" aria-hidden />
                        </button>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-bold" style={{ color: tenant.theme.primary }}>
                          {formatMoney(item.price * item.quantity, currency)}
                        </span>
                        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-full px-1 py-1">
                          <button
                            onClick={() => onUpdateQuantity(item.key, -1)}
                            className="w-6 h-6 flex items-center justify-center text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                            aria-label={`Decrease quantity of ${item.name}`}
                          >
                            <Minus className="w-3 h-3" aria-hidden />
                          </button>
                          <span className="text-sm font-medium w-4 text-center" aria-live="polite">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => onUpdateQuantity(item.key, 1)}
                            disabled={item.quantity >= item.maxStock}
                            className="w-6 h-6 flex items-center justify-center text-slate-600 hover:bg-slate-100 rounded-full transition-colors disabled:opacity-30"
                            aria-label={`Increase quantity of ${item.name}`}
                          >
                            <Plus className="w-3 h-3" aria-hidden />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-slate-100 space-y-3">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-emerald-500" aria-hidden />
                  <h3 className="text-sm font-semibold text-slate-900">Delivery Details</h3>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Full Name *"
                    value={customer.name}
                    onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                    aria-label="Full name"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
                  />
                  <input
                    type="tel"
                    placeholder="Phone"
                    value={customer.phone}
                    onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                    aria-label="Phone number"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
                  />
                </div>
                <input
                  type="text"
                  placeholder="Delivery Address"
                  value={customer.address}
                  onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
                  aria-label="Delivery address"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
                />
                <textarea
                  placeholder="Notes for seller (optional)"
                  value={customer.notes}
                  onChange={(e) => setCustomer({ ...customer, notes: e.target.value })}
                  rows={2}
                  aria-label="Notes for seller"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm resize-none"
                />
              </div>
            </>
          )}
        </div>

        {!cartEmpty && !placed && (
          <div className="p-4 border-t border-slate-100 bg-white">
            <div className="flex justify-between items-center mb-4">
              <span className="text-slate-600 font-medium">Total to Pay</span>
              <span className="text-xl font-bold text-slate-900">{formatMoney(cartTotal, currency)}</span>
            </div>
            <button
              onClick={placeOrder}
              disabled={placing || !customer.name.trim()}
              className="w-full text-white font-bold py-4 rounded-2xl shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-transform disabled:opacity-50"
              style={{ backgroundColor: tenant.theme.primary, boxShadow: `0 8px 24px ${tenant.theme.primary}40` }}
            >
              {placing ? <Loader2 className="w-5 h-5 animate-spin" aria-hidden /> : <MessageCircle className="w-5 h-5" aria-hidden />}
              {placing ? 'Placing Order...' : 'Place Order via WhatsApp'}
            </button>
            {!customer.name.trim() && (
              <p className="text-xs text-amber-600 mt-2 text-center">Enter your name to place the order.</p>
            )}
          </div>
        )}
      </motion.div>
    </>
  );
}