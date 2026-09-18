'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { getSql } from '@/lib/db';
import { requireStore } from '@/lib/auth';
import { makeId } from '@/lib/utils';
import type { ActionState } from './auth';

const DEFAULT_IMAGE =
  'https://images.unsplash.com/photo-1560393464-5c69a73c5770?auto=format&fit=crop&w=500&q=80';

const STATUSES = ['active', 'draft', 'out_of_stock'] as const;

const productSchema = z.object({
  name: z.string().trim().min(1, 'Product name is required').max(120),
  category_id: z.string().trim().optional().nullable(),
  description: z.string().trim().max(600).optional().nullable(),
  price: z.coerce.number().min(0, 'Price must be 0 or more'),
  compare_at_price: z.coerce.number().min(0).optional().nullable(),
  stock: z.coerce.number().int().min(0).default(0),
  unit: z.string().trim().max(20).optional().nullable(),
  status: z.enum(STATUSES),
  image: z.string().trim().optional().nullable(),
});

interface VariantInput {
  id?: number;
  label: string;
  price: number | null;
  compare_at_price: number | null;
  stock: number;
}

function parseVariants(raw: FormDataEntryValue | null): VariantInput[] {
  if (typeof raw !== 'string' || !raw.trim()) return [];
  try {
    const arr = JSON.parse(raw) as Array<Record<string, unknown>>;
    if (!Array.isArray(arr)) return [];
    return arr
      .map((v) => ({
        label: String(v.label ?? '').trim(),
        price: v.price === '' || v.price == null ? null : Number(v.price),
        compare_at_price: v.compare_at_price === '' || v.compare_at_price == null ? null : Number(v.compare_at_price),
        stock: Number(v.stock ?? 0),
      }))
      .filter((v) => v.label.length > 0);
  } catch {
    return [];
  }
}

function readProductForm(formData: FormData) {
  return productSchema.safeParse({
    name: formData.get('name'),
    category_id: formData.get('category_id') || null,
    description: formData.get('description') || null,
    price: formData.get('price'),
    compare_at_price: formData.get('compare_at_price') || null,
    stock: formData.get('stock') || 0,
    unit: formData.get('unit') || null,
    status: formData.get('status') || 'active',
    image: formData.get('image') || null,
  });
}

async function replaceVariants(productId: number, variants: VariantInput[]) {
  const sql = getSql();
  if (!sql) return;
  await sql`DELETE FROM product_variants WHERE product_id = ${productId}`;
  let sort = 1;
  for (const v of variants) {
    await sql`
      INSERT INTO product_variants (product_id, label, price, compare_at_price, stock, sort_order)
      VALUES (${productId}, ${v.label}, ${v.price}, ${v.compare_at_price}, ${v.stock}, ${sort})`;
    sort++;
  }
}

export async function createProductAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { store } = await requireStore();
  const sql = getSql();
  if (!sql) return { error: 'Database is not configured.' };

  const parsed = readProductForm(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Invalid product' };
  const d = parsed.data;

  try {
    const rows = (await sql`
      INSERT INTO products (tenant_id, category_id, name, description, price, compare_at_price, image, stock, unit, status)
      VALUES (
        ${store.id}, ${d.category_id || null}, ${d.name}, ${d.description}, ${d.price},
        ${d.compare_at_price ?? null}, ${d.image || DEFAULT_IMAGE}, ${d.stock}, ${d.unit}, ${d.status}
      )
      RETURNING id
    `) as Array<Record<string, unknown>>;
    const productId = Number(rows[0].id);
    await replaceVariants(productId, parseVariants(formData.get('variants')));
  } catch (error) {
    console.error('createProduct failed', error);
    return { error: 'Could not save the product.' };
  }

  revalidatePath('/dashboard/products');
  revalidatePath(`/store/${store.id}`);
  return { success: `“${d.name}” added to your catalog.` };
}

export async function updateProductAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { store } = await requireStore();
  const sql = getSql();
  if (!sql) return { error: 'Database is not configured.' };

  const id = Number(formData.get('id'));
  if (!id) return { error: 'Missing product.' };
  const parsed = readProductForm(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Invalid product' };
  const d = parsed.data;

  try {
    const rows = (await sql`
      UPDATE products SET
        category_id = ${d.category_id || null},
        name = ${d.name},
        description = ${d.description},
        price = ${d.price},
        compare_at_price = ${d.compare_at_price ?? null},
        image = ${d.image || DEFAULT_IMAGE},
        stock = ${d.stock},
        unit = ${d.unit},
        status = ${d.status},
        updated_at = now()
      WHERE id = ${id} AND tenant_id = ${store.id}
      RETURNING id
    `) as Array<Record<string, unknown>>;
    if (!rows.length) return { error: 'Product not found.' };
    await replaceVariants(id, parseVariants(formData.get('variants')));
  } catch (error) {
    console.error('updateProduct failed', error);
    return { error: 'Could not update the product.' };
  }

  revalidatePath('/dashboard/products');
  revalidatePath(`/store/${store.id}`);
  return { success: 'Product updated.' };
}

