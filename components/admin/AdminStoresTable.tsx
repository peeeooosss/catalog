'use client';
import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Search, ExternalLink, Power } from 'lucide-react';
import EmptyState from '@/components/ui/EmptyState';
import { formatMoney, relativeTime } from '@/lib/utils';
import { adminToggleStoreAction } from '@/lib/actions/store';

interface StoreRow {
  id: string;
  business_name: string;
  owner_email: string | null;
  is_active: boolean;
  products: number;
  orders: number;
  revenue: number;
  created_at: string;
}

export default function AdminStoresTable({ stores }: { stores: StoreRow[] }) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    if (!q) return stores;
    return stores.filter(
      (s) => s.business_name.toLowerCase().includes(q) || s.id.toLowerCase().includes(q) || (s.owner_email ?? '').toLowerCase().includes(q)
    );
  }, [stores, query]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Stores</h1>
        <p className="text-slate-600 mt-1">{stores.length} storefronts on the platform</p>
      </div>
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
        <div className="p-4 border-b border-slate-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" aria-hidden />
            <input
              type="text"
              placeholder="Search stores..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search stores"
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none text-sm"
            />
          </div>
        </div>
        {filtered.length === 0 ? (
          <EmptyState title="No stores found" description="Stores are created by sellers during onboarding." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Store</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Owner</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Products</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Orders</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Revenue</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Status</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s) => (
                  <tr key={s.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-900 text-sm">{s.business_name}</p>
                      <p className="text-xs text-slate-400">/{s.id}</p>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">{s.owner_email ?? '—'}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{s.products}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{s.orders}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-slate-900">{formatMoney(s.revenue)}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          s.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {s.is_active ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/store/${s.id}`}
                          target="_blank"
                          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg"
                          aria-label={`Open store ${s.business_name}`}
                        >
                          <ExternalLink className="w-4 h-4" aria-hidden />
                        </Link>
                        <form action={adminToggleStoreAction}>
                          <input type="hidden" name="id" value={s.id} />
                          <input type="hidden" name="active" value={s.is_active ? 'false' : 'true'} />
                          <button
                            type="submit"
                            className={`p-1.5 rounded-lg transition-colors ${
                              s.is_active
                                ? 'text-slate-400 hover:text-red-500 hover:bg-red-50'
                                : 'text-emerald-500 hover:bg-emerald-50'
                            }`}
                            aria-label={s.is_active ? `Disable ${s.business_name}` : `Enable ${s.business_name}`}
                          >
                            <Power className="w-4 h-4" aria-hidden />
                          </button>
                        </form>
                      </div>
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