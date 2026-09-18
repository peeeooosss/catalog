import DashboardShell from '@/components/dashboard/DashboardShell';
import { requireSeller } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, store } = await requireSeller();

  return (
    <DashboardShell
      storeName={store?.business_name ?? null}
      storeSlug={store?.id ?? null}
      userName={user.name}
    >
      {children}
    </DashboardShell>
  );
}
