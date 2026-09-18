import { requireStore } from '@/lib/auth';
import { getCustomers } from '@/lib/db';
import CustomersTable from '@/components/dashboard/CustomersTable';

export const dynamic = 'force-dynamic';

export default async function CustomersPage() {
  const { store } = await requireStore();
  const customers = await getCustomers(store.id);

  return (
    <div className="pt-16 md:pt-0">
      <CustomersTable customers={customers} currency={store.currency} />
    </div>
  );
}
