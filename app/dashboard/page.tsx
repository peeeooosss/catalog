import Link from 'next/link';
import Image from 'next/image';
import {
  Package,
  Eye,
  ShoppingBag,
  MessageCircle,
  IndianRupee,
  TrendingUp,
  ExternalLink,
  AlertTriangle,
  ArrowRight,
  ListTree,
  Rocket,
} from 'lucide-react';
import { requireStore } from '@/lib/auth';
import { getDashboardStats, getTopProducts } from '@/lib/db';
import CopyStoreLink from '@/components/dashboard/CopyStoreLink';
import { formatMoney } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const { store, user } = await requireStore();
  const [stats, topProducts] = await Promise.all([
    getDashboardStats(store.id),
    getTopProducts(store.id, 30, 4),
  ]);

  const cards = [
    { label: 'Products', value: String(stats.products), icon: Package, color: 'bg-blue-100 text-blue-600', href: '/dashboard/products' },
    { label: 'Store Views', value: stats.views.toLocaleString(), icon: Eye, color: 'bg-emerald-100 text-emerald-600', href: '/dashboard/analytics' },
    { label: 'Cart Additions', value: stats.carts.toLocaleString(), icon: ShoppingBag, color: 'bg-purple-100 text-purple-600', href: '/dashboard/analytics' },
    { label: 'WhatsApp Clicks', value: stats.whatsappClicks.toLocaleString(), icon: MessageCircle, color: 'bg-amber-100 text-amber-600', href: '/dashboard/analytics' },
  ];

  const checklist = [
    { step: 'Create your store', done: true, href: '/dashboard/settings' },
    { step: 'Add at least 5 products', done: stats.products >= 5, href: '/dashboard/products' },
    { step: 'Create categories', done: stats.categories > 0, href: '/dashboard/categories' },
    { step: 'Get your first order', done: stats.orders > 0, href: '/dashboard/orders' },
    { step: 'Share your catalog link', done: false, href: `/store/${store.id}` },
  ];
  const completed = checklist.filter((c) => c.done).length;
  const progress = Math.round((completed / checklist.length) * 100);

  return (
    <div className="pt-16 md:pt-0">
      <div className="mb-8 flex items-center justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-slate-900 truncate">Welcome back, {user.name?.split(' ')[0] || 'Seller'} 👋</h1>
          <p className="text-slate-600 mt-1">Here&apos;s what&apos;s happening with {store.business_name}.</p>
        </div>
        <Link
          href={`/store/${store.id}`}
          target="_blank"
          className="hidden md:inline-flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-lg transition-colors flex-shrink-0"
        >
          <ExternalLink className="w-4 h-4" aria-hidden />
          View Store
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {cards.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-10 h-10 ${stat.color} rounded-lg flex items-center justify-center`}>
                <stat.icon className="w-5 h-5" aria-hidden />
              </div>
              <TrendingUp className="w-4 h-4 text-slate-300" aria-hidden />
            </div>
            <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
            <p className="text-sm text-slate-500">{stat.label}</p>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-2 text-slate-500 text-sm mb-1">
            <IndianRupee className="w-4 h-4" aria-hidden />
            Revenue
          </div>
          <p className="text-xl font-bold text-slate-900">{formatMoney(stats.revenue, store.currency)}</p>
        </div>
        <Link href="/dashboard/orders" className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 text-slate-500 text-sm mb-1">
            <ShoppingBag className="w-4 h-4" aria-hidden />
            Orders
          </div>
          <p className="text-xl font-bold text-slate-900">{stats.orders}</p>
          {stats.pendingOrders > 0 && <p className="text-xs text-amber-600 mt-1">{stats.pendingOrders} to confirm</p>}
        </Link>
        <Link href="/dashboard/products" className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 text-slate-500 text-sm mb-1">
            <AlertTriangle className="w-4 h-4" aria-hidden />
            Low Stock
          </div>
          <p className="text-xl font-bold text-slate-900">{stats.lowStock}</p>
          <p className="text-xs text-slate-400 mt-1">items with 5 or fewer left</p>
        </Link>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Setup Checklist</h2>
          <div className="space-y-3">
            {checklist.map((item) => (
              <Link key={item.step} href={item.href} className="flex items-center gap-3 group">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${item.done ? 'bg-emerald-500' : 'bg-slate-200'}`} aria-hidden>
                  {item.done && (
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <span className={`text-sm group-hover:text-emerald-700 ${item.done ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                  {item.step}
                </span>
              </Link>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">Progress</span>
              <span className="font-semibold text-slate-900">{progress}%</span>
            </div>
            <div className="mt-2 h-2 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-900">Best Sellers</h2>
            <Link href="/dashboard/analytics" className="text-sm text-emerald-600 hover:text-emerald-700 font-medium">
              Analytics
            </Link>
          </div>
          {topProducts.length === 0 ? (
            <p className="text-sm text-slate-400">Sales data will appear here once you get orders.</p>
          ) : (
            <ul className="space-y-3">
              {topProducts.map((p) => (
                <li key={p.id} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-slate-100 overflow-hidden relative flex-shrink-0">
                    {p.image ? (
                      <Image src={p.image} alt={p.name} fill sizes="40px" className="object-cover" unoptimized />
                    ) : (
                      <Package className="w-4 h-4 text-slate-400 absolute inset-0 m-auto" aria-hidden />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">{p.name}</p>
                    <p className="text-xs text-slate-400">
                      {p.sold} sold · {p.cart_adds} cart adds
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-slate-900">{formatMoney(p.revenue, store.currency)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-6 rounded-2xl text-white shadow-lg shadow-emerald-500/30">
          <h2 className="text-lg font-bold mb-2">Your Store Link</h2>
          <p className="text-emerald-100 text-sm mb-4">Share this link on WhatsApp, Instagram, and social media</p>
          <CopyStoreLink slug={store.id} />
          <div className="space-y-2">
            <Link href="/dashboard/products/new" className="flex items-center justify-between p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors">
              <span className="text-sm font-medium">Add a product</span>
              <ArrowRight className="w-4 h-4" aria-hidden />
            </Link>
            <Link href="/dashboard/categories" className="flex items-center justify-between p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors">
              <span className="text-sm font-medium flex items-center gap-2">
                <ListTree className="w-4 h-4" aria-hidden /> Manage categories
              </span>
              <ArrowRight className="w-4 h-4" aria-hidden />
            </Link>
            <Link href="/dashboard/onboarding" className="flex items-center justify-between p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors">
              <span className="text-sm font-medium flex items-center gap-2">
                <Rocket className="w-4 h-4" aria-hidden /> Setup guide
              </span>
              <ArrowRight className="w-4 h-4" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
