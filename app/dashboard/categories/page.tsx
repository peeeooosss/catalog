import { requireStore } from '@/lib/auth';
import { getCategories, getProducts } from '@/lib/db';
import CategoryManager from '@/components/dashboard/CategoryManager';

export const dynamic = 'force-dynamic';

export default async function CategoriesPage() {
  const { store } = await requireStore();
  const [categories, products] = await Promise.all([getCategories(store.id), getProducts(store.id)]);

  const counts: Record<string, number> = {};
  for (const p of products ?? []) {
    if (p.category_id) counts[p.category_id] = (counts[p.category_id] ?? 0) + 1;
  }

  return (
    <div className="pt-16 md:pt-0 max-w-3xl">
      <CategoryManager categories={categories ?? []} counts={counts} />
    </div>
  );
}
