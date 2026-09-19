'use client';
import { useMemo, useState } from 'react';
import { useFormState } from 'react-dom';
import { toast } from 'sonner';
import {
  Search,
  ChevronDown,
  Phone,
  MapPin,
  MessageCircle,
  SendHorizontal,
  ShoppingBag,
} from 'lucide-react';
import EmptyState from '@/components/ui/EmptyState';
import type { Order, OrderStatus } from '@/types';
import { formatMoney, relativeTime, ORDER_STATUSES, ORDER_STATUS_META, MESSAGE_TEMPLATES, buildWhatsAppMessage, whatsAppUrl } from '@/lib/utils';
import { updateOrderStatusAction } from '@/lib/actions/orders';
import type { ActionState } from '@/lib/actions/auth';

function StatusSelect({ order }: { order: Order }) {
  const [state, formAction] = useFormState<ActionState, FormData>(updateOrderStatusAction, {});

  useMemo(() => {
    if (state.success) toast.success(state.success);
    if (state.error) toast.error(state.error);
    return null;
  }, [state]);

  return (
    <form action={formAction}>
      <input type="hidden" name="id" value={order.id} />
      <select
        name="status"
        defaultValue={order.status}
        onChange={(e) => e.currentTarget.form?.requestSubmit()}
        aria-label={`Update status for order ${order.order_number}`}
        className="text-xs font-medium border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
      >
        {ORDER_STATUSES.map((s) => (
          <option key={s} value={s}>
            {ORDER_STATUS_META[s].label}
          </option>
        ))}
      </select>
    </form>
  );
}

interface QuickMessageProps {
  order: Order;
  currency: string;
  storeName: string;
  storeOfferText?: string | null;
  storeUrl: string;
}

function QuickMessage({ order, currency, storeName, storeOfferText, storeUrl }: QuickMessageProps) {
  const [custom, setCustom] = useState('');
  const phone = String(order.customer_phone ?? '').replace(/[^0-9]/g, '');
  const ctx = {
    customerName: order.customer_name || 'there',
    orderNumber: String(order.order_number),
    total: formatMoney(order.total, currency),
    storeName,
    offerText: storeOfferText ?? undefined,
    catalogUrl: storeUrl,
  };

  const open = (templateId: string, extra?: string) => {
    const body =
      templateId === 'custom'
        ? `${buildWhatsAppMessage('custom', ctx)}${(extra ?? '').trim()}`
        : buildWhatsAppMessage(templateId, ctx);
    const finalText = body.trim().replace(/\s+/g, ' ');
    if (!finalText) return;
    window.open(whatsAppUrl(phone, finalText), '_blank', 'noopener,noreferrer');
    toast.success('Opening WhatsApp...');
  };

  if (!phone) {
    return <p className="text-xs text-slate-400 mt-2">No phone number on file.</p>;
  }

  return (
    <div className="mt-3">
      <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Quick messages</p>
      <div className="flex flex-wrap gap-1.5">
        {MESSAGE_TEMPLATES.map((t) => (
          <button
            key={t.id}
            onClick={() => open(t.id)}
            className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50 rounded-full text-xs font-medium text-slate-700 transition-colors"
          >
            <span aria-hidden>{t.emoji}</span> {t.label}
          </button>
        ))}
      </div>
      <div className="flex gap-2 mt-2">
        <input
          type="text"
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              open('custom', custom.trim());
            }
          }}
          placeholder="Or type a custom message..."
          aria-label="Custom WhatsApp message"
          className="flex-1 min-w-0 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500"
        />
        <button
          onClick={() => open('custom', custom.trim())}
          disabled={!custom.trim()}
          className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 text-white text-xs font-semibold rounded-lg transition-colors"
          aria-label="Send custom message"
        >
          <SendHorizontal className="w-3.5 h-3.5" aria-hidden />
          Send
        </button>
      </div>
      {custom.trim() && (
        <p className="text-xs text-slate-400 mt-1">Custom message starts with: Hi {ctx.customerName}, ...</p>
      )}
    </div>
  );
}

