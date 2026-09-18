import { requireAdmin } from '@/lib/auth';
import { getAllOrders } from '@/lib/db';
import AdminOrdersTable from '@/components/admin/AdminOrdersTable';

export const dynamic = 'force-dynamic';

export default async function AdminOrdersPage() {
  await requireAdmin();
  const orders = await getAllOrders({ limit: 300 });
  return <AdminOrdersTable orders={orders} />;
}