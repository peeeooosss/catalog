import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { requireStore } from '@/lib/auth';
import { getCategories } from '@/lib/db';
import ProductForm from '@/components/dashboard/ProductForm';

export const dynamic = 'force-dynamic';

export default async function NewProductPage() {
  const { store } = await requireStore();
  const categories = (await getCategories(store.id)) ?? [];

  return (
    <div className="pt-16 md:pt-0 max-w-3xl">
      <Link href="/dashboard/products" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 mb-4">
        <ArrowLeft className="w-4 h-4" aria-hidden />
        Back to products
      </Link>
      <h1 className="text-2xl font-bold text-slate-900 mb-1">Add Product</h1>
      <p className="text-slate-600 mb-6">Fill in the details below to add an item to your catalog.</p>
      <ProductForm categories={categories} redirectOnSuccess="/dashboard/products" />
    </div>
  );
}
