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
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed((c) => !c)}
        storeName={storeName}
        storeSlug={storeSlug}
        userName={userName}
      />
      <main
        className={cn(
          'flex-1 min-w-0 transition-[margin] duration-300',
          collapsed ? 'md:ml-20' : 'md:ml-64'
        )}
      >
        <div className="p-4 sm:p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
