import { requireStore } from '@/lib/auth';
import { getCategories, getProducts } from '@/lib/db';
import ProductsTable from '@/components/dashboard/ProductsTable';

export const dynamic = 'force-dynamic';

export default async function ProductsPage() {
  const { store } = await requireStore();
  const [products, categories] = await Promise.all([getProducts(store.id), getCategories(store.id)]);

  return (
    <div className="pt-16 md:pt-0">
      <ProductsTable products={products ?? []} categories={categories ?? []} currency={store.currency} />
    </div>
  );
}
