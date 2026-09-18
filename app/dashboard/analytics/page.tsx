import Link from 'next/link';
import Image from 'next/image';
import {
  Eye,
  Users,
  ShoppingBag,
  MessageCircle,
  PackageCheck,
  IndianRupee,
  TrendingUp,
  Package,
} from 'lucide-react';
import { requireStore } from '@/lib/auth';
import { getAnalytics, getFunnel, getTopProducts } from '@/lib/db';
import AnalyticsChart from '@/components/dashboard/AnalyticsChart';
import EmptyState from '@/components/ui/EmptyState';
import { formatMoney } from '@/lib/utils';

export const dynamic = 'force-dynamic';

const RANGES = [
  { days: 7, label: '7 days' },
  { days: 30, label: '30 days' },
  { days: 90, label: '90 days' },
];

export default async function AnalyticsPage({ searchParams }: { searchParams: { days?: string } }) {
  const { store } = await requireStore();
  const days = [7, 30, 90].includes(Number(searchParams.days)) ? Number(searchParams.days) : 7;

  const [funnel, chart, topProducts] = await Promise.all([
    getFunnel(store.id, days),
    getAnalytics(store.id, days),
    getTopProducts(store.id, days, 8),
  ]);

  const funnelSteps = [
    { label: 'Store Views', value: funnel.views, icon: Eye, color: 'bg-emerald-500' },
    { label: 'Unique Visitors', value: funnel.visitors, icon: Users, color: 'bg-teal-500' },
    { label: 'Added to Cart', value: funnel.carts, icon: ShoppingBag, color: 'bg-purple-500' },
    { label: 'WhatsApp Clicks', value: funnel.whatsappClicks, icon: MessageCircle, color: 'bg-amber-500' },
    { label: 'Orders', value: funnel.orders, icon: PackageCheck, color: 'bg-blue-500' },
  ];
  const maxStep = Math.max(1, ...funnelSteps.map((s) => s.value));

  const summary = [
    { label: 'Items Sold', value: funnel.itemsSold.toLocaleString(), icon: PackageCheck },
    { label: 'Revenue', value: formatMoney(funnel.revenue, store.currency), icon: IndianRupee },
    {
      label: 'Conversion Rate',
      value: funnel.views > 0 ? `${((funnel.orders / funnel.views) * 100).toFixed(1)}%` : '0%',
      icon: TrendingUp,
    },
    {
      label: 'Avg. Order Value',
      value: funnel.orders > 0 ? formatMoney(funnel.revenue / funnel.orders, store.currency) : formatMoney(0, store.currency),
      icon: IndianRupee,
    },
  ];

  return (
    <div className="pt-16 md:pt-0">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Analytics</h1>
          <p className="text-slate-600 mt-1">
            Live data from your store for the last {days} days.
          </p>
        </div>
        <div className="flex gap-1 bg-slate-100 p-1 rounded-lg w-fit">
          {RANGES.map((r) => (
            <Link
              key={r.days}
              href={`/dashboard/analytics?days=${r.days}`}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                days === r.days ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {r.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {summary.map((s) => (
          <div key={s.label} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex items-center gap-2 text-slate-500 text-sm mb-1">
              <s.icon className="w-4 h-4" aria-hidden />
              {s.label}
            </div>
            <p className="text-xl font-bold text-slate-900">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Activity</h2>
          {chart && chart.some((p) => p.views + p.carts + p.clicks + p.orders > 0) ? (
            <AnalyticsChart data={chart} />
          ) : (
            <EmptyState title="No activity yet" description="Once shoppers visit your store, events will show up here." />
          )}
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Conversion Funnel</h2>
          <div className="space-y-4">
            {funnelSteps.map((step) => (
              <div key={step.label}>
                <div className="flex items-center justify-between text-sm mb-1.5">
                  <span className="flex items-center gap-2 text-slate-600">
                    <step.icon className="w-4 h-4 text-slate-400" aria-hidden />
                    {step.label}
                  </span>
                  <span className="font-semibold text-slate-900">{step.value.toLocaleString()}</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full ${step.color} rounded-full`} style={{ width: `${(step.value / maxStep) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-900">Product Performance</h2>
          <p className="text-sm text-slate-500">Views, cart adds and sales in this period.</p>
        </div>
        {topProducts.length === 0 ? (
          <EmptyState title="No product data yet" description="Add products and share your store to start collecting data." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Product</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Views</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Cart Adds</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Sold</th>
                  <th className="text-right px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {topProducts.map((p) => (
                  <tr key={p.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-slate-100 overflow-hidden relative flex-shrink-0">
                          {p.image ? (
                            <Image src={p.image} alt={p.name} fill sizes="36px" className="object-cover" unoptimized />
                          ) : (
                            <Package className="w-4 h-4 text-slate-400 absolute inset-0 m-auto" aria-hidden />
                          )}
                        </div>
                        <span className="text-sm font-medium text-slate-800 truncate max-w-[220px]">{p.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600 text-right">{p.views}</td>
                    <td className="px-4 py-3 text-sm text-slate-600 text-right">{p.cart_adds}</td>
                    <td className="px-4 py-3 text-sm text-slate-600 text-right">{p.sold}</td>
                    <td className="px-6 py-3 text-sm font-semibold text-slate-900 text-right">
                      {formatMoney(p.revenue, store.currency)}
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
