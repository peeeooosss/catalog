'use client';
import { useState } from 'react';
import Sidebar from '@/components/dashboard/Sidebar';
import { cn } from '@/lib/utils';

export default function DashboardShell({
  children,
  storeName,
  storeSlug,
  userName,
}: {
  children: React.ReactNode;
  storeName: string | null;
  storeSlug: string | null;
  userName: string;
}) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="app-shell relative flex min-h-screen">
      <div className="pointer-events-none fixed inset-0 z-0" aria-hidden>
        <div className="absolute -left-40 top-24 h-96 w-96 rounded-full bg-emerald-200/30 blur-3xl" />
        <div className="absolute -right-40 top-1/3 h-96 w-96 rounded-full bg-sky-200/25 blur-3xl" />
      </div>
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed((value) => !value)}
        storeName={storeName}
        storeSlug={storeSlug}
        userName={userName}
      />
      <main
        className={cn(
          'relative z-10 min-w-0 flex-1 transition-[padding] duration-300',
          collapsed ? 'md:pl-20' : 'md:pl-64'
        )}
      >
        <div className="mx-auto w-full max-w-[1600px] p-4 sm:p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
