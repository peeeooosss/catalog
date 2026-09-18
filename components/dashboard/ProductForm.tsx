'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useFormState } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { toast } from 'sonner';
import { Plus, Trash2, Layers } from 'lucide-react';
import SubmitButton from '@/components/auth/SubmitButton';
import ImageUploader from '@/components/dashboard/ImageUploader';
import type { Category, Product } from '@/types';
import type { ActionState } from '@/lib/actions/auth';
import { createProductAction, updateProductAction } from '@/lib/actions/products';

interface VariantRow {
  label: string;
  price: string;
  compare_at_price: string;
  stock: string;
}

const inputClass =
  'w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-sm';
const labelClass = 'block text-sm font-medium text-slate-700 mb-2';

export default function ProductForm({
  product,
  categories,
  redirectOnSuccess,
}: {
  product?: Product;
  categories: Category[];
  redirectOnSuccess?: string;
}) {
  const router = useRouter();
  const action = product ? updateProductAction : createProductAction;
  const [state, formAction] = useFormState<ActionState, FormData>(action, {});

  const [image, setImage] = useState(product?.image ?? '');
  const [status, setStatus] = useState<Product['status']>(product?.status ?? 'active');
  const [variants, setVariants] = useState<VariantRow[]>(
    (product?.variants ?? []).map((v) => ({
      label: v.label,
      price: v.price != null ? String(v.price) : '',
      compare_at_price: v.compare_at_price != null ? String(v.compare_at_price) : '',
      stock: String(v.stock ?? 0),
    }))
  );
  const [showVariants, setShowVariants] = useState((product?.variants?.length ?? 0) > 0);

  useEffect(() => {
    if (state.success) {
      toast.success(state.success);
      if (redirectOnSuccess) {
        router.push(redirectOnSuccess);
        router.refresh();
      } else {
        router.refresh();
      }
    } else if (state.error) {
      toast.error(state.error);
    }
  }, [state, router, redirectOnSuccess]);

  const variantsJson = JSON.stringify(
    variants
      .filter((v) => v.label.trim())
      .map((v) => ({
        label: v.label.trim(),
        price: v.price === '' ? null : Number(v.price),
        compare_at_price: v.compare_at_price === '' ? null : Number(v.compare_at_price),
        stock: Number(v.stock || 0),
      }))
  );

  return (
    <form action={formAction} className="space-y-6">
      {product && <input type="hidden" name="id" value={product.id} />}
      <input type="hidden" name="image" value={image} />
      <input type="hidden" name="variants" value={variantsJson} />

      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-5">
        <div>
          <label htmlFor="name" className={labelClass}>
            Product Name <span className="text-rose-500">*</span>
          </label>
          <input id="name" name="name" defaultValue={product?.name} required placeholder="e.g. Fresh Tomatoes 1kg" className={inputClass} />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="category_id" className={labelClass}>
              Category
            </label>
            <select id="category_id" name="category_id" defaultValue={product?.category_id || ''} className={`${inputClass} bg-white`}>
              <option value="">Uncategorized</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.icon ? `${c.icon} ` : ''}
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="unit" className={labelClass}>
              Unit
            </label>
            <input id="unit" name="unit" defaultValue={product?.unit ?? ''} placeholder="e.g. 1 kg, per dozen, per pc" className={inputClass} />
          </div>
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          <div>
            <label htmlFor="price" className={labelClass}>
              Selling Price <span className="text-rose-500">*</span>
            </label>
            <input id="price" name="price" type="number" min="0" step="0.01" required defaultValue={product?.price} placeholder="0.00" className={inputClass} />
          </div>
          <div>
            <label htmlFor="compare_at_price" className={labelClass}>
              MRP (compare)
            </label>
            <input id="compare_at_price" name="compare_at_price" type="number" min="0" step="0.01" defaultValue={product?.compare_at_price ?? ''} placeholder="Optional" className={inputClass} />
          </div>
          <div>
            <label htmlFor="stock" className={labelClass}>
              Stock
            </label>
            <input id="stock" name="stock" type="number" min="0" step="1" defaultValue={product?.stock ?? 10} className={inputClass} />
          </div>
        </div>

        <div>
          <label htmlFor="status" className={labelClass}>
            Status
          </label>
          <select
            id="status"
            name="status"
            value={status}
            onChange={(e) => setStatus(e.target.value as Product['status'])}
            className={`${inputClass} bg-white`}
          >
            <option value="active">Active — visible in store</option>
            <option value="out_of_stock">Out of stock</option>
            <option value="draft">Draft — hidden</option>
          </select>
        </div>

        <div>
          <label htmlFor="description" className={labelClass}>
            Description
          </label>
          <textarea id="description" name="description" rows={3} defaultValue={product?.description} placeholder="Short description customers will see" className={`${inputClass} resize-none`} />
        </div>

        <ImageUploader value={image} onChange={setImage} />
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-slate-500" aria-hidden />
            <div>
              <h2 className="font-bold text-slate-900">Variants</h2>
              <p className="text-xs text-slate-500">Optional — sizes, colors, weights, packs</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowVariants((s) => !s)}
            className="text-sm font-medium text-emerald-600 hover:text-emerald-700"
          >
            {showVariants ? 'Hide' : 'Add variants'}
          </button>
        </div>

        <AnimatePresence>
          {showVariants && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-3 overflow-hidden">
              {variants.map((v, i) => (
                <div key={i} className="grid grid-cols-12 gap-2 items-center">
                  <input
                    value={v.label}
                    onChange={(e) => setVariants(variants.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)))}
                    placeholder="Label e.g. Size M"
                    className="col-span-12 sm:col-span-4 px-3 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <input
                    value={v.price}
                    onChange={(e) => setVariants(variants.map((x, j) => (j === i ? { ...x, price: e.target.value } : x)))}
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Price"
                    className="col-span-4 sm:col-span-3 px-3 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <input
                    value={v.compare_at_price}
                    onChange={(e) => setVariants(variants.map((x, j) => (j === i ? { ...x, compare_at_price: e.target.value } : x)))}
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="MRP"
                    className="col-span-4 sm:col-span-2 px-3 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <input
                    value={v.stock}
                    onChange={(e) => setVariants(variants.map((x, j) => (j === i ? { ...x, stock: e.target.value } : x)))}
                    type="number"
                    min="0"
                    placeholder="Stock"
                    className="col-span-3 sm:col-span-2 px-3 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={() => setVariants(variants.filter((_, j) => j !== i))}
                    className="col-span-1 p-2 text-slate-400 hover:text-rose-500 rounded-lg"
                    aria-label="Remove variant"
                  >
                    <Trash2 className="w-4 h-4" aria-hidden />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => setVariants([...variants, { label: '', price: '', compare_at_price: '', stock: '' }])}
                className="inline-flex items-center gap-2 px-4 py-2 border-2 border-dashed border-slate-200 hover:border-emerald-300 hover:bg-emerald-50 text-slate-600 text-sm font-medium rounded-xl transition-colors"
              >
                <Plus className="w-4 h-4" aria-hidden />
                Add variant row
              </button>
              <p className="text-xs text-slate-400">Leave price empty to use the product price.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex gap-3">
        <SubmitButton className="flex-1 py-3.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-70 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/20 transition-all active:scale-[0.98]">
          {product ? 'Save Changes' : 'Add Product'}
        </SubmitButton>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-3.5 bg-white border-2 border-slate-200 hover:border-slate-300 text-slate-700 font-bold rounded-xl transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
