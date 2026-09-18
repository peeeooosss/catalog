import { neon } from '@neondatabase/serverless';
import type { Category, Tenant, Product } from '@/types';
import type { AnalyticsPoint } from '@/lib/mock';

export function isDbEnabled() {
  return Boolean(process.env.DATABASE_URL);
}

let sql: ReturnType<typeof neon> | null = null;

function db() {
  if (!isDbEnabled()) return null;
  if (!sql) sql = neon(process.env.DATABASE_URL as string);
  return sql;
}

function parseTheme(value: unknown): Tenant['theme'] {
  if (typeof value === 'string') {
    try {
      return JSON.parse(value) as Tenant['theme'];
    } catch {
      return { primary: '#10B981', secondary: '#64748B', accent: '#F59E0B' };
    }
  }
  return (value ?? { primary: '#10B981', secondary: '#64748B', accent: '#F59E0B' }) as Tenant['theme'];
}

export interface StoreRow {
  id: string;
  business_name: string;
  whatsapp_number: string;
  description: string | null;
  logo_url: string | null;
  theme: Tenant['theme'];
}

export async function getTenantBySlug(slug: string): Promise<StoreRow | null> {
  const client = db();
  if (!client) return null;
  try {
    const rows = (await client`SELECT * FROM tenants WHERE id = ${slug} LIMIT 1`) as Array<
      Record<string, unknown>
    >;
    if (!rows.length) return null;
    const r = rows[0] as Record<string, unknown>;
    return {
      id: r.id as string,
      business_name: r.business_name as string,
      whatsapp_number: r.whatsapp_number as string,
      description: (r.description as string | null) ?? null,
      logo_url: (r.logo_url as string | null) ?? null,
      theme: parseTheme(r.theme),
    };
  } catch (error) {
    console.error('getTenantBySlug failed', error);
    return null;
  }
}

export async function getCategories(tenantId: string): Promise<Category[] | null> {
  const client = db();
  if (!client) return null;
  try {
    const rows = (await client`SELECT id, name FROM categories WHERE tenant_id = ${tenantId} ORDER BY sort_order ASC, id ASC`) as Array<
      Record<string, unknown>
    >;
    return (rows as Array<Record<string, unknown>>).map((r) => ({
      id: r.id as string,
      name: r.name as string,
    }));
  } catch (error) {
    console.error('getCategories failed', error);
    return null;
  }
}

export async function getProducts(tenantId: string): Promise<Product[] | null> {
  const client = db();
  if (!client) return null;
  try {
    const rows = (await client`SELECT * FROM products WHERE tenant_id = ${tenantId} ORDER BY id ASC`) as Array<
      Record<string, unknown>
    >;
    return (rows as Array<Record<string, unknown>>).map((r) => ({
      id: typeof r.id === 'number' ? r.id : Number(r.id),
      name: r.name as string,
      description: (r.description as string | null) ?? '',
      price: typeof r.price === 'number' ? r.price : Number(r.price),
      category_id: (r.category_id as string | null) ?? '',
      image: (r.image as string | null) ?? '',
    }));
  } catch (error) {
    console.error('getProducts failed', error);
    return null;
  }
}

export async function getAnalytics(tenantId: string): Promise<AnalyticsPoint[] | null> {
  const client = db();
  if (!client) return null;
  try {
    const rows = (await client`
      SELECT to_char(created_at, 'Dy') AS day, event_type, COUNT(*)::int AS count
      FROM analytics_events
      WHERE tenant_id = ${tenantId} AND created_at >= now() - interval '7 days'
      GROUP BY day, event_type
      ORDER BY day
    `) as Array<Record<string, unknown>>;
    const dayOrder = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const map: Record<string, AnalyticsPoint> = {};
    for (const d of dayOrder) map[d] = { day: d, views: 0, carts: 0, clicks: 0 };
    for (const r of rows as Array<Record<string, unknown>>) {
      const day = r.day as string;
      const count = Number(r.count);
      if (!map[day]) continue;
      if (r.event_type === 'view') map[day].views += count;
      else if (r.event_type === 'add_to_cart') map[day].carts += count;
      else if (r.event_type === 'whatsapp_click') map[day].clicks += count;
    }
    return dayOrder.map((d) => map[d]);
  } catch (error) {
    console.error('getAnalytics failed', error);
    return null;
  }
}