'use client';
import { useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useFormState } from 'react-dom';
import { toast } from 'sonner';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Image as ImageIcon,
  Percent,
  Upload,
  PackageX,
  PackageCheck,
} from 'lucide-react';
import Modal from '@/components/ui/Modal';
import EmptyState from '@/components/ui/EmptyState';
import ConfirmSubmit from '@/components/ui/ConfirmSubmit';
import SubmitButton from '@/components/auth/SubmitButton';
import type { Category, Product } from '@/types';
import { formatMoney, discountPercent } from '@/lib/utils';
import { deleteProductAction, setProductStatusAction, bulkDiscountAction, importProductsAction } from '@/lib/actions/products';
import type { ActionState } from '@/lib/actions/auth';

const inputClass =
  'w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-sm';

export default function ProductsTable({
  products,
  categories,
  currency,
}: {
  products: Product[];
  categories: Category[];
  currency: string;
}) {
  const [query, setQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showDiscount, setShowDiscount] = useState(false);
  const [showImport, setShowImport] = useState(false);

  const [discountState, discountAction] = useFormState<ActionState, FormData>(bulkDiscountAction, {});
  const [importState, importAction] = useFormState<ActionState, FormData>(importProductsAction, {});

  useMemo(() => {
    if (discountState.success) toast.success(discountState.success);
    if (discountState.error) toast.error(discountState.error);
    return null;
  }, [discountState]);

  useMemo(() => {
    if (importState.success) toast.success(importState.success);
    if (importState.error) toast.error(importState.error);
    return null;
  }, [importState]);

  const categoryName = (id: string) => categories.find((c) => c.id === id)?.name ?? 'Uncategorized';

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchesQuery = p.name.toLowerCase().includes(query.toLowerCase());
      const matchesCat = categoryFilter === 'all' || p.category_id === categoryFilter;
      return matchesQuery && matchesCat;
    });
  }, [products, query, categoryFilter]);

  return (
    <div>
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Products</h1>
          <p className="text-slate-600 mt-1">
            {products.length} product{products.length === 1 ? '' : 's'} in your catalog
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setShowDiscount(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border-2 border-slate-200 hover:border-slate-300 text-slate-700 font-medium rounded-lg transition-colors"
          >
            <Percent className="w-4 h-4" aria-hidden />
            Discounts
          </button>
          <button
            onClick={() => setShowImport(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border-2 border-slate-200 hover:border-slate-300 text-slate-700 font-medium rounded-lg transition-colors"
          >
            <Upload className="w-4 h-4" aria-hidden />
            Bulk Import
          </button>
          <Link
            href="/dashboard/products/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-lg transition-colors active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" aria-hidden />
            Add Product
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" aria-hidden />
            <input
              type="text"
              placeholder="Search products..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search products"
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-sm"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            aria-label="Filter by category"
            className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">All categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            title={products.length === 0 ? 'No products yet' : 'No products found'}
            description={
              products.length === 0
                ? 'Add your first product or bulk-import a list to get started.'
                : 'Try a different search or filter.'
            }
            action={
              products.length === 0 ? (
                <Link href="/dashboard/products/new" className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg font-medium">
                  <Plus className="w-4 h-4" aria-hidden /> Add Product
                </Link>
              ) : undefined
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Product</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase hidden md:table-cell">Category</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Price</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase hidden sm:table-cell">Stock</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase hidden lg:table-cell">Status</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((product) => {
                  const off = discountPercent(product.price, product.compare_at_price);
                  return (
                    <tr key={product.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center overflow-hidden relative flex-shrink-0">
                            {product.image ? (
                              <Image src={product.image} alt={product.name} fill sizes="40px" className="object-cover" unoptimized />
                            ) : (
                              <ImageIcon className="w-4 h-4 text-slate-400" aria-hidden />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-slate-900 text-sm truncate max-w-[200px]">{product.name}</p>
                            {product.variants && product.variants.length > 0 && (
                              <p className="text-xs text-slate-400">{product.variants.length} variants</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600 hidden md:table-cell">
                        {product.category_id ? categoryName(product.category_id) : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-slate-900">{formatMoney(product.price, currency)}</span>
                          {off > 0 && (
                            <>
                              <span className="text-xs text-slate-400 line-through">
                                {formatMoney(product.compare_at_price ?? 0, currency)}
                              </span>
                              <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded">
                                -{off}%
                              </span>
                            </>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm hidden sm:table-cell">
                        <span className={product.stock === 0 ? 'text-rose-600 font-semibold' : 'text-slate-600'}>
                          {product.stock ?? 0}
                        </span>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            product.status === 'active'
                              ? 'bg-emerald-100 text-emerald-700'
                              : product.status === 'draft'
                                ? 'bg-slate-100 text-slate-600'
                                : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {product.status === 'active' ? 'Active' : product.status === 'draft' ? 'Draft' : 'Out of stock'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <form action={setProductStatusAction}>
                            <input type="hidden" name="id" value={product.id} />
                            <input
                              type="hidden"
                              name="status"
                              value={product.status === 'active' ? 'out_of_stock' : 'active'}
                            />
                            <button
                              type="submit"
                              className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                              aria-label={product.status === 'active' ? `Mark ${product.name} out of stock` : `Activate ${product.name}`}
                              title={product.status === 'active' ? 'Mark out of stock' : 'Mark active'}
                            >
                              {product.status === 'active' ? (
                                <PackageX className="w-4 h-4" aria-hidden />
                              ) : (
                                <PackageCheck className="w-4 h-4" aria-hidden />
                              )}
                            </button>
                          </form>
                          <Link
                            href={`/dashboard/products/${product.id}/edit`}
                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                            aria-label={`Edit ${product.name}`}
                          >
                            <Edit2 className="w-4 h-4" aria-hidden />
                          </Link>
                          <form action={deleteProductAction}>
                            <input type="hidden" name="id" value={product.id} />
                            <ConfirmSubmit
                              message={`Delete "${product.name}"? This cannot be undone.`}
                              className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                              ariaLabel={`Delete ${product.name}`}
                            >
                              <Trash2 className="w-4 h-4" aria-hidden />
                            </ConfirmSubmit>
                          </form>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={showDiscount} onClose={() => setShowDiscount(false)} title="Apply a discount">
        <form action={discountAction} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Discount percentage</label>
            <input name="percent" type="number" min="0" max="89" defaultValue="20" className={inputClass} />
            <p className="text-xs text-slate-400 mt-1.5">
              We set the MRP so your selling price shows the discount. 0 clears all discounts.
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Apply to</label>
            <select name="category_id" className={`${inputClass} bg-white`}>
              <option value="all">All products</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Offer banner text</label>
            <input name="offer_text" placeholder="e.g. Flat 20% off this week!" className={inputClass} />
            <p className="text-xs text-slate-400 mt-1.5">Shown as a banner on top of your storefront.</p>
          </div>
          <SubmitButton className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-70 text-white font-bold rounded-xl flex items-center justify-center gap-2">
            Apply Discount
          </SubmitButton>
        </form>
      </Modal>

      <Modal open={showImport} onClose={() => setShowImport(false)} title="Bulk import products" maxWidth="max-w-2xl">
        <form action={importAction} className="space-y-4">
          <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-600">
            Paste one product per line: <span className="font-mono">name, price, mrp, category, stock, unit, image</span>
            <br />
            Example: <span className="font-mono">Basmati Rice 5kg, 24.99, 30, Staples, 20, 5kg pack,</span>
          </div>
          <textarea
            name="csv"
            rows={10}
            placeholder={'name, price, mrp, category, stock, unit, image\nBasmati Rice 5kg, 24.99, 30, Staples, 20, 5kg pack,'}
            className={`${inputClass} font-mono resize-none`}
          />
          <SubmitButton className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-70 text-white font-bold rounded-xl">
            Import Products
          </SubmitButton>
        </form>
      </Modal>
    </div>
  );
}
