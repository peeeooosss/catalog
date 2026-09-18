import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { requireStore } from '@/lib/auth';
import { getCategories, getProductById } from '@/lib/db';
import ProductForm from '@/components/dashboard/ProductForm';

export const dynamic = 'force-dynamic';

export default async function EditProductPage({ params }: { params: { id: string } }) {
  const { store } = await requireStore();
  const id = Number(params.id);
  if (!Number.isFinite(id)) notFound();

  const [product, categories] = await Promise.all([
    getProductById(store.id, id),
    getCategories(store.id),
  ]);
  if (!product) notFound();

  return (
    <div className="pt-16 md:pt-0 max-w-3xl">
      <Link href="/dashboard/products" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 mb-4">
        <ArrowLeft className="w-4 h-4" aria-hidden />
        Back to products
      </Link>
      <h1 className="text-2xl font-bold text-slate-900 mb-1">Edit Product</h1>
      <p className="text-slate-600 mb-6">{product.name}</p>
      <ProductForm product={product} categories={categories ?? []} redirectOnSuccess="/dashboard/products" />
    </div>
  );
}
