'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
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
  ShoppingCart,
  ListTree,
  Users,
  Rocket,
  LogOut,
  Search,
  Command,
  Sparkles,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { logoutAction } from '@/lib/actions/auth';

type NavItem = { href: string; label: string; icon: LucideIcon };

const NAV_ITEMS: NavItem[] = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/products', label: 'Products', icon: Package },
  { href: '/dashboard/categories', label: 'Categories', icon: ListTree },
  { href: '/dashboard/orders', label: 'Orders', icon: ShoppingCart },
  { href: '/dashboard/customers', label: 'Customers', icon: Users },
  { href: '/dashboard/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/dashboard/theme', label: 'Theme', icon: Palette },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
  { href: '/dashboard/onboarding', label: 'Get Started', icon: Rocket },
];

const NAV_GROUPS: { label: string; items: NavItem[] }[] = [
  { label: 'Workspace', items: NAV_ITEMS.slice(0, 5) },
  { label: 'Insights', items: NAV_ITEMS.slice(5, 6) },
  { label: 'Storefront', items: NAV_ITEMS.slice(6) },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  storeName: string | null;
  storeSlug: string | null;
  userName: string;
}

export default function Sidebar({ collapsed, onToggle, storeName, storeSlug, userName }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const storeHref = storeSlug ? `/store/${storeSlug}` : '/dashboard/onboarding';

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setSearchOpen((value) => !value);
      }
      if (event.key === 'Escape') {
        setSearchOpen(false);
        setIsMobileOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const matches = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return query ? NAV_ITEMS.filter((item) => item.label.toLowerCase().includes(query)) : NAV_ITEMS;
  }, [searchQuery]);

  const goTo = (href: string) => {
    router.push(href);
    setSearchOpen(false);
    setSearchQuery('');
    setIsMobileOpen(false);
  };

  const NavList = ({ onNavigate }: { onNavigate?: () => void }) => (
    <div className="space-y-5">
      {NAV_GROUPS.map((group) => (
        <div key={group.label}>
          {!collapsed && (
            <p className="mb-2 px-4 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">{group.label}</p>
          )}
          <div className="space-y-1">
            {group.items.map((item) => {
              const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onNavigate}
                  title={collapsed ? item.label : undefined}
                  className={cn(
                    'group flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm transition-all',
                    collapsed && 'md:justify-center md:px-2',
                    active
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500 font-semibold text-white shadow-lg shadow-emerald-500/20'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  )}
                >
                  <item.icon
                    className={cn('h-[18px] w-[18px] flex-shrink-0', active ? 'text-white' : 'text-slate-400 group-hover:text-slate-600')}
                    aria-hidden
                  />
                  <span className={cn(collapsed && 'md:hidden')}>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <>
      <div className="fixed inset-x-0 top-0 z-40 flex items-center justify-between border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur-xl md:hidden">
        <Link href="/dashboard" className="flex min-w-0 items-center gap-2" aria-label="CatalogPro dashboard home">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500 shadow-sm">
            <ShoppingBag className="h-4 w-4 text-white" aria-hidden />
          </div>
          <span className="max-w-[150px] truncate font-bold text-slate-900">{storeName ?? 'CatalogPro'}</span>
        </Link>
        <button
          type="button"
          onClick={() => setIsMobileOpen((value) => !value)}
          className="rounded-xl p-2 transition-colors hover:bg-slate-100"
          aria-label={isMobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={isMobileOpen}
        >
          {isMobileOpen ? <X className="h-5 w-5" aria-hidden /> : <Menu className="h-5 w-5" aria-hidden />}
        </button>
      </div>

      {isMobileOpen && (
        <div className="fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-sm md:hidden" onClick={() => setIsMobileOpen(false)} aria-hidden>
          <nav
            className="flex h-full w-72 flex-col bg-white p-4 pt-20 shadow-lift"
            onClick={(event) => event.stopPropagation()}
            aria-label="Dashboard navigation"
          >
            <div className="flex-1 overflow-y-auto">
              <NavList onNavigate={() => setIsMobileOpen(false)} />
              <button
                type="button"
                onClick={() => {
                  setSearchOpen(true);
                  setIsMobileOpen(false);
                }}
                className="mt-4 flex w-full items-center gap-3 rounded-xl bg-slate-100 px-4 py-2.5 text-sm text-slate-600"
              >
                <Search className="h-[18px] w-[18px]" aria-hidden />
                Quick search
              </button>
              <Link
                href={storeHref}
                onClick={() => setIsMobileOpen(false)}
                className="mt-2 flex items-center gap-3 rounded-xl px-4 py-2.5 text-slate-600 transition-colors hover:bg-slate-100"
              >
                <ExternalLink className="h-[18px] w-[18px]" aria-hidden />
                View My Store
              </Link>
            </div>
            <form action={logoutAction} className="border-t border-slate-100 pt-4">
              <button type="submit" className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-rose-600 hover:bg-rose-50">
                <LogOut className="h-[18px] w-[18px]" aria-hidden />
                Sign Out
              </button>
            </form>
          </nav>
        </div>
      )}

      <aside
        className={cn(
          'fixed bottom-0 left-0 top-0 z-30 hidden flex-col border-r border-slate-200 bg-white/95 backdrop-blur-xl transition-all duration-300 md:flex',
          collapsed ? 'w-20' : 'w-64'
        )}
        aria-label="Dashboard sidebar"
      >
        <div className={cn('flex items-center', collapsed ? 'justify-center p-4' : 'gap-2 p-6')}>
          <Link href="/dashboard" className="flex min-w-0 items-center gap-2" aria-label="CatalogPro home">
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/25">
              <ShoppingBag className="h-4 w-4" aria-hidden />
            </div>
            {!collapsed && <span className="truncate text-base font-bold text-slate-900">{storeName ?? 'CatalogPro'}</span>}
          </Link>
        </div>

        {!collapsed && (
          <div className="px-3 pb-3">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="flex w-full items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500 transition-colors hover:border-slate-300 hover:bg-white"
            >
              <Search className="h-4 w-4" aria-hidden />
              <span>Quick search</span>
              <kbd className="ml-auto rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-semibold">
                <span className="inline-flex items-center gap-0.5"><Command className="h-2.5 w-2.5" aria-hidden />K</span>
              </kbd>
            </button>
          </div>
        )}

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 pb-4">
          <NavList />
        </nav>

        <div className="space-y-1 border-t border-slate-100 p-3">
          {!collapsed && (
            <div className="mb-2 rounded-xl bg-slate-50 p-3">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                </span>
                <p className="text-xs font-semibold text-slate-700">Store is live</p>
              </div>
              <p className="mt-1 truncate text-[11px] text-slate-400">{userName}</p>
            </div>
          )}
          <Link
            href={storeHref}
            title={collapsed ? 'View My Store' : undefined}
            className={cn(
              'flex items-center gap-3 rounded-xl px-4 py-2.5 text-slate-600 transition-colors hover:bg-slate-100',
              collapsed && 'justify-center px-2'
            )}
          >
            <ExternalLink className="h-[18px] w-[18px] flex-shrink-0" aria-hidden />
            {!collapsed && <span className="text-sm">View My Store</span>}
          </Link>
          <form action={logoutAction}>
            <button
              type="submit"
              title={collapsed ? 'Sign Out' : undefined}
              className={cn(
                'flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-rose-600 transition-colors hover:bg-rose-50',
                collapsed && 'justify-center px-2'
              )}
            >
              <LogOut className="h-[18px] w-[18px] flex-shrink-0" aria-hidden />
              {!collapsed && <span className="text-sm">Sign Out</span>}
            </button>
          </form>
          <button
            type="button"
            onClick={onToggle}
            className={cn(
              'flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-slate-500 transition-colors hover:bg-slate-100',
              collapsed && 'justify-center px-2'
            )}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <PanelLeftOpen className="h-[18px] w-[18px]" aria-hidden /> : <PanelLeftClose className="h-[18px] w-[18px]" aria-hidden />}
            {!collapsed && <span className="text-sm font-medium">Collapse Menu</span>}
          </button>
        </div>
      </aside>

      {searchOpen && (
        <div className="fixed inset-0 z-[60] flex items-start justify-center bg-slate-950/50 p-4 pt-16 backdrop-blur-sm" onClick={() => setSearchOpen(false)}>
          <div
            className="w-full max-w-lg overflow-hidden rounded-2xl border border-white/60 bg-white shadow-lift"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Quick search"
          >
            <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-3">
              <Search className="h-5 w-5 text-slate-400" aria-hidden />
              <input
                autoFocus
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && matches[0]) goTo(matches[0].href);
                }}
                placeholder="Search pages..."
                aria-label="Search pages"
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400"
              />
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="rounded-md border border-slate-200 px-2 py-1 text-[11px] font-semibold text-slate-500"
              >
                ESC
              </button>
            </div>
            <div className="max-h-80 overflow-y-auto p-2">
              {matches.length === 0 ? (
                <p className="px-3 py-8 text-center text-sm text-slate-500">No matching pages.</p>
              ) : (
                matches.map((item) => (
                  <button
                    key={item.href}
                    type="button"
                    onClick={() => goTo(item.href)}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-slate-700 transition-colors hover:bg-emerald-50 hover:text-emerald-700"
                  >
                    <item.icon className="h-4 w-4 text-slate-400" aria-hidden />
                    {item.label}
                  </button>
                ))
              )}
            </div>
            <div className="flex items-center gap-2 border-t border-slate-100 px-4 py-2.5 text-[11px] text-slate-400">
              <Sparkles className="h-3.5 w-3.5" aria-hidden />
              Jump anywhere in your dashboard
            </div>
          </div>
        </div>
      )}
    </>
  );
}
