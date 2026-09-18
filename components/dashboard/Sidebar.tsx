'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
  LayoutDashboard,
  Package,
  Palette,
  Settings,
  BarChart3,
  ExternalLink,
  ShoppingBag,
  X,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/products', label: 'Products', icon: Package },
  { href: '/dashboard/theme', label: 'Theme', icon: Palette },
  { href: '/dashboard/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/dashboard/onboarding', label: 'Get Started', icon: Settings },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-white border-b border-slate-200 z-40 px-4 py-3 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2" aria-label="CatalogPro dashboard home">
          <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
            <ShoppingBag className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-slate-900">CatalogPro</span>
        </Link>
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
          aria-label={isMobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={isMobileOpen}
        >
          {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMobileOpen(false)}
          aria-hidden
        >
          <nav
            className="w-64 bg-white h-full p-4 pt-16 shadow-xl"
            onClick={(e) => e.stopPropagation()}
            aria-label="Dashboard navigation"
          >
            <div className="space-y-1">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors',
                    pathname === item.href
                      ? 'bg-emerald-50 text-emerald-700 font-medium'
                      : 'text-slate-600 hover:bg-slate-50'
                  )}
                >
                  <item.icon className="w-5 h-5" aria-hidden />
                  {item.label}
                </Link>
              ))}
              <Link
                href="/my-store"
                onClick={() => setIsMobileOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors"
              >
                <ExternalLink className="w-5 h-5" aria-hidden />
                View My Store
              </Link>
            </div>
          </nav>
        </div>
      )}

      {/* Desktop / Tablet Sidebar */}
      <aside
        className={cn(
          'hidden md:flex flex-col fixed left-0 top-0 bottom-0 bg-white border-r border-slate-200 z-30 transition-all duration-300',
          collapsed ? 'w-20' : 'w-64'
        )}
        aria-label="Dashboard sidebar"
      >
        <div className={cn('p-6 flex items-center', collapsed ? 'justify-center p-4' : 'gap-2')}>
          <Link href="/dashboard" className="flex items-center gap-2" aria-label="CatalogPro home">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <ShoppingBag className="w-4 h-4 text-white" />
            </div>
            {!collapsed && <span className="text-lg font-bold text-slate-900">CatalogPro</span>}
          </Link>
        </div>

        <nav className="flex-1 px-3 space-y-1">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={cn(
                'flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors',
                collapsed && 'justify-center px-2',
                pathname === item.href
                  ? 'bg-emerald-50 text-emerald-700 font-medium'
                  : 'text-slate-600 hover:bg-slate-50'
              )}
            >
              <item.icon className={cn('w-5 h-5 flex-shrink-0', pathname === item.href ? 'text-emerald-600' : 'text-slate-400')} aria-hidden />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          ))}
        </nav>

        <div className="p-3 border-t border-slate-100 space-y-1">
          <button
            onClick={onToggle}
            className={cn(
              'w-full flex items-center gap-3 px-4 py-2.5 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors',
              collapsed && 'justify-center px-2'
            )}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <PanelLeftOpen className="w-5 h-5" aria-hidden /> : <PanelLeftClose className="w-5 h-5" aria-hidden />}
            {!collapsed && <span className="text-sm font-medium">Collapse Menu</span>}
          </button>
          <Link
            href="/my-store"
            title={collapsed ? 'View My Store' : undefined}
            className={cn(
              'flex items-center gap-3 px-4 py-2.5 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors',
              collapsed && 'justify-center px-2'
            )}
          >
            <ExternalLink className="w-5 h-5 flex-shrink-0" aria-hidden />
            {!collapsed && <span className="text-sm">View My Store</span>}
          </Link>
        </div>
      </aside>
    </>
  );
}