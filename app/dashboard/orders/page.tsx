import { requireStore } from '@/lib/auth';
import { getOrdersWithItems } from '@/lib/db';
import OrdersBoard from '@/components/dashboard/OrdersBoard';

export const dynamic = 'force-dynamic';

export default async function OrdersPage() {
  const { store } = await requireStore();
  const orders = await getOrdersWithItems(store.id, { limit: 100 });
  const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').replace(/\/$/, '');
  const storeUrl = `${baseUrl}/store/${store.id}`;

  return (
    <div className="pt-16 md:pt-0">
      <OrdersBoard
        orders={orders}
        currency={store.currency}
        storeName={store.business_name}
        storeOfferText={store.offer_active ? store.offer_text : null}
        storeUrl={storeUrl}
      />
    </div>
  );
}
