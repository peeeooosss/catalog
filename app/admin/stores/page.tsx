import { requireAdmin } from '@/lib/auth';
import { getAllStores } from '@/lib/db';
import AdminStoresTable from '@/components/admin/AdminStoresTable';

export const dynamic = 'force-dynamic';

export default async function AdminStoresPage() {
  await requireAdmin();
  const stores = await getAllStores();
  return <AdminStoresTable stores={stores} />;
}