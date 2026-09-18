'use server';

import { revalidatePath } from 'next/cache';
import { getSql } from '@/lib/db';
import { requireStore } from '@/lib/auth';
import type { ActionState } from './auth';

const STATUSES = ['submitted', 'confirmed', 'packed', 'delivered', 'completed', 'cancelled'];

export async function updateOrderStatusAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { store } = await requireStore();
  const sql = getSql();
  if (!sql) return { error: 'Database is not configured.' };

  const id = String(formData.get('id') ?? '');
  const status = String(formData.get('status') ?? '');
  if (!id || !STATUSES.includes(status)) return { error: 'Invalid status update.' };

  try {
    const rows = (await sql`
      UPDATE orders SET status = ${status}, updated_at = now()
      WHERE id = ${id} AND tenant_id = ${store.id}
      RETURNING order_number
    `) as Array<Record<string, unknown>>;
    if (!rows.length) return { error: 'Order not found.' };
  } catch (error) {
    console.error('updateOrderStatus failed', error);
    return { error: 'Could not update the order.' };
  }

  revalidatePath('/dashboard/orders');
  revalidatePath('/dashboard');
  return { success: `Order marked as ${status}.` };
}
