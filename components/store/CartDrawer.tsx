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
  MapPin,
  ShieldCheck,
} from 'lucide-react';
import { toast } from 'sonner';
import type { CartItem, Tenant, Theme } from '@/types';
import { formatMoney } from '@/lib/utils';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onUpdateQuantity: (key: string, delta: number) => void;
  onRemoveItem: (key: string) => void;
  tenant: Tenant;
  theme: Theme;
  currency: string;
}

export default function CartDrawer({
  isOpen,
  onClose,
  cart,
  onUpdateQuantity,
  onRemoveItem,
  tenant,
  theme,
  currency,
}: CartDrawerProps) {
  const [customer, setCustomer] = useState({ name: '', phone: '', address: '', notes: '' });
  const [placing, setPlacing] = useState(false);
  const [placed, setPlaced] = useState(false);

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
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
          items: cart.map((item) => ({
            product_id: item.product_id,
            variant_id: item.variant_id,
            quantity: item.quantity,
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
      toast.error(error instanceof Error ? error.message : 'Could not place your order. Please try again.');
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
            className="fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden
          />
        )}
      </AnimatePresence>

      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: isOpen ? 0 : '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 260 }}
        className="fixed bottom-0 left-0 right-0 z-50 mx-auto flex max-h-[88vh] w-full max-w-md flex-col overflow-hidden rounded-t-3xl bg-white shadow-lift"
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Your Cart</h2>
            <p className="text-xs text-slate-500">
              {cartCount} {cartCount === 1 ? 'item' : 'items'} · {tenant.business_name}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
            aria-label="Close cart"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto p-5">
          {cartEmpty ? (
            <div className="py-12 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
                <ShoppingBag className="h-7 w-7 text-slate-400" aria-hidden />
              </div>
              <p className="font-semibold text-slate-800">Your cart is empty</p>
              <p className="mt-1 text-sm text-slate-500">Add products from the catalog to get started.</p>
            </div>
          ) : placed ? (
            <div className="py-12 text-center" aria-live="polite">
              <CheckCircle2 className="mx-auto mb-4 h-16 w-16 text-emerald-500" aria-hidden />
              <p className="text-lg font-bold text-slate-900">Order sent!</p>
              <p className="mt-1 text-sm text-slate-500">We opened WhatsApp so you can send it to the seller.</p>
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {cart.map((item) => (
                  <div key={item.key} className="flex gap-3 rounded-2xl border border-slate-100 bg-slate-50/70 p-2.5">
                    <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-slate-100">
                      {item.image ? (
                        <Image src={item.image} alt={item.name} fill sizes="80px" className="object-cover" unoptimized />
                      ) : (
                        <ShoppingBag className="absolute inset-0 m-auto h-6 w-6 text-slate-300" aria-hidden />
                      )}
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col justify-between">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h3 className="line-clamp-2 text-sm font-semibold text-slate-900">{item.name}</h3>
                          {item.variant_label && <p className="text-xs text-slate-500">{item.variant_label}</p>}
                        </div>
                        <button
                          type="button"
                          onClick={() => onRemoveItem(item.key)}
                          className="flex-shrink-0 text-slate-400 transition-colors hover:text-rose-500"
                          aria-label={`Remove ${item.name} from cart`}
                        >
                          <Trash2 className="h-4 w-4" aria-hidden />
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold" style={{ color: theme.primary }}>
                          {formatMoney(item.price * item.quantity, currency)}
                        </span>
                        <div className="flex items-center gap-1 rounded-full border border-slate-200 bg-white px-1 py-1">
                          <button
                            type="button"
                            onClick={() => onUpdateQuantity(item.key, -1)}
                            className="flex h-6 w-6 items-center justify-center rounded-full text-slate-600 transition-colors hover:bg-slate-100"
                            aria-label={`Decrease quantity of ${item.name}`}
                          >
                            <Minus className="h-3 w-3" aria-hidden />
                          </button>
                          <span className="w-4 text-center text-sm font-medium" aria-live="polite">{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => onUpdateQuantity(item.key, 1)}
                            disabled={item.quantity >= item.maxStock}
                            className="flex h-6 w-6 items-center justify-center rounded-full text-slate-600 transition-colors hover:bg-slate-100 disabled:opacity-30"
                            aria-label={`Increase quantity of ${item.name}`}
                          >
                            <Plus className="h-3 w-3" aria-hidden />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-3 border-t border-slate-100 pt-4">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-emerald-500" aria-hidden />
                  <h3 className="text-sm font-semibold text-slate-900">Delivery details</h3>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Full Name *"
                    value={customer.name}
                    onChange={(event) => setCustomer({ ...customer, name: event.target.value })}
                    aria-label="Full name"
                    className="input-field"
                  />
                  <input
                    type="tel"
                    placeholder="Phone"
                    value={customer.phone}
                    onChange={(event) => setCustomer({ ...customer, phone: event.target.value })}
                    aria-label="Phone number"
                    className="input-field"
                  />
                </div>
                <input
                  type="text"
                  placeholder="Delivery Address"
                  value={customer.address}
                  onChange={(event) => setCustomer({ ...customer, address: event.target.value })}
                  aria-label="Delivery address"
                  className="input-field"
                />
                <textarea
                  placeholder="Notes for seller (optional)"
                  value={customer.notes}
                  onChange={(event) => setCustomer({ ...customer, notes: event.target.value })}
                  rows={2}
                  aria-label="Notes for seller"
                  className="input-field resize-none"
                />
              </div>
            </>
          )}
        </div>

        {!cartEmpty && !placed && (
          <div className="border-t border-slate-100 bg-white p-5">
            <div className="mb-3 flex items-center justify-between text-sm">
              <span className="text-slate-500">Subtotal ({cartCount} items)</span>
              <span className="font-semibold text-slate-900">{formatMoney(cartTotal, currency)}</span>
            </div>
            <div className="mb-4 flex items-center justify-between">
              <span className="font-medium text-slate-700">Total to Pay</span>
              <span className="text-xl font-bold text-slate-900">{formatMoney(cartTotal, currency)}</span>
            </div>
            <button
              type="button"
              onClick={placeOrder}
              disabled={placing || !customer.name.trim()}
              className="btn-primary w-full py-4"
              style={{ backgroundColor: theme.primary, borderRadius: theme.radius ?? 18 }}
            >
              {placing ? <Loader2 className="h-5 w-5 animate-spin" aria-hidden /> : <MessageCircle className="h-5 w-5" aria-hidden />}
              {placing ? 'Placing Order...' : 'Place Order via WhatsApp'}
            </button>
            {!customer.name.trim() && (
              <p className="mt-2 text-center text-xs text-amber-600">Enter your name to place the order.</p>
            )}
            <p className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
              <ShieldCheck className="h-3.5 w-3.5" aria-hidden />
              Your order is sent securely through WhatsApp.
            </p>
          </div>
        )}
      </motion.div>
    </>
  );
}
