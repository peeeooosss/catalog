'use client';
import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import EmptyState from '@/components/ui/EmptyState';
import { formatMoney, relativeTime } from '@/lib/utils';

interface AdminCustomer {
  id: number;
  store_name: string;
  phone: string;
  name: string | null;
  address: string | null;
  total_orders: number;
  total_spent: number;
  last_order_at: string | null;
}

export default function AdminCustomersTable({ customers }: { customers: AdminCustomer[] }) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    if (!q) return customers;
    return customers.filter(
      (c) =>
        (c.name ?? '').toLowerCase().includes(q) ||
        c.phone.includes(q) ||
        c.store_name.toLowerCase().includes(q) ||
        (c.address ?? '').toLowerCase().includes(q)
    );
  }, [customers, query]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Customers</h1>
        <p className="text-slate-600 mt-1">{customers.length} customers across all stores</p>
      </div>
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
        <div className="p-4 border-b border-slate-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" aria-hidden />
            <input
              type="text"
              placeholder="Search by name, phone, store or address..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search customers"
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none text-sm"
            />
          </div>
        </div>
        {filtered.length === 0 ? (
          <EmptyState title="No matching customers" description="Customers are created when orders are placed." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Customer</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Store</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Orders</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Spent</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase hidden md:table-cell">Last Order</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr key={c.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-semibold text-sm flex-shrink-0">
                          {(c.name ?? '?').charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-slate-900 text-sm truncate">{c.name || 'Unknown'}</p>
                          <p className="text-xs text-slate-400">{c.phone}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">{c.store_name}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{c.total_orders}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-slate-900">{formatMoney(c.total_spent)}</td>
                    <td className="px-4 py-3 text-sm text-slate-500 hidden md:table-cell">
                      {c.last_order_at ? relativeTime(c.last_order_at) : '—'}
                    </td>
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