import Link from 'next/link';
import {
  Users,
  Store,
  Package,
  ShoppingCart,
  IndianRupee,
  UserCircle,
  ArrowUpRight,
} from 'lucide-react';
import { requireAdmin } from '@/lib/auth';
import { getPlatformSignups, getPlatformStats } from '@/lib/db';
import AdminSignupsChart from '@/components/admin/AdminSignupsChart';
import { formatMoney } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const [stats, signups] = await Promise.all([getPlatformStats(), getPlatformSignups(30)]);

  const cards = [
    { label: 'Sellers', value: stats.sellers.toLocaleString(), icon: Users, sub: `+${stats.newSellers7d} this week`, href: '/admin/sellers' },
    { label: 'Stores', value: stats.stores.toLocaleString(), icon: Store, sub: 'live storefronts', href: '/admin/stores' },
    { label: 'Products', value: stats.products.toLocaleString(), icon: Package, sub: 'across all stores', href: '/admin/stores' },
    { label: 'Orders', value: stats.orders.toLocaleString(), icon: ShoppingCart, sub: 'all time', href: '/admin/orders' },
    { label: 'Customers', value: stats.customers.toLocaleString(), icon: UserCircle, sub: 'unique buyers', href: '/admin/customers' },
    { label: 'Revenue', value: formatMoney(stats.revenue), icon: IndianRupee, sub: 'from confirmed orders', href: '/admin/orders' },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Platform Overview</h1>
        <p className="text-slate-600 mt-1">All sellers, stores and sales across CatalogPro.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        {cards.map((c) => (
          <Link
            key={c.label}
            href={c.href}
            className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 bg-slate-100 rounded-lg flex items-center justify-center">
                <c.icon className="w-4.5 h-4.5 text-slate-600 w-[18px] h-[18px]" aria-hidden />
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-300" aria-hidden />
            </div>
            <p className="text-xl font-bold text-slate-900">{c.value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{c.label}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">{c.sub}</p>
          </Link>
        ))}
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <AdminSignupsChart data={signups} />
      </div>
    </div>
  );
}