export default function OrdersBoard({
  orders,
  currency,
  storeName,
  storeOfferText,
  storeUrl,
}: {
  orders: Order[];
  currency: string;
  storeName: string;
  storeOfferText?: string | null;
  storeUrl: string;
}) {
  const [statusFilter, setStatusFilter] = useState<'all' | OrderStatus>('all');
  const [query, setQuery] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: orders.length };
    for (const o of orders) c[o.status] = (c[o.status] ?? 0) + 1;
    return c;
  }, [orders]);

  const filtered = useMemo(() => {
    return orders.filter((o) => {
      const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
      const q = query.toLowerCase();
      const matchesQuery =
        !q ||
        String(o.order_number).toLowerCase().includes(q) ||
        o.customer_name.toLowerCase().includes(q) ||
        String(o.customer_phone ?? '').includes(q);
      return matchesStatus && matchesQuery;
    });
  }, [orders, statusFilter, query]);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Orders</h1>
        <p className="text-slate-600 mt-1">
          {orders.length} order{orders.length === 1 ? '' : 's'} total
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
        <div className="p-4 border-b border-slate-100 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" aria-hidden />
            <input
              type="text"
              placeholder="Search by order #, name or phone..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search orders"
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-sm"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {(['all', ...ORDER_STATUSES] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  statusFilter === s
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {s === 'all' ? 'All' : ORDER_STATUS_META[s].label}
                <span className="ml-1.5 opacity-60">{counts[s] ?? 0}</span>
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            title={orders.length === 0 ? 'No orders yet' : 'No matching orders'}
            description={
              orders.length === 0
                ? 'Orders placed through your storefront will appear here.'
                : 'Try another status or search term.'
            }
          />
        ) : (
          <ul className="divide-y divide-slate-50">
            {filtered.map((order) => {
              const meta = ORDER_STATUS_META[order.status];
              const open = expanded === order.id;
              return (
                <li key={order.id}>
                  <div className="flex flex-wrap items-center gap-3 p-4">
                    <button
                      onClick={() => setExpanded(open ? null : order.id)}
                      className="flex items-center gap-3 flex-1 min-w-[200px] text-left"
                      aria-expanded={open}
                    >
                      <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
                        <ShoppingBag className="w-5 h-5 text-slate-500" aria-hidden />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-900 text-sm">{order.order_number}</p>
                        <p className="text-xs text-slate-500 truncate">
                          {order.customer_name} · {order.items?.length ?? 0} item
                          {(order.items?.length ?? 0) === 1 ? '' : 's'} · {relativeTime(order.created_at)}
                        </p>
                      </div>
                      <ChevronDown
                        className={`w-4 h-4 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`}
                        aria-hidden
                      />
                    </button>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-slate-900 text-sm">{formatMoney(order.total, currency)}</span>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${meta.className}`}>{meta.label}</span>
                      <StatusSelect order={order} />
                    </div>
                  </div>

                  {open && (
                    <div className="px-4 pb-4 -mt-1">
                      <div className="bg-slate-50 rounded-xl p-4 grid sm:grid-cols-2 gap-4">
                        <div>
                          <h3 className="text-xs font-semibold text-slate-500 uppercase mb-2">Items</h3>
                          <ul className="space-y-2">
                            {(order.items ?? []).map((item) => (
                              <li key={item.id} className="flex items-start justify-between text-sm gap-3">
                                <span className="text-slate-700">
                                  {item.quantity} × {item.name}
                                  {item.variant_label ? (
                                    <span className="text-slate-400"> ({item.variant_label})</span>
                                  ) : null}
                                </span>
                                <span className="font-medium text-slate-900 whitespace-nowrap">
                                  {formatMoney(item.subtotal, currency)}
                                </span>
                              </li>
                            ))}
                            {(order.items ?? []).length === 0 && (
                              <li className="text-sm text-slate-400">No item details.</li>
                            )}
                          </ul>
                        </div>
                        <div>
                          <h3 className="text-xs font-semibold text-slate-500 uppercase mb-2">Customer</h3>
                          <div className="space-y-2 text-sm text-slate-700">
                            <p className="font-medium">{order.customer_name}</p>
                            {order.customer_phone && (
                              <p className="flex items-center gap-2">
                                <Phone className="w-3.5 h-3.5 text-slate-400" aria-hidden />
                                {order.customer_phone}
                              </p>
                            )}
                            {order.customer_address && (
                              <p className="flex items-start gap-2">
                                <MapPin className="w-3.5 h-3.5 text-slate-400 mt-0.5" aria-hidden />
                                {order.customer_address}
                              </p>
                            )}
                            <a
                              href={`https://wa.me/${String(order.customer_phone ?? '').replace(/[^0-9]/g, '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 mt-1 px-3 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-medium rounded-lg"
                            >
                              <MessageCircle className="w-3.5 h-3.5" aria-hidden />
                              Message on WhatsApp
                            </a>
                            <QuickMessage
                              order={order}
                              currency={currency}
                              storeName={storeName}
                              storeOfferText={storeOfferText}
                              storeUrl={storeUrl}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
