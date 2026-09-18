'use client';
import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import EmptyState from '@/components/ui/EmptyState';
import type { OrderStatus } from '@/types';
import { formatMoney, relativeTime, ORDER_STATUS_META, ORDER_STATUSES } from '@/lib/utils';

interface AdminOrder {
  id: string;
  order_number: number;
  store_name: string;
  customer_name: string;
  customer_phone: string | null;
  total: number;
  status: OrderStatus;
  created_at: string;
}

export default function AdminOrdersTable({ orders }: { orders: AdminOrder[] }) {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<'all' | OrderStatus>('all');

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return orders.filter((o) => {
      const matchesStatus = status === 'all' || o.status === status;
      const matchesQuery =
        !q ||
        String(o.order_number).includes(q) ||
        o.store_name.toLowerCase().includes(q) ||
        o.customer_name.toLowerCase().includes(q) ||
        (o.customer_phone ?? '').includes(q);
      return matchesStatus && matchesQuery;
    });
  }, [orders, query, status]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Orders</h1>
        <p className="text-slate-600 mt-1">{orders.length} orders across all stores</p>
      </div>
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
        <div className="p-4 border-b border-slate-100 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" aria-hidden />
            <input
              type="text"
              placeholder="Search by order #, store, name or phone..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search orders"
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none text-sm"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setStatus('all')}
              className={`px-3 py-1.5 rounded-full text-xs font-medium ${status === 'all' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'}`}
            >
              All
            </button>
            {ORDER_STATUSES.map((s) => (
              <button
                key={s}
                onClick={() => setStatus(s)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium ${status === s ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'}`}
              >
                {ORDER_STATUS_META[s].label}
              </button>
            ))}
          </div>
        </div>
        {filtered.length === 0 ? (
          <EmptyState title="No matching orders" description="Try another status or search term." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Order</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Store</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Customer</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Total</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase hidden md:table-cell">Date</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((o) => (
                  <tr key={o.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 text-sm font-semibold text-slate-900">#{o.order_number}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{o.store_name}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">
                      {o.customer_name}
                      <span className="text-slate-400"> · {o.customer_phone}</span>
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-slate-900">{formatMoney(o.total)}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${ORDER_STATUS_META[o.status].className}`}>
                        {ORDER_STATUS_META[o.status].label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-500 hidden md:table-cell">{relativeTime(o.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}