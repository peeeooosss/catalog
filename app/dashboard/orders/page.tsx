import { requireStore } from '@/lib/auth';
import { getOrdersWithItems } from '@/lib/db';
import OrdersBoard from '@/components/dashboard/OrdersBoard';

export const dynamic = 'force-dynamic';

export default async function OrdersPage() {
  const { store } = await requireStore();
  const orders = await getOrdersWithItems(store.id, { limit: 100 });

  return (
    <div className="pt-16 md:pt-0">
      <OrdersBoard orders={orders} currency={store.currency} />
    </div>
  );
}