export async function deleteProductAction(formData: FormData) {
  const { store } = await requireStore();
  const sql = getSql();
  if (!sql) return;
  const id = Number(formData.get('id'));
  if (!id) return;
  await sql`DELETE FROM products WHERE id = ${id} AND tenant_id = ${store.id}`;
  revalidatePath('/dashboard/products');
  revalidatePath(`/store/${store.id}`);
}

export async function setProductStatusAction(formData: FormData) {
  const { store } = await requireStore();
  const sql = getSql();
  if (!sql) return;
  const id = Number(formData.get('id'));
  const status = String(formData.get('status') ?? 'active');
  if (!id || !STATUSES.includes(status as (typeof STATUSES)[number])) return;
  await sql`
    UPDATE products SET status = ${status}, updated_at = now()
    WHERE id = ${id} AND tenant_id = ${store.id}`;
  revalidatePath('/dashboard/products');
  revalidatePath(`/store/${store.id}`);
}

export async function bulkDiscountAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { store } = await requireStore();
  const sql = getSql();
  if (!sql) return { error: 'Database is not configured.' };

  const percent = Number(formData.get('percent') ?? 0);
  const categoryId = String(formData.get('category_id') ?? 'all');
  const offerText = String(formData.get('offer_text') ?? '').trim();

  if (percent < 0 || percent >= 90) return { error: 'Enter a discount between 1 and 89%.' };

  try {
    if (percent > 0) {
      await sql`
        UPDATE products SET compare_at_price = ROUND(price / (1 - ${percent}::numeric / 100), 2), updated_at = now()
        WHERE tenant_id = ${store.id}
          AND (${categoryId} = 'all' OR category_id = ${categoryId})`;
    }
    await sql`
      UPDATE tenants SET offer_text = ${offerText || null}, offer_active = ${offerText.length > 0}, updated_at = now()
      WHERE id = ${store.id}`;
  } catch (error) {
    console.error('bulkDiscount failed', error);
    return { error: 'Could not apply the discount.' };
  }

  revalidatePath('/dashboard/products');
  revalidatePath('/dashboard/settings');
  revalidatePath(`/store/${store.id}`);
  return { success: percent > 0 ? `Applied ${percent}% discount.` : 'Discounts cleared.' };
}

export async function importProductsAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { store } = await requireStore();
  const sql = getSql();
  if (!sql) return { error: 'Database is not configured.' };

  const raw = String(formData.get('csv') ?? '').trim();
  if (!raw) return { error: 'Paste some rows first.' };

  const lines = raw
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  if (!lines.length) return { error: 'No rows found.' };

  const first = lines[0].toLowerCase();
  const startIdx = first.includes('name') && (first.includes('price') || first.includes('category')) ? 1 : 0;

  const existingCats = (await sql`
    SELECT id, name FROM categories WHERE tenant_id = ${store.id}
  `) as Array<Record<string, unknown>>;
  const catMap = new Map(existingCats.map((c) => [String(c.name).toLowerCase(), String(c.id)]));
  let nextSort = existingCats.length + 1;

  let imported = 0;
  let skipped = 0;

  for (let i = startIdx; i < lines.length; i++) {
    const cols = lines[i].split(',').map((c) => c.trim());
    const [name, priceRaw, mrpRaw, categoryRaw, stockRaw, unitRaw, imageRaw] = cols;
    const price = Number(priceRaw);
    if (!name || !Number.isFinite(price)) {
      skipped++;
      continue;
    }
    let categoryId: string | null = null;
    const categoryName = (categoryRaw || '').trim();
    if (categoryName) {
      const key = categoryName.toLowerCase();
      if (!catMap.has(key)) {
        const id = makeId(categoryName);
        await sql`
          INSERT INTO categories (id, tenant_id, name, sort_order)
          VALUES (${id}, ${store.id}, ${categoryName}, ${nextSort})
          ON CONFLICT (tenant_id, lower(name)) DO NOTHING`;
        const rows = (await sql`
          SELECT id FROM categories WHERE tenant_id = ${store.id} AND lower(name) = ${key} LIMIT 1
        `) as Array<Record<string, unknown>>;
        if (rows.length) catMap.set(key, String(rows[0].id));
        nextSort++;
      }
      categoryId = catMap.get(key) ?? null;
    }
    const mrp = Number(mrpRaw);
    const stock = Number(stockRaw);
    await sql`
      INSERT INTO products (tenant_id, category_id, name, description, price, compare_at_price, image, stock, unit, status)
      VALUES (
        ${store.id}, ${categoryId}, ${name}, '', ${price},
        ${Number.isFinite(mrp) && mrp > price ? mrp : null},
        ${imageRaw || DEFAULT_IMAGE},
        ${Number.isFinite(stock) && stock >= 0 ? stock : 10},
        ${unitRaw || null},
        'active'
      )`;
    imported++;
  }

  revalidatePath('/dashboard/products');
  revalidatePath('/dashboard/categories');
  revalidatePath(`/store/${store.id}`);

  if (!imported) return { error: 'No valid rows found. Use: name, price, mrp, category, stock, unit, image' };
  return { success: `Imported ${imported} product${imported === 1 ? '' : 's'}${skipped ? ` (skipped ${skipped})` : ''}.` };
}
