'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { getSql } from '@/lib/db';
import { requireStore } from '@/lib/auth';
import { isUploadThingUrl, makeId, normalizeProductImages, parseCsvRows } from '@/lib/utils';
import type { ActionState } from './auth';

const DEFAULT_IMAGE =
  'https://images.unsplash.com/photo-1560393464-5c69a73c5770?auto=format&fit=crop&w=500&q=80';

const STATUSES = ['active', 'draft', 'out_of_stock'] as const;

function readStoredImages(value: unknown, primary: unknown): string[] {
  const images = normalizeProductImages(value);
  if (images.length) return images;
  const fallback = String(primary ?? '').trim();
  return fallback ? [fallback] : [];
}

function sanitizeProductImages(raw: unknown, existing: string[] = []): string[] {
  return normalizeProductImages(raw)
    .filter((url) => isUploadThingUrl(url) || existing.includes(url) || url === DEFAULT_IMAGE)
    .slice(0, 3);
}

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
  images: z.array(z.string().trim()).max(3).optional().default([]),
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
    images: normalizeProductImages(formData.get('images')),
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
  const images = sanitizeProductImages(d.images);
  const primaryImage = images[0] || d.image || DEFAULT_IMAGE;

  try {
    const rows = (await sql`
      INSERT INTO products (tenant_id, category_id, name, description, price, compare_at_price, image, images, stock, unit, status)
      VALUES (
        ${store.id}, ${d.category_id || null}, ${d.name}, ${d.description}, ${d.price},
        ${d.compare_at_price ?? null}, ${primaryImage}, ${JSON.stringify(images)}::jsonb,
        ${d.stock}, ${d.unit}, ${d.status}
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
    const existingRows = (await sql`
      SELECT image, images FROM products WHERE id = ${id} AND tenant_id = ${store.id} LIMIT 1
    `) as Array<Record<string, unknown>>;
    if (!existingRows.length) return { error: 'Product not found.' };

    const existingImages = readStoredImages(existingRows[0].images, existingRows[0].image);
    const images = sanitizeProductImages(d.images, existingImages);
    const primaryImage = images[0] || d.image || DEFAULT_IMAGE;

    const rows = (await sql`
      UPDATE products SET
        category_id = ${d.category_id || null},
        name = ${d.name},
        description = ${d.description},
        price = ${d.price},
        compare_at_price = ${d.compare_at_price ?? null},
        image = ${primaryImage},
        images = ${JSON.stringify(images)}::jsonb,
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
  if (!raw) return { error: 'Choose a product details file or paste some rows first.' };

  const rows = parseCsvRows(raw);
  if (!rows.length) return { error: 'No rows found.' };

  const normalizeHeader = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, '');
  const header = rows[0].map(normalizeHeader);
  const hasHeader =
    header.includes('name') &&
    (header.some((h) => ['price', 'sellingprice', 'saleprice'].includes(h)) || header.includes('category'));
  const findColumn = (aliases: string[]) => header.findIndex((value) => aliases.includes(value));

  const columns = hasHeader
    ? {
        name: findColumn(['name', 'productname', 'product', 'title']),
        price: findColumn(['price', 'sellingprice', 'saleprice', 'rate']),
        mrp: findColumn(['mrp', 'compareatprice', 'originalprice', 'listprice']),
        category: findColumn(['category', 'categoryname']),
        stock: findColumn(['stock', 'quantity', 'qty']),
        unit: findColumn(['unit']),
        description: findColumn(['description', 'desc', 'details']),
        image1: findColumn(['image', 'image1', 'imageurl', 'image1url', 'photo', 'photo1']),
        image2: findColumn(['image2', 'image2url', 'photo2']),
        image3: findColumn(['image3', 'image3url', 'photo3']),
      }
    : { name: 0, price: 1, mrp: 2, category: 3, stock: 4, unit: 5, description: -1, image1: 6, image2: 7, image3: 8 };

  if (columns.name < 0 || columns.price < 0) {
    return { error: 'CSV needs at least name and price columns.' };
  }

  const cell = (row: string[], index: number) => (index >= 0 ? row[index] ?? '' : '').trim();
  const numberValue = (value: string) => Number(value.replace(/[^0-9.-]/g, ''));

  const existingCats = (await sql`
    SELECT id, name FROM categories WHERE tenant_id = ${store.id}
  `) as Array<Record<string, unknown>>;
  const catMap = new Map(existingCats.map((c) => [String(c.name).toLowerCase(), String(c.id)]));
  let nextSort = existingCats.length + 1;

  let imported = 0;
  let skipped = 0;
  let invalidImages = 0;

  for (let i = hasHeader ? 1 : 0; i < rows.length; i++) {
    const row = rows[i];
    const name = cell(row, columns.name);
    const price = numberValue(cell(row, columns.price));
    if (!name || !Number.isFinite(price)) {
      skipped++;
      continue;
    }

    const images: string[] = [];
    for (const index of [columns.image1, columns.image2, columns.image3]) {
      const candidate = cell(row, index);
      if (!candidate) continue;
      if (!isUploadThingUrl(candidate)) {
        invalidImages++;
        continue;
      }
      if (!images.includes(candidate)) images.push(candidate);
    }

    let categoryId: string | null = null;
    const categoryName = cell(row, columns.category);
    if (categoryName) {
      const key = categoryName.toLowerCase();
      if (!catMap.has(key)) {
        const id = makeId(categoryName);
        await sql`
          INSERT INTO categories (id, tenant_id, name, sort_order)
          VALUES (${id}, ${store.id}, ${categoryName}, ${nextSort})
          ON CONFLICT (tenant_id, lower(name)) DO NOTHING`;
        const categoryRows = (await sql`
          SELECT id FROM categories WHERE tenant_id = ${store.id} AND lower(name) = ${key} LIMIT 1
        `) as Array<Record<string, unknown>>;
        if (categoryRows.length) catMap.set(key, String(categoryRows[0].id));
        nextSort++;
      }
      categoryId = catMap.get(key) ?? null;
    }

    const mrp = numberValue(cell(row, columns.mrp));
    const stock = numberValue(cell(row, columns.stock));
    const primaryImage = images[0] || DEFAULT_IMAGE;

    await sql`
      INSERT INTO products (tenant_id, category_id, name, description, price, compare_at_price, image, images, stock, unit, status)
      VALUES (
        ${store.id}, ${categoryId}, ${name}, ${cell(row, columns.description) || ''}, ${price},
        ${Number.isFinite(mrp) && mrp > price ? mrp : null},
        ${primaryImage}, ${JSON.stringify(images)}::jsonb,
        ${Number.isFinite(stock) && stock >= 0 ? Math.floor(stock) : 10},
        ${cell(row, columns.unit) || null},
        'active'
      )`;
    imported++;
  }

  revalidatePath('/dashboard/products');
  revalidatePath('/dashboard/categories');
  revalidatePath(`/store/${store.id}`);

  if (!imported) {
    return { error: 'No valid rows found. Use: name, price, mrp, category, stock, unit, image1, image2, image3' };
  }
  const warnings = [
    skipped ? `skipped ${skipped} row${skipped === 1 ? '' : 's'}` : '',
    invalidImages ? `ignored ${invalidImages} image${invalidImages === 1 ? '' : 's'} not hosted on UploadThing` : '',
  ].filter(Boolean);
  return {
    success: `Imported ${imported} product${imported === 1 ? '' : 's'}${warnings.length ? ` (${warnings.join(', ')})` : ''}.`,
  };
}
