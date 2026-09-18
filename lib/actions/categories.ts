'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { getSql } from '@/lib/db';
import { requireStore } from '@/lib/auth';
import { makeId } from '@/lib/utils';
import type { ActionState } from './auth';

const categorySchema = z.object({
  name: z.string().trim().min(1, 'Category name is required').max(40),
  icon: z.string().trim().max(8).optional().nullable(),
});

export async function createCategoryAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { store } = await requireStore();
  const sql = getSql();
  if (!sql) return { error: 'Database is not configured.' };

  const parsed = categorySchema.safeParse({
    name: formData.get('name'),
    icon: formData.get('icon') || null,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Invalid category' };

  const { name, icon } = parsed.data;
  const id = makeId(name);
  try {
    const maxRows = (await sql`
      SELECT COALESCE(MAX(sort_order), 0) + 1 AS next FROM categories WHERE tenant_id = ${store.id}
    `) as Array<Record<string, unknown>>;
    const sort = Number(maxRows[0]?.next ?? 1);
    await sql`
      INSERT INTO categories (id, tenant_id, name, icon, sort_order)
      VALUES (${id}, ${store.id}, ${name}, ${icon ? icon : null}, ${sort})`;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : '';
    if (message.includes('idx_categories_tenant_name') || message.includes('duplicate')) {
      return { error: 'You already have a category with this name.' };
    }
    console.error('createCategory failed', error);
    return { error: 'Could not add the category.' };
  }

  revalidatePath('/dashboard/categories');
  revalidatePath('/dashboard/products');
  revalidatePath(`/store/${store.id}`);
  return { success: `Category “${name}” added.` };
}

export async function updateCategoryAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { store } = await requireStore();
  const sql = getSql();
  if (!sql) return { error: 'Database is not configured.' };

  const id = String(formData.get('id') ?? '');
  const parsed = categorySchema.safeParse({
    name: formData.get('name'),
    icon: formData.get('icon') || null,
  });
  if (!id) return { error: 'Missing category.' };
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Invalid category' };

  const { name, icon } = parsed.data;
  try {
    const rows = (await sql`
      UPDATE categories SET name = ${name}, icon = ${icon ? icon : null}
      WHERE id = ${id} AND tenant_id = ${store.id}
      RETURNING id
    `) as Array<Record<string, unknown>>;
    if (!rows.length) return { error: 'Category not found.' };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : '';
    if (message.includes('idx_categories_tenant_name') || message.includes('duplicate')) {
      return { error: 'Another category already uses this name.' };
    }
    console.error('updateCategory failed', error);
    return { error: 'Could not update the category.' };
  }

  revalidatePath('/dashboard/categories');
  revalidatePath('/dashboard/products');
  revalidatePath(`/store/${store.id}`);
  return { success: 'Category updated.' };
}

export async function deleteCategoryAction(formData: FormData) {
  const { store } = await requireStore();
  const sql = getSql();
  if (!sql) return;
  const id = String(formData.get('id') ?? '');
  if (!id) return;
  await sql`DELETE FROM categories WHERE id = ${id} AND tenant_id = ${store.id}`;
  revalidatePath('/dashboard/categories');
  revalidatePath('/dashboard/products');
  revalidatePath(`/store/${store.id}`);
}

export async function moveCategoryAction(formData: FormData) {
  const { store } = await requireStore();
  const sql = getSql();
  if (!sql) return;
  const id = String(formData.get('id') ?? '');
  const direction = String(formData.get('direction') ?? 'up');
  if (!id) return;

  const rows = (await sql`
    SELECT id, sort_order FROM categories WHERE tenant_id = ${store.id} ORDER BY sort_order ASC, name ASC
  `) as Array<Record<string, unknown>>;
  const idx = rows.findIndex((r) => String(r.id) === id);
  if (idx < 0) return;
  const swapWith = direction === 'up' ? idx - 1 : idx + 1;
  if (swapWith < 0 || swapWith >= rows.length) return;

  const a = rows[idx];
  const b = rows[swapWith];
  await sql`UPDATE categories SET sort_order = ${Number(b.sort_order)} WHERE id = ${String(a.id)} AND tenant_id = ${store.id}`;
  await sql`UPDATE categories SET sort_order = ${Number(a.sort_order)} WHERE id = ${String(b.id)} AND tenant_id = ${store.id}`;
  revalidatePath('/dashboard/categories');
  revalidatePath(`/store/${store.id}`);
}
