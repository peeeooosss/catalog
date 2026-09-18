'use client';
import { useState } from 'react';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Plus, Minus, Trash2, MessageCircle, ShoppingBag } from 'lucide-react';
import type { CartItem, Tenant } from '@/types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onUpdateQuantity: (id: number, delta: number) => void;
  tenant: Tenant;
}

export default function CartDrawer({
  isOpen,
  onClose,
  cart,
  onUpdateQuantity,
  tenant,
}: CartDrawerProps) {
  const [customer, setCustomer] = useState({ name: '', address: '', notes: '' });

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const generateWhatsAppLink = () => {
    let message = `*New Order for ${tenant.business_name}*\n\n`;
    message += `*Items Ordered:*\n`;
    cart.forEach((item) => {
      message += `• ${item.name}\n`;
      message += `  ${item.quantity} x $${item.price.toFixed(2)} = $${(item.quantity * item.price).toFixed(2)}\n`;
    });
    message += `\n*Total:* $${cartTotal.toFixed(2)}`;
    message += `\n\n*Customer Details:*\n`;
    message += `Name: ${customer.name}\n`;
    message += `Address: ${customer.address}\n`;
    if (customer.notes) message += `Notes: ${customer.notes}\n`;
    return `https://wa.me/${tenant.whatsapp_number}?text=${encodeURIComponent(message)}`;
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
          <h2 className="text-lg font-bold text-slate-900">Your Cart ({cart.length})</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors" aria-label="Close cart">
            <X className="w-5 h-5" aria-hidden />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {cart.length === 0 ? (
            <div className="text-center py-10 text-slate-500">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <ShoppingBag className="w-7 h-7 text-slate-300" aria-hidden />
              </div>
              <p className="font-semibold text-slate-700">Your cart is empty</p>
              <p className="text-sm mt-1">Add some products from the catalog to get started.</p>
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {cart.map((item) => (
                  <div key={item.id} className="flex gap-3 bg-slate-50 p-2 rounded-xl">
                    <div className="w-20 h-20 rounded-lg overflow-hidden relative flex-shrink-0">
                      <Image src={item.image} alt={item.name} fill sizes="80px" className="object-cover" />
                    </div>
                    <div className="flex-1 flex flex-col justify-between">
                      <div className="flex justify-between items-start">
                        <h3 className="text-sm font-semibold pr-2 line-clamp-2">{item.name}</h3>
                        <button
                          onClick={() => onUpdateQuantity(item.id, -item.quantity)}
                          className="text-slate-400 hover:text-rose-500 transition-colors"
                          aria-label={`Remove ${item.name} from cart`}
                        >
                          <Trash2 className="w-4 h-4" aria-hidden />
                        </button>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-bold" style={{ color: tenant.theme.primary }}>
                          ${(item.price * item.quantity).toFixed(2)}
                        </span>
                        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-full px-1 py-1">
                          <button
                            onClick={() => onUpdateQuantity(item.id, -1)}
                            className="w-6 h-6 flex items-center justify-center text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                            aria-label={`Decrease quantity of ${item.name}`}
                          >
                            <Minus className="w-3 h-3" aria-hidden />
                          </button>
                          <span className="text-sm font-medium w-4 text-center" aria-live="polite">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => onUpdateQuantity(item.id, 1)}
                            className="w-6 h-6 flex items-center justify-center text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
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
                <h3 className="text-sm font-semibold text-slate-900">Delivery Details</h3>
                <input
                  type="text"
                  placeholder="Full Name"
                  value={customer.name}
                  onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                  aria-label="Full name"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-sm"
                />
                <input
                  type="text"
                  placeholder="Delivery Address"
                  value={customer.address}
                  onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
                  aria-label="Delivery address"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-sm"
                />
                <textarea
                  placeholder="Notes for seller (optional)"
                  value={customer.notes}
                  onChange={(e) => setCustomer({ ...customer, notes: e.target.value })}
                  rows={2}
                  aria-label="Notes for seller"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-sm resize-none"
                />
              </div>
            </>
          )}
        </div>

        {cart.length > 0 && (
          <div className="p-4 border-t border-slate-100 bg-white">
            <div className="flex justify-between items-center mb-4">
              <span className="text-slate-600 font-medium">Total to Pay</span>
              <span className="text-xl font-bold text-slate-900">${cartTotal.toFixed(2)}</span>
            </div>
            <a
              href={generateWhatsAppLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full text-white font-bold py-4 rounded-2xl shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-transform"
              style={{ backgroundColor: tenant.theme.primary, boxShadow: `0 8px 24px ${tenant.theme.primary}40` }}
            >
              <MessageCircle className="w-5 h-5" aria-hidden />
              Place Order via WhatsApp
            </a>
          </div>
        )}
      </motion.div>
    </>
  );
}