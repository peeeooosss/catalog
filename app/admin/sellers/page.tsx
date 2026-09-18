import { requireAdmin } from '@/lib/auth';
import { getAllSellers } from '@/lib/db';
import AdminSellersTable from '@/components/admin/AdminSellersTable';

export const dynamic = 'force-dynamic';

export default async function AdminSellersPage() {
  await requireAdmin();
  const sellers = await getAllSellers();
  return <AdminSellersTable sellers={sellers} />;
}