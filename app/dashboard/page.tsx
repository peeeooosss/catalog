import Link from 'next/link';
import Image from 'next/image';
import {
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  ClipboardList,
  ExternalLink,
  Eye,
  MessageCircle,
  Package,
  Plus,
  ShoppingBag,
  ShoppingCart,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { requireStore } from '@/lib/auth';
import { getAnalytics, getDashboardStats, getOrders, getTopProducts } from '@/lib/db';
import CopyStoreLink from '@/components/dashboard/CopyStoreLink';
import EmptyState from '@/components/ui/EmptyState';
import PageHeader from '@/components/ui/PageHeader';
import Sparkline from '@/components/dashboard/Sparkline';
import StatCard from '@/components/dashboard/StatCard';
import type { AnalyticsPoint } from '@/types';
import { formatMoney, ORDER_STATUS_META, relativeTime } from '@/lib/utils';

export const dynamic = 'force-dynamic';

type Metric = 'views' | 'carts' | 'clicks' | 'orders';

function trend(points: AnalyticsPoint[], key: Metric) {
  if (points.length < 2) return 0;
  const midpoint = Math.ceil(points.length / 2);
  const previous = points.slice(0, midpoint).reduce((sum, point) => sum + point[key], 0);
  const current = points.slice(midpoint).reduce((sum, point) => sum + point[key], 0);
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}

export default async function DashboardPage() {
  const { store, user } = await requireStore();
  const [stats, topProducts, analytics, recentOrders] = await Promise.all([
    getDashboardStats(store.id),
    getTopProducts(store.id, 30, 4),
    getAnalytics(store.id, 7),
    getOrders(store.id, { limit: 4 }),
  ]);

  const chart = analytics ?? [];
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const firstName = user.name?.split(' ')[0] || 'there';
  const conversion = stats.views > 0 ? (stats.orders / stats.views) * 100 : 0;

  const checklist = [
    { step: 'Create your store', done: true, href: '/dashboard/settings' },
    { step: 'Add at least 5 products', done: stats.products >= 5, href: '/dashboard/products' },
    { step: 'Create categories', done: stats.categories > 0, href: '/dashboard/categories' },
    { step: 'Get your first order', done: stats.orders > 0, href: '/dashboard/orders' },
    { step: 'Share your catalog link', done: false, href: `/store/${store.id}` },
  ];
  const completed = checklist.filter((item) => item.done).length;
  const progress = Math.round((completed / checklist.length) * 100);

  return (
    <div className="pt-16 md:pt-0">
      <PageHeader
        eyebrow="Owner overview"
        title={`${greeting}, ${firstName}`}
        description={`Here's what's happening with ${store.business_name} today.`}
        actions={
          <>
            <Link
              href={`/store/${store.id}`}
              target="_blank"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-300"
            >
              <ExternalLink className="h-4 w-4" aria-hidden />
              View store
            </Link>
            <Link href="/dashboard/products/new" className="btn-primary px-4 py-2.5 text-sm">
              <Plus className="h-4 w-4" aria-hidden />
              Add product
            </Link>
          </>
        }
      />

      <section className="relative mb-6 overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 p-6 text-white shadow-lift sm:p-8">
        <div className="grid-pattern pointer-events-none absolute inset-0 opacity-70" aria-hidden />
        <div className="absolute -right-16 -top-20 h-72 w-72 rounded-full bg-white/10 blur-2xl" aria-hidden />
        <div className="relative grid gap-8 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-xs font-semibold backdrop-blur">
              <Sparkles className="h-3.5 w-3.5" aria-hidden />
              Store performance
            </div>
            <p className="text-sm text-emerald-50">Revenue to date</p>
            <p className="mt-1 text-4xl font-bold tracking-tight sm:text-5xl">{formatMoney(stats.revenue, store.currency)}</p>
            <div className="mt-5 flex flex-wrap items-center gap-6">
              <div>
                <p className="text-xs text-emerald-100">Conversion</p>
                <p className="text-lg font-bold">{conversion.toFixed(1)}%</p>
              </div>
              <div>
                <p className="text-xs text-emerald-100">Items sold</p>
                <p className="text-lg font-bold">{stats.itemsSold}</p>
              </div>
              <div>
                <p className="text-xs text-emerald-100">Orders</p>
                <p className="text-lg font-bold">{stats.orders}</p>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-white/20 bg-white/10 p-5 backdrop-blur-md">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-semibold">Orders this week</p>
              <TrendingUp className="h-4 w-4 text-emerald-100" aria-hidden />
            </div>
            <Sparkline values={chart.map((point) => point.orders)} color="#ffffff" className="h-16" />
            <p className="mt-3 text-xs text-emerald-100">{chart.reduce((sum, point) => sum + point.orders, 0)} orders from store visits</p>
          </div>
        </div>
      </section>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Products" value={String(stats.products)} icon={Package} href="/dashboard/products" tone="violet" hint="Live in your catalog" />
        <StatCard label="Store views" value={stats.views.toLocaleString()} icon={Eye} delta={trend(chart, 'views')} href="/dashboard/analytics" hint="Last 7 days" />
        <StatCard label="Cart additions" value={stats.carts.toLocaleString()} icon={ShoppingCart} delta={trend(chart, 'carts')} href="/dashboard/analytics" tone="amber" hint="Last 7 days" />
        <StatCard label="WhatsApp clicks" value={stats.whatsappClicks.toLocaleString()} icon={MessageCircle} delta={trend(chart, 'clicks')} href="/dashboard/analytics" tone="sky" hint="Last 7 days" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="surface-card lg:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
            <div>
              <h2 className="font-bold text-slate-900">Recent orders</h2>
              <p className="text-xs text-slate-500">Latest activity from your storefront</p>
            </div>
            <Link href="/dashboard/orders" className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700">
              View all <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
            </Link>
          </div>
          {recentOrders.length === 0 ? (
            <EmptyState title="No orders yet" description="Share your catalog link to receive your first order." />
          ) : (
            <ul className="divide-y divide-slate-100">
              {recentOrders.map((order) => {
                const meta = ORDER_STATUS_META[order.status];
                return (
                  <li key={order.id} className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 transition-colors hover:bg-slate-50/70">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900">
                        #{order.order_number} · {order.customer_name}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-500">
                        {order.item_count} {order.item_count === 1 ? 'item' : 'items'} · {relativeTime(order.created_at)}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-slate-900">{formatMoney(order.total, store.currency)}</span>
                      <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${meta.className}`}>{meta.label}</span>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <div className="space-y-6">
          <section className="surface-card p-6">
            <div className="mb-4 flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-violet-500" aria-hidden />
              <h2 className="font-bold text-slate-900">Setup checklist</h2>
            </div>
            <div className="space-y-3">
              {checklist.map((item) => (
                <Link key={item.step} href={item.href} className="group flex items-center gap-3">
                  <span
                    className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                      item.done ? 'bg-emerald-500 text-white' : 'border border-slate-300 bg-white text-transparent'
                    }`}
                    aria-hidden
                  >
                    ✓
                  </span>
                  <span className={`text-sm ${item.done ? 'text-slate-400 line-through' : 'text-slate-700 group-hover:text-emerald-700'}`}>
                    {item.step}
                  </span>
                </Link>
              ))}
            </div>
            <div className="mt-5 border-t border-slate-100 pt-4">
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="text-slate-500">Progress</span>
                <span className="font-semibold text-slate-900">{progress}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all" style={{ width: `${progress}%` }} />
              </div>
            </div>
          </section>

          <section className="surface-card p-6">
            <div className="mb-4 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" aria-hidden />
              <h2 className="font-bold text-slate-900">Needs attention</h2>
            </div>
            <div className="space-y-3">
              <Link href="/dashboard/orders" className="flex items-center justify-between rounded-xl bg-amber-50 px-4 py-3 transition-colors hover:bg-amber-100">
                <span className="text-sm font-medium text-amber-900">Pending orders</span>
                <span className="text-lg font-bold text-amber-700">{stats.pendingOrders}</span>
              </Link>
              <Link href="/dashboard/products" className="flex items-center justify-between rounded-xl bg-rose-50 px-4 py-3 transition-colors hover:bg-rose-100">
                <span className="text-sm font-medium text-rose-900">Low stock items</span>
                <span className="text-lg font-bold text-rose-700">{stats.lowStock}</span>
              </Link>
            </div>
          </section>
        </div>

        <section className="surface-card lg:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
            <div>
              <h2 className="font-bold text-slate-900">Best sellers</h2>
              <p className="text-xs text-slate-500">Top products in the last 30 days</p>
            </div>
            <Link href="/dashboard/analytics" className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700">
              Analytics <ArrowRight className="h-3.5 w-3.5" aria-hidden />
            </Link>
          </div>
          {topProducts.length === 0 ? (
            <EmptyState title="No sales data yet" description="Sales will appear here once your first orders come in." />
          ) : (
            <ul className="divide-y divide-slate-100">
              {topProducts.map((product) => (
                <li key={product.id} className="flex items-center gap-3 px-6 py-3">
                  <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-xl bg-slate-100">
                    {product.image ? (
                      <Image src={product.image} alt={product.name} fill sizes="40px" className="object-cover" unoptimized />
                    ) : (
                      <ShoppingBag className="absolute inset-0 m-auto h-4 w-4 text-slate-400" aria-hidden />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-800">{product.name}</p>
                    <p className="text-xs text-slate-400">{product.sold} sold · {product.cart_adds} cart adds</p>
                  </div>
                  <span className="text-sm font-semibold text-slate-900">{formatMoney(product.revenue, store.currency)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="relative overflow-hidden rounded-2xl bg-slate-900 p-6 text-white shadow-lift">
          <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-emerald-500/20 blur-2xl" aria-hidden />
          <div className="relative">
            <h2 className="flex items-center gap-2 font-bold">
              <Sparkles className="h-5 w-5 text-emerald-400" aria-hidden />
              Your store link
            </h2>
            <p className="mt-1 text-sm text-slate-300">Share it on WhatsApp, Instagram, or anywhere your customers are.</p>
            <div className="mt-4 rounded-xl bg-white/5 p-1">
              <CopyStoreLink slug={store.id} />
            </div>
            <Link
              href="/dashboard/theme"
              className="mt-4 flex items-center justify-between rounded-xl bg-white/5 p-3 text-sm font-medium transition-colors hover:bg-white/10"
            >
              Customize storefront
              <ArrowUpRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
