'use client';
import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Search, Store as StoreIcon } from 'lucide-react';
import EmptyState from '@/components/ui/EmptyState';
import type { SellerSummary } from '@/types';
import { formatMoney, relativeTime } from '@/lib/utils';

export default function AdminSellersTable({ sellers }: { sellers: SellerSummary[] }) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    if (!q) return sellers;
    return sellers.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        (s.store_name ?? '').toLowerCase().includes(q)
    );
  }, [sellers, query]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Sellers</h1>
        <p className="text-slate-600 mt-1">{sellers.length} registered sellers</p>
      </div>
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
        <div className="p-4 border-b border-slate-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" aria-hidden />
            <input
              type="text"
              placeholder="Search by name, email or store..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search sellers"
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none text-sm"
            />
          </div>
        </div>
        {filtered.length === 0 ? (
          <EmptyState title="No sellers found" description="Sellers register through the signup page." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Seller</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Store</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Products</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Orders</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Revenue</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Joined</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s) => (
                  <tr key={s.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-slate-900 text-white flex items-center justify-center font-semibold text-sm flex-shrink-0">
                          {s.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-slate-900 text-sm truncate">{s.name}</p>
                          <p className="text-xs text-slate-400 truncate">{s.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {s.store_slug ? (
                        <Link
                          href={`/store/${s.store_slug}`}
                          target="_blank"
                          className="inline-flex items-center gap-1.5 text-sm text-slate-700 hover:text-emerald-600"
                        >
                          <StoreIcon className="w-3.5 h-3.5 text-slate-400" aria-hidden />
                          {s.store_name ?? s.store_slug}
                        </Link>
                      ) : (
                        <span className="text-sm text-slate-400">No store</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">{s.products}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{s.orders}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-slate-900">{formatMoney(s.revenue)}</td>
                    <td className="px-4 py-3 text-sm text-slate-500 hidden md:table-cell">{relativeTime(s.created_at)}</td>
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