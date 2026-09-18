import { Package, Eye, ShoppingBag, MessageCircle, TrendingUp, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import CopyStoreLink from '@/components/dashboard/CopyStoreLink';

const STATS = [
  { label: 'Total Products', value: '24', icon: Package, change: '+3 this week', color: 'bg-blue-100 text-blue-600' },
  { label: 'Store Views', value: '1,234', icon: Eye, change: '+12% vs last week', color: 'bg-emerald-100 text-emerald-600' },
  { label: 'Cart Additions', value: '89', icon: ShoppingBag, change: '+8% vs last week', color: 'bg-purple-100 text-purple-600' },
  { label: 'WhatsApp Orders', value: '34', icon: MessageCircle, change: '+15% vs last week', color: 'bg-amber-100 text-amber-600' },
];

const SETUP_CHECKLIST = [
  { step: 'Add your store logo', done: true },
  { step: 'Choose a theme', done: true },
  { step: 'Add at least 5 products', done: false },
  { step: 'Share your catalog link', done: false },
];

export default function DashboardPage() {
  return (
    <div className="pt-16 md:pt-0">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Welcome back! 👋</h1>
          <p className="text-slate-600 mt-1">Here&apos;s what&apos;s happening with your store today.</p>
        </div>
        <Link
          href="/my-store"
          className="hidden md:inline-flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-lg transition-colors"
        >
          <ExternalLink className="w-4 h-4" aria-hidden />
          View Store
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {STATS.map((stat) => (
          <div key={stat.label} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-10 h-10 ${stat.color} rounded-lg flex items-center justify-center`}>
                <stat.icon className="w-5 h-5" aria-hidden />
              </div>
              <TrendingUp className="w-4 h-4 text-emerald-500" aria-hidden />
            </div>
            <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
            <p className="text-sm text-slate-500">{stat.label}</p>
            <p className="text-xs text-emerald-600 mt-1">{stat.change}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Setup Checklist */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Setup Checklist</h2>
          <div className="space-y-3">
            {SETUP_CHECKLIST.map((item) => (
              <div key={item.step} className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center ${item.done ? 'bg-emerald-500' : 'bg-slate-200'}`} aria-hidden>
                  {item.done && (
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <span className={`text-sm ${item.done ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                  {item.step}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">Progress</span>
              <span className="font-semibold text-slate-900">50%</span>
            </div>
            <div className="mt-2 h-2 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full" style={{ width: '50%' }}></div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Link href="/dashboard/products" className="block p-3 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors">
              <p className="font-medium text-slate-900">Add Product</p>
              <p className="text-sm text-slate-500">Add a new item to your catalog</p>
            </Link>
            <Link href="/dashboard/theme" className="block p-3 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors">
              <p className="font-medium text-slate-900">Customize Theme</p>
              <p className="text-sm text-slate-500">Change colors and appearance</p>
            </Link>
            <Link href="/dashboard/onboarding" className="block p-3 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors">
              <p className="font-medium text-slate-900">Complete Setup Wizard</p>
              <p className="text-sm text-slate-500">Walk through store setup in 3 steps</p>
            </Link>
          </div>
        </div>

        {/* Store Link */}
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-6 rounded-2xl text-white shadow-lg shadow-emerald-500/30">
          <h2 className="text-lg font-bold mb-2">Your Store Link</h2>
          <p className="text-emerald-100 text-sm mb-4">
            Share this link on WhatsApp, Instagram, and social media
          </p>
          <CopyStoreLink />
        </div>
      </div>
    </div>
  );
}