'use client';
import { useMemo, useState } from 'react';
import { Search, Users, Phone, MessageCircle } from 'lucide-react';
import EmptyState from '@/components/ui/EmptyState';
import type { Customer } from '@/types';
import { formatMoney, relativeTime } from '@/lib/utils';

export default function CustomersTable({
  customers,
  currency,
}: {
  customers: Customer[];
  currency: string;
}) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    if (!q) return customers;
    return customers.filter(
      (c) => (c.name ?? '').toLowerCase().includes(q) || c.phone.includes(q) || (c.address ?? '').toLowerCase().includes(q)
    );
  }, [customers, query]);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Customers</h1>
        <p className="text-slate-600 mt-1">
          {customers.length} customer{customers.length === 1 ? '' : 's'} from your orders
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
        <div className="p-4 border-b border-slate-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" aria-hidden />
            <input
              type="text"
              placeholder="Search by name, phone or address..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search customers"
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-sm"
            />
          </div>
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            title={customers.length === 0 ? 'No customers yet' : 'No matching customers'}
            description={
              customers.length === 0
                ? 'Customers are added automatically when they place an order.'
                : 'Try a different search term.'
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Customer</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase hidden sm:table-cell">Contact</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Orders</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Spent</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase hidden md:table-cell">Last Order</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Reach</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr key={c.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-semibold text-sm flex-shrink-0">
                          {(c.name ?? '?').charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-slate-900 text-sm truncate">{c.name || 'Unknown'}</p>
                          {c.address && <p className="text-xs text-slate-400 truncate max-w-[220px]">{c.address}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600 hidden sm:table-cell">
                      <span className="inline-flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-slate-400" aria-hidden />
                        {c.phone}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-slate-700">{c.total_orders}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-slate-900">
                      {formatMoney(c.total_spent, currency)}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-500 hidden md:table-cell">
                      {c.last_order_at ? relativeTime(c.last_order_at) : '—'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <a
                        href={`https://wa.me/${c.phone.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-medium rounded-lg transition-colors"
                        aria-label={`Message ${c.name ?? c.phone} on WhatsApp`}
                      >
                        <MessageCircle className="w-3.5 h-3.5" aria-hidden />
                        Chat
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {customers.length === 0 && (
        <div className="mt-6 flex items-center gap-3 p-4 bg-slate-50 rounded-xl text-sm text-slate-500">
          <Users className="w-5 h-5" aria-hidden />
          Every WhatsApp order automatically creates or updates a customer profile here.
        </div>
      )}
    </div>
  );
}
