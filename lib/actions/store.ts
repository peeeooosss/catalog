'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { getSql, getTenantByOwner } from '@/lib/db';
import { requireAdmin, requireStore, requireUser } from '@/lib/auth';
import { findTemplate } from '@/lib/templates';
import { makeId, slugify } from '@/lib/utils';
import type { ActionState } from './auth';

const STORE_ID_RE = /^[a-z0-9-]+$/;

async function uniqueSlug(base: string) {
  const sql = getSql();
  if (!sql) return slugify(base) || 'store';
  let slug = slugify(base) || 'store';
  for (let i = 0; i < 20; i++) {
    const rows = (await sql`SELECT 1 FROM tenants WHERE id = ${slug} LIMIT 1`) as Array<Record<string, unknown>>;
    if (!rows.length) return slug;
    slug = `${slugify(base)}-${Math.floor(Math.random() * 9000) + 1000}`;
  }
  return `${slugify(base)}-${Date.now().toString(36)}`;
}

export async function createStoreAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser();
  if (user.role === 'admin') return { error: 'Admins cannot create a store from here.' };
  const sql = getSql();
  if (!sql) return { error: 'Database is not configured.' };

  const existing = await getTenantByOwner(user.id);
  if (existing) return { error: 'You already have a store.' };

  const storeName = String(formData.get('storeName') ?? '').trim();
  const whatsapp = String(formData.get('whatsapp') ?? '').replace(/\D/g, '');
  const industry = String(formData.get('industry') ?? 'general');
  const primary = String(formData.get('primary') ?? '#10B981');
  const secondary = String(formData.get('secondary') ?? '#64748B');
  const accent = String(formData.get('accent') ?? '#F59E0B');
  const productName = String(formData.get('productName') ?? '').trim();
  const productPrice = Number(formData.get('productPrice') ?? 0);

  if (storeName.length < 2) return { error: 'Please enter a store name.' };
  if (whatsapp.length < 8) return { error: 'Please enter a valid WhatsApp number (min 8 digits).' };

  const template = findTemplate(industry);
  const slug = await uniqueSlug(storeName);
  const theme = { primary, secondary, accent };

  try {
    await sql`
      INSERT INTO tenants (id, owner_id, business_name, whatsapp_number, description, currency, offer_text, offer_active, industry, theme)
      VALUES (${slug}, ${user.id}, ${storeName}, ${whatsapp}, ${template.description}, 'INR', ${template.offerText}, true, ${industry}, ${JSON.stringify(theme)}::jsonb)
    `;

    const cats: { id: string; name: string }[] = [];
    let sort = 1;
    for (const c of template.categories) {
      const id = makeId(c.name);
      await sql`
        INSERT INTO categories (id, tenant_id, name, icon, sort_order)
        VALUES (${id}, ${slug}, ${c.name}, ${c.icon}, ${sort})`;
      cats.push({ id, name: c.name });
      sort++;
    }

    if (productName && productPrice > 0 && cats.length) {
      await sql`
        INSERT INTO products (tenant_id, category_id, name, description, price, stock, status, unit)
        VALUES (${slug}, ${cats[0].id}, ${productName}, '', ${productPrice}, 10, 'active', 'per pc')`;
    }
  } catch (error) {
    console.error('createStore failed', error);
    return { error: 'Could not create your store. Please try again.' };
  }

  revalidatePath('/dashboard');
  redirect('/dashboard');
}

export async function updateStoreAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { store } = await requireStore();
  const sql = getSql();
  if (!sql) return { error: 'Database is not configured.' };

  const schema = z.object({
    business_name: z.string().trim().min(2, 'Store name is too short'),
    whatsapp_number: z.string().trim().min(8, 'Enter a valid WhatsApp number'),
    description: z.string().trim().max(300).optional().nullable(),
    currency: z.string().trim().min(1).max(8),
    address: z.string().trim().max(300).optional().nullable(),
    offer_text: z.string().trim().max(160).optional().nullable(),
    logo_url: z.string().trim().url().optional().nullable().or(z.literal('')),
  });

  const parsed = schema.safeParse({
    business_name: formData.get('business_name'),
    whatsapp_number: formData.get('whatsapp_number'),
    description: formData.get('description') || null,
    currency: formData.get('currency') || 'INR',
    address: formData.get('address') || null,
    offer_text: formData.get('offer_text') || null,
    logo_url: formData.get('logo_url') || null,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Invalid details' };

  const d = parsed.data;
  try {
    await sql`
      UPDATE tenants SET
        business_name = ${d.business_name},
        whatsapp_number = ${d.whatsapp_number.replace(/\D/g, '')},
        description = ${d.description},
        currency = ${d.currency},
        address = ${d.address},
        offer_text = ${d.offer_text},
        offer_active = ${formData.get('offer_active') === 'on'},
        logo_url = ${d.logo_url ? d.logo_url : null},
        updated_at = now()
      WHERE id = ${store.id}`;
  } catch (error) {
    console.error('updateStore failed', error);
    return { error: 'Could not save your changes.' };
  }

  revalidatePath('/dashboard/settings');
  revalidatePath(`/store/${store.id}`);
  return { success: 'Store settings saved.' };
}

export async function updateThemeAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { store } = await requireStore();
  const sql = getSql();
  if (!sql) return { error: 'Database is not configured.' };

  const primary = String(formData.get('primary') ?? '#10B981');
  const secondary = String(formData.get('secondary') ?? '#64748B');
  const accent = String(formData.get('accent') ?? '#F59E0B');
  const hex = /^#[0-9a-fA-F]{6}$/;
  if (!hex.test(primary) || !hex.test(secondary) || !hex.test(accent)) {
    return { error: 'Please provide valid hex colors.' };
  }

  try {
    await sql`
      UPDATE tenants SET theme = ${JSON.stringify({ primary, secondary, accent })}::jsonb, updated_at = now()
      WHERE id = ${store.id}`;
  } catch (error) {
    console.error('updateTheme failed', error);
    return { error: 'Could not save the theme.' };
  }

  revalidatePath('/dashboard/theme');
  revalidatePath(`/store/${store.id}`);
  return { success: 'Theme saved — your store is updated.' };
}

export async function adminToggleStoreAction(formData: FormData) {
  await requireAdmin();
  const sql = getSql();
  if (!sql) return;
  const id = String(formData.get('id') ?? '');
  const active = formData.get('active') === 'true';
  if (!id || !STORE_ID_RE.test(id)) return;
  await sql`UPDATE tenants SET is_active = ${active}, updated_at = now() WHERE id = ${id}`;
  revalidatePath('/admin/stores');
}
