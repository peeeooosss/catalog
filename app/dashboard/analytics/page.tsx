import { Eye, ShoppingBag, MessageCircle, TrendingUp, PackageCheck } from 'lucide-react';
import AnalyticsChart from '@/components/dashboard/AnalyticsChart';
import { getAnalytics } from '@/lib/db';
import { MOCK_ANALYTICS, MOCK_ANALYTICS_TOTALS } from '@/lib/mock';

export const dynamic = 'force-dynamic';

export default async function AnalyticsPage() {
  const dbData = await getAnalytics('lumiere-boutique');
  const data = dbData ?? MOCK_ANALYTICS;

  const totals = {
    views: data.reduce((s, d) => s + d.views, 0),
    carts: data.reduce((s, d) => s + d.carts, 0),
    clicks: data.reduce((s, d) => s + d.clicks, 0),
  };

  const summaryCards = [
    { label: 'Store Views', value: totals.views.toLocaleString(), icon: Eye, color: 'bg-emerald-100 text-emerald-600', change: '+12% vs last week' },
    { label: 'Cart Additions', value: totals.carts.toLocaleString(), icon: ShoppingBag, color: 'bg-purple-100 text-purple-600', change: '+8% vs last week' },
    { label: 'WhatsApp Clicks', value: totals.clicks.toLocaleString(), icon: MessageCircle, color: 'bg-amber-100 text-amber-600', change: '+15% vs last week' },
    { label: 'Est. Orders', value: MOCK_ANALYTICS_TOTALS.orders.toLocaleString(), icon: PackageCheck, color: 'bg-blue-100 text-blue-600', change: '+10% vs last week' },
  ];

  return (
    <div className="pt-16 md:pt-0">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Analytics</h1>
        <p className="text-slate-600 mt-1">
          Track how customers find and engage with your catalog
          {dbData ? ' — live data from your database' : ' — sample data (connect DATABASE_URL for live stats)'}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {summaryCards.map((card) => (
          <div key={card.label} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-10 h-10 ${card.color} rounded-lg flex items-center justify-center`}>
                <card.icon className="w-5 h-5" aria-hidden />
              </div>
              <TrendingUp className="w-4 h-4 text-emerald-500" aria-hidden />
            </div>
            <p className="text-2xl font-bold text-slate-900">{card.value}</p>
            <p className="text-sm text-slate-500">{card.label}</p>
            <p className="text-xs text-emerald-600 mt-1">{card.change}</p>
          </div>
        ))}
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Last 7 Days</h2>
            <p className="text-sm text-slate-500">Views, cart additions and WhatsApp clicks</p>
          </div>
          <span className="text-xs text-slate-500 bg-slate-100 px-3 py-1 rounded-full">Updated live</span>
        </div>
        <AnalyticsChart data={data} />
      </div>
    </div>
  );
}