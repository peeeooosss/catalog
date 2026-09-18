import { requireAdmin } from '@/lib/auth';
import { getAllCustomers } from '@/lib/db';
import AdminCustomersTable from '@/components/admin/AdminCustomersTable';

export const dynamic = 'force-dynamic';

export default async function AdminCustomersPage() {
  await requireAdmin();
  const customers = await getAllCustomers();
  return <AdminCustomersTable customers={customers} />;
}