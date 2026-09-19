'use server';

import { revalidatePath } from 'next/cache';
import { getSql } from '@/lib/db';
import { requireStore } from '@/lib/auth';
import type { ActionState } from './auth';

export async function toggleCustomerPaymentStatus(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { store } = await requireStore();
  const sql = getSql();
  if (!sql) return { error: 'Database is not configured.' };

  const id = String(formData.get('id') ?? '');
  const status = String(formData.get('status') ?? '');
  if (!id || (status !== 'paid' && status !== 'unpaid')) return { error: 'Invalid payment update.' };

  try {
    const rows = (await sql`
      UPDATE customers
      SET payment_status = ${status},
          paid_at = CASE WHEN ${status} = 'paid' THEN now() ELSE NULL END
      WHERE id = ${id} AND tenant_id = ${store.id}
      RETURNING phone
    `) as Array<Record<string, unknown>>;
    if (!rows.length) return { error: 'Customer not found.' };
  } catch (error) {
    console.error('toggleCustomerPaymentStatus failed', error);
    return { error: 'Could not update the customer.' };
  }

  revalidatePath('/dashboard/customers');
  return { success: status === 'paid' ? 'Customer marked as paid.' : 'Customer marked as unpaid.' };
}