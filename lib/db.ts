import { neon } from '@neondatabase/serverless';
import type {
  AnalyticsPoint,
  Category,
  Customer,
  DashboardStats,
  FunnelStats,
  Order,
  OrderItem,
  OrderStatus,
  Product,
  ProductVariant,
  SellerSummary,
  Tenant,
  Theme,
  User,
} from '@/types';

export function isDbEnabled() {
  return Boolean(process.env.DATABASE_URL);
}

let sql: ReturnType<typeof neon> | null = null;

export function getSql() {
  if (!isDbEnabled()) return null;
  if (!sql) sql = neon(process.env.DATABASE_URL as string);
  return sql;
}

const num = (v: unknown): number => (typeof v === 'number' ? v : Number(v ?? 0));
const str = (v: unknown): string => (v == null ? '' : String(v));
const strOrNull = (v: unknown): string | null => (v == null ? null : String(v));
const numOrNull = (v: unknown): number | null => (v == null ? null : num(v));

function parseTheme(value: unknown): Theme {
  const fallback: Theme = { primary: '#10B981', secondary: '#64748B', accent: '#F59E0B' };
  if (typeof value === 'string') {
    try {
      return JSON.parse(value) as Theme;
    } catch {
      return fallback;
    }
  }
  return (value as Theme) ?? fallback;
}

export interface StoreRow {
  id: string;
  owner_id: string | null;
  business_name: string;
  whatsapp_number: string;
  description: string | null;
  logo_url: string | null;
  currency: string;
  offer_text: string | null;
  offer_active: boolean;
  address: string | null;
  industry: string | null;
  is_active: boolean;
  theme: Theme;
}

function mapStore(r: Record<string, unknown>): StoreRow {
  return {
    id: str(r.id),
    owner_id: strOrNull(r.owner_id),
    business_name: str(r.business_name),
    whatsapp_number: str(r.whatsapp_number),
    description: strOrNull(r.description),
    logo_url: strOrNull(r.logo_url),
    currency: str(r.currency) || 'INR',
    offer_text: strOrNull(r.offer_text),
    offer_active: Boolean(r.offer_active),
    address: strOrNull(r.address),
    industry: strOrNull(r.industry),
    is_active: r.is_active === undefined ? true : Boolean(r.is_active),
    theme: parseTheme(r.theme),
  };
}

/* ------------------------------- public reads ------------------------------ */

export async function getTenantBySlug(slug: string): Promise<StoreRow | null> {
  const client = getSql();
  if (!client) return null;
  try {
    const rows = (await client`SELECT * FROM tenants WHERE id = ${slug} LIMIT 1`) as Array<
      Record<string, unknown>
    >;
    return rows.length ? mapStore(rows[0]) : null;
  } catch (error) {
    console.error('getTenantBySlug failed', error);
    return null;
  }
}

export async function getTenantByOwner(ownerId: string): Promise<StoreRow | null> {
  const client = getSql();
  if (!client) return null;
  try {
    const rows = (await client`SELECT * FROM tenants WHERE owner_id = ${ownerId} LIMIT 1`) as Array<
      Record<string, unknown>
    >;
    return rows.length ? mapStore(rows[0]) : null;
  } catch (error) {
    console.error('getTenantByOwner failed', error);
    return null;
  }
}

export async function getCategories(tenantId: string): Promise<Category[] | null> {
  const client = getSql();
  if (!client) return null;
  try {
    const rows = (await client`
      SELECT id, name, icon FROM categories
      WHERE tenant_id = ${tenantId} AND is_active = true
      ORDER BY sort_order ASC, name ASC
    `) as Array<Record<string, unknown>>;
    return rows.map((r) => ({ id: str(r.id), name: str(r.name), icon: strOrNull(r.icon) }));
  } catch (error) {
    console.error('getCategories failed', error);
    return null;
  }
}

export async function getProducts(tenantId: string): Promise<Product[] | null> {
  const client = getSql();
  if (!client) return null;
  try {
    const rows = (await client`
      SELECT * FROM products
      WHERE tenant_id = ${tenantId}
      ORDER BY sort_order ASC, id ASC
    `) as Array<Record<string, unknown>>;
    const variantRows = (await client`
      SELECT v.* FROM product_variants v
      JOIN products p ON p.id = v.product_id
      WHERE p.tenant_id = ${tenantId} AND v.is_active = true
      ORDER BY v.sort_order ASC, v.id ASC
    `) as Array<Record<string, unknown>>;

    const variantsByProduct = new Map<number, ProductVariant[]>();
    for (const v of variantRows) {
      const pid = num(v.product_id);
      const list = variantsByProduct.get(pid) ?? [];
      list.push({
        id: num(v.id),
        label: str(v.label),
        price: numOrNull(v.price),
        compare_at_price: numOrNull(v.compare_at_price),
        stock: num(v.stock),
        sku: strOrNull(v.sku),
        is_active: Boolean(v.is_active),
      });
      variantsByProduct.set(pid, list);
    }

    return rows.map((r) => ({
      id: num(r.id),
      name: str(r.name),
      description: str(r.description),
      price: num(r.price),
      compare_at_price: numOrNull(r.compare_at_price),
      category_id: strOrNull(r.category_id) ?? '',
      image: str(r.image),
      unit: strOrNull(r.unit),
      stock: num(r.stock),
      status: (str(r.status) || 'active') as Product['status'],
      variants: variantsByProduct.get(num(r.id)) ?? [],
    }));
  } catch (error) {
    console.error('getProducts failed', error);
    return null;
  }
}

export async function getProductById(tenantId: string, id: number): Promise<Product | null> {
  const client = getSql();
  if (!client) return null;
  try {
    const rows = (await client`
      SELECT * FROM products WHERE id = ${id} AND tenant_id = ${tenantId} LIMIT 1
    `) as Array<Record<string, unknown>>;
    if (!rows.length) return null;
    const r = rows[0];
    const variantRows = (await client`
      SELECT * FROM product_variants WHERE product_id = ${id} ORDER BY sort_order ASC, id ASC
    `) as Array<Record<string, unknown>>;
    return {
      id: num(r.id),
      name: str(r.name),
      description: str(r.description),
      price: num(r.price),
      compare_at_price: numOrNull(r.compare_at_price),
      category_id: strOrNull(r.category_id) ?? '',
      image: str(r.image),
      unit: strOrNull(r.unit),
      stock: num(r.stock),
      status: (str(r.status) || 'active') as Product['status'],
      variants: variantRows.map((v) => ({
        id: num(v.id),
        label: str(v.label),
        price: numOrNull(v.price),
        compare_at_price: numOrNull(v.compare_at_price),
        stock: num(v.stock),
        sku: strOrNull(v.sku),
        is_active: Boolean(v.is_active),
      })),
    };
  } catch (error) {
    console.error('getProductById failed', error);
    return null;
  }
}

export async function getFullTenant(slug: string): Promise<Tenant | null | undefined> {
  const row = await getTenantBySlug(slug);
  if (!row) {
    if (isDbEnabled()) return null;
    return undefined;
  }
  const [categories, products] = await Promise.all([getCategories(slug), getProducts(slug)]);
  return {
    ...row,
    description: row.description ?? undefined,
    logo_url: row.logo_url,
    categories: categories ?? [],
    products: products ?? [],
  };
}

/* ------------------------------ analytics reads ---------------------------- */

function dayLabel(d: Date, days: number) {
  if (days <= 7) {
    return d.toLocaleDateString('en-US', { weekday: 'short' });
  }
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

export async function getAnalytics(tenantId: string, days = 7): Promise<AnalyticsPoint[] | null> {
  const client = getSql();
  if (!client) return null;
  try {
    const events = (await client`
      SELECT to_char(date_trunc('day', created_at), 'YYYY-MM-DD') AS d, event_type, COUNT(*)::int AS count
      FROM analytics_events
      WHERE tenant_id = ${tenantId} AND created_at >= now() - (${days} || ' days')::interval
      GROUP BY d, event_type
    `) as Array<Record<string, unknown>>;
    const orders = (await client`
      SELECT to_char(date_trunc('day', created_at), 'YYYY-MM-DD') AS d, COUNT(*)::int AS count
      FROM orders
      WHERE tenant_id = ${tenantId} AND created_at >= now() - (${days} || ' days')::interval
      GROUP BY d
    `) as Array<Record<string, unknown>>;

    const map = new Map<string, AnalyticsPoint>();
    const today = new Date();
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      map.set(key, { day: dayLabel(d, days), views: 0, carts: 0, clicks: 0, orders: 0 });
    }
    for (const e of events) {
      const point = map.get(str(e.d));
      if (!point) continue;
      const count = num(e.count);
      if (e.event_type === 'view') point.views += count;
      else if (e.event_type === 'add_to_cart') point.carts += count;
      else if (e.event_type === 'whatsapp_click') point.clicks += count;
    }
    for (const o of orders) {
      const point = map.get(str(o.d));
      if (point) point.orders += num(o.count);
    }
    return Array.from(map.values());
  } catch (error) {
    console.error('getAnalytics failed', error);
    return null;
  }
}

export async function getFunnel(tenantId: string, days = 30): Promise<FunnelStats> {
  const empty: FunnelStats = {
    views: 0,
    visitors: 0,
    carts: 0,
    whatsappClicks: 0,
    orders: 0,
    itemsSold: 0,
    revenue: 0,
  };
  const client = getSql();
  if (!client) return empty;
  try {
    const [events, orderAgg, itemAgg] = await Promise.all([
      client`
        SELECT
          COUNT(*) FILTER (WHERE event_type = 'view')::int AS views,
          COUNT(DISTINCT session_id) FILTER (WHERE event_type = 'view')::int AS visitors,
          COUNT(*) FILTER (WHERE event_type = 'add_to_cart')::int AS carts,
          COUNT(*) FILTER (WHERE event_type = 'whatsapp_click')::int AS clicks
        FROM analytics_events
        WHERE tenant_id = ${tenantId} AND created_at >= now() - (${days} || ' days')::interval
      `,
      client`
        SELECT
          COUNT(*)::int AS orders,
          COALESCE(SUM(total) FILTER (WHERE status IN ('confirmed','packed','delivered','completed')), 0)::float AS revenue
        FROM orders
        WHERE tenant_id = ${tenantId} AND created_at >= now() - (${days} || ' days')::interval
          AND status <> 'cancelled'
      `,
      client`
        SELECT COALESCE(SUM(oi.quantity), 0)::int AS items
        FROM order_items oi
        JOIN orders o ON o.id = oi.order_id
        WHERE o.tenant_id = ${tenantId} AND o.created_at >= now() - (${days} || ' days')::interval
          AND o.status <> 'cancelled'
      `,
    ]);
    const e = (events as Array<Record<string, unknown>>)[0] ?? {};
    const o = (orderAgg as Array<Record<string, unknown>>)[0] ?? {};
    const it = (itemAgg as Array<Record<string, unknown>>)[0] ?? {};
    return {
      views: num(e.views),
      visitors: num(e.visitors),
      carts: num(e.carts),
      whatsappClicks: num(e.clicks),
      orders: num(o.orders),
      itemsSold: num(it.items),
      revenue: num(o.revenue),
    };
  } catch (error) {
    console.error('getFunnel failed', error);
    return empty;
  }
}

export async function getDashboardStats(tenantId: string): Promise<DashboardStats> {
  const empty: DashboardStats = {
    products: 0,
    categories: 0,
    orders: 0,
    revenue: 0,
    itemsSold: 0,
    views: 0,
    carts: 0,
    whatsappClicks: 0,
    pendingOrders: 0,
    lowStock: 0,
  };
  const client = getSql();
  if (!client) return empty;
  try {
    const [counts, orderAgg, itemAgg, events] = await Promise.all([
      client`
        SELECT
          (SELECT COUNT(*)::int FROM products WHERE tenant_id = ${tenantId}) AS products,
          (SELECT COUNT(*)::int FROM categories WHERE tenant_id = ${tenantId} AND is_active = true) AS categories,
          (SELECT COUNT(*)::int FROM products WHERE tenant_id = ${tenantId} AND status = 'active' AND stock <= 5) AS low_stock
      `,
      client`
        SELECT
          COUNT(*)::int AS orders,
          COUNT(*) FILTER (WHERE status = 'submitted')::int AS pending,
          COALESCE(SUM(total) FILTER (WHERE status IN ('confirmed','packed','delivered','completed')), 0)::float AS revenue
        FROM orders
        WHERE tenant_id = ${tenantId}
      `,
      client`
        SELECT COALESCE(SUM(oi.quantity), 0)::int AS items
        FROM order_items oi JOIN orders o ON o.id = oi.order_id
        WHERE o.tenant_id = ${tenantId} AND o.status <> 'cancelled'
      `,
      client`
        SELECT
          COUNT(*) FILTER (WHERE event_type = 'view')::int AS views,
          COUNT(*) FILTER (WHERE event_type = 'add_to_cart')::int AS carts,
          COUNT(*) FILTER (WHERE event_type = 'whatsapp_click')::int AS clicks
        FROM analytics_events WHERE tenant_id = ${tenantId}
      `,
    ]);
    const c = (counts as Array<Record<string, unknown>>)[0] ?? {};
    const o = (orderAgg as Array<Record<string, unknown>>)[0] ?? {};
    const it = (itemAgg as Array<Record<string, unknown>>)[0] ?? {};
    const e = (events as Array<Record<string, unknown>>)[0] ?? {};
    return {
      products: num(c.products),
      categories: num(c.categories),
      lowStock: num(c.low_stock),
      orders: num(o.orders),
      pendingOrders: num(o.pending),
      revenue: num(o.revenue),
      itemsSold: num(it.items),
      views: num(e.views),
      carts: num(e.carts),
      whatsappClicks: num(e.clicks),
    };
  } catch (error) {
    console.error('getDashboardStats failed', error);
    return empty;
  }
}

export interface TopProduct {
  id: number;
  name: string;
  image: string;
  sold: number;
  revenue: number;
  cart_adds: number;
  views: number;
}

export async function getTopProducts(tenantId: string, days = 30, limit = 5): Promise<TopProduct[]> {
  const client = getSql();
  if (!client) return [];
  try {
    const rows = (await client`
      SELECT p.id, p.name, p.image,
        COALESCE(sold.qty, 0)::int AS sold,
        COALESCE(sold.revenue, 0)::float AS revenue,
        COALESCE(cart.adds, 0)::int AS cart_adds,
        COALESCE(vw.views, 0)::int AS views
      FROM products p
      LEFT JOIN (
        SELECT oi.product_id, SUM(oi.quantity) AS qty, SUM(oi.subtotal) AS revenue
        FROM order_items oi JOIN orders o ON o.id = oi.order_id
        WHERE o.tenant_id = ${tenantId} AND o.status <> 'cancelled'
          AND o.created_at >= now() - (${days} || ' days')::interval
        GROUP BY oi.product_id
      ) sold ON sold.product_id = p.id
      LEFT JOIN (
        SELECT product_id, COUNT(*) AS adds FROM analytics_events
        WHERE tenant_id = ${tenantId} AND event_type = 'add_to_cart'
          AND created_at >= now() - (${days} || ' days')::interval
        GROUP BY product_id
      ) cart ON cart.product_id = p.id
      LEFT JOIN (
        SELECT product_id, COUNT(*) AS views FROM analytics_events
        WHERE tenant_id = ${tenantId} AND event_type = 'product_view'
          AND created_at >= now() - (${days} || ' days')::interval
        GROUP BY product_id
      ) vw ON vw.product_id = p.id
      WHERE p.tenant_id = ${tenantId}
      ORDER BY sold DESC, cart_adds DESC, views DESC
      LIMIT ${limit}
    `) as Array<Record<string, unknown>>;
    return rows.map((r) => ({
      id: num(r.id),
      name: str(r.name),
      image: str(r.image),
      sold: num(r.sold),
      revenue: num(r.revenue),
      cart_adds: num(r.cart_adds),
      views: num(r.views),
    }));
  } catch (error) {
    console.error('getTopProducts failed', error);
    return [];
  }
}

/* --------------------------------- orders ---------------------------------- */

function mapOrder(r: Record<string, unknown>): Order {
  return {
    id: str(r.id),
    order_number: num(r.order_number),
    tenant_id: str(r.tenant_id),
    customer_name: str(r.customer_name),
    customer_phone: strOrNull(r.customer_phone),
    customer_address: strOrNull(r.customer_address),
    notes: strOrNull(r.notes),
    subtotal: num(r.subtotal),
    discount: num(r.discount),
    total: num(r.total),
    item_count: num(r.item_count),
    status: str(r.status) as OrderStatus,
    created_at: str(r.created_at),
  };
}

function mapOrderItem(r: Record<string, unknown>): OrderItem {
  return {
    id: num(r.id),
    product_id: numOrNull(r.product_id),
    variant_id: numOrNull(r.variant_id),
    name: str(r.name),
    variant_label: strOrNull(r.variant_label),
    price: num(r.price),
    quantity: num(r.quantity),
    subtotal: num(r.subtotal),
  };
}

export async function getOrders(
  tenantId: string,
  opts: { status?: string | null; search?: string | null; limit?: number } = {}
): Promise<Order[]> {
  const client = getSql();
  if (!client) return [];
  try {
    const rows = (await client`
      SELECT * FROM orders
      WHERE tenant_id = ${tenantId}
        AND (${opts.status ?? null}::text IS NULL OR status = ${opts.status ?? null})
        AND (
          ${opts.search ?? null}::text IS NULL
          OR customer_name ILIKE '%' || ${opts.search ?? null} || '%'
          OR COALESCE(customer_phone, '') ILIKE '%' || ${opts.search ?? null} || '%'
        )
      ORDER BY created_at DESC
      LIMIT ${opts.limit ?? 100}
    `) as Array<Record<string, unknown>>;
    return rows.map(mapOrder);
  } catch (error) {
    console.error('getOrders failed', error);
    return [];
  }
}

export async function getOrdersWithItems(
  tenantId: string,
  opts: { status?: string | null; search?: string | null; limit?: number } = {}
): Promise<Order[]> {
  const client = getSql();
  if (!client) return [];
  try {
    const orders = await getOrders(tenantId, opts);
    if (!orders.length) return [];
    const ids = orders.map((o) => o.id);
    const itemRows = (await client`
      SELECT * FROM order_items WHERE order_id = ANY(${ids}) ORDER BY id ASC
    `) as Array<Record<string, unknown>>;
    return orders.map((o) => ({
      ...o,
      items: itemRows.filter((r) => str(r.order_id) === o.id).map(mapOrderItem),
    }));
  } catch (error) {
    console.error('getOrdersWithItems failed', error);
    return getOrders(tenantId, opts);
  }
}

export async function getOrderWithItems(orderId: string, tenantId: string): Promise<Order | null> {
  const client = getSql();
  if (!client) return null;
  try {
    const rows = (await client`
      SELECT * FROM orders WHERE id = ${orderId} AND tenant_id = ${tenantId} LIMIT 1
    `) as Array<Record<string, unknown>>;
    if (!rows.length) return null;
    const items = (await client`
      SELECT * FROM order_items WHERE order_id = ${orderId} ORDER BY id ASC
    `) as Array<Record<string, unknown>>;
    return { ...mapOrder(rows[0]), items: items.map(mapOrderItem) };
  } catch (error) {
    console.error('getOrderWithItems failed', error);
    return null;
  }
}

export async function getCustomers(tenantId: string, search?: string | null): Promise<Customer[]> {
  const client = getSql();
  if (!client) return [];
  try {
    const rows = (await client`
      SELECT * FROM customers
      WHERE tenant_id = ${tenantId}
        AND (
          ${search ?? null}::text IS NULL
          OR COALESCE(name, '') ILIKE '%' || ${search ?? null} || '%'
          OR phone ILIKE '%' || ${search ?? null} || '%'
        )
      ORDER BY last_order_at DESC NULLS LAST, created_at DESC
      LIMIT 200
    `) as Array<Record<string, unknown>>;
    return rows.map((r) => ({
      id: num(r.id),
      tenant_id: str(r.tenant_id),
      phone: str(r.phone),
      name: strOrNull(r.name),
      address: strOrNull(r.address),
      total_orders: num(r.total_orders),
      total_spent: num(r.total_spent),
      last_order_at: strOrNull(r.last_order_at),
    }));
  } catch (error) {
    console.error('getCustomers failed', error);
    return [];
  }
}

/* --------------------------------- admin ----------------------------------- */

export async function getAllSellers(search?: string | null): Promise<SellerSummary[]> {
  const client = getSql();
  if (!client) return [];
  try {
    const rows = (await client`
      SELECT u.id, u.email, u.name, u.role, u.phone, u.is_active, u.created_at, u.last_login_at,
        t.id AS store_slug, t.business_name AS store_name, t.is_active AS store_active,
        COALESCE(o.orders, 0)::int AS orders,
        COALESCE(o.revenue, 0)::float AS revenue,
        COALESCE(p.products, 0)::int AS products
      FROM users u
      LEFT JOIN tenants t ON t.owner_id = u.id
      LEFT JOIN (
        SELECT tenant_id, COUNT(*) AS orders,
          SUM(total) FILTER (WHERE status IN ('confirmed','packed','delivered','completed')) AS revenue
        FROM orders GROUP BY tenant_id
      ) o ON o.tenant_id = t.id
      LEFT JOIN (SELECT tenant_id, COUNT(*) AS products FROM products GROUP BY tenant_id) p ON p.tenant_id = t.id
      WHERE u.role = 'seller'
        AND (${search ?? null}::text IS NULL
          OR u.email ILIKE '%' || ${search ?? null} || '%'
          OR u.name ILIKE '%' || ${search ?? null} || '%'
          OR COALESCE(t.business_name, '') ILIKE '%' || ${search ?? null} || '%')
      ORDER BY u.created_at DESC
      LIMIT 200
    `) as Array<Record<string, unknown>>;
    return rows.map((r) => ({
      id: str(r.id),
      email: str(r.email),
      name: str(r.name),
      role: str(r.role) as User['role'],
      phone: strOrNull(r.phone),
      is_active: Boolean(r.is_active),
      created_at: str(r.created_at),
      last_login_at: strOrNull(r.last_login_at),
      store_slug: strOrNull(r.store_slug),
      store_name: strOrNull(r.store_name),
      store_active: r.store_active == null ? null : Boolean(r.store_active),
      orders: num(r.orders),
      revenue: num(r.revenue),
      products: num(r.products),
    }));
  } catch (error) {
    console.error('getAllSellers failed', error);
    return [];
  }
}

export async function getAllStores(): Promise<
  Array<{
    id: string;
    business_name: string;
    owner_email: string | null;
    is_active: boolean;
    products: number;
    orders: number;
    revenue: number;
    created_at: string;
  }>
> {
  const client = getSql();
  if (!client) return [];
  try {
    const rows = (await client`
      SELECT t.id, t.business_name, t.is_active, t.created_at, u.email AS owner_email,
        COALESCE(p.products, 0)::int AS products,
        COALESCE(o.orders, 0)::int AS orders,
        COALESCE(o.revenue, 0)::float AS revenue
      FROM tenants t
      LEFT JOIN users u ON u.id = t.owner_id
      LEFT JOIN (SELECT tenant_id, COUNT(*) AS products FROM products GROUP BY tenant_id) p ON p.tenant_id = t.id
      LEFT JOIN (
        SELECT tenant_id, COUNT(*) AS orders,
          SUM(total) FILTER (WHERE status IN ('confirmed','packed','delivered','completed')) AS revenue
        FROM orders GROUP BY tenant_id
      ) o ON o.tenant_id = t.id
      ORDER BY t.created_at DESC
      LIMIT 200
    `) as Array<Record<string, unknown>>;
    return rows.map((r) => ({
      id: str(r.id),
      business_name: str(r.business_name),
      owner_email: strOrNull(r.owner_email),
      is_active: Boolean(r.is_active),
      products: num(r.products),
      orders: num(r.orders),
      revenue: num(r.revenue),
      created_at: str(r.created_at),
    }));
  } catch (error) {
    console.error('getAllStores failed', error);
    return [];
  }
}

export async function getAllOrders(opts: { status?: string | null; limit?: number } = {}) {
  const client = getSql();
  if (!client) return [];
  try {
    const rows = (await client`
      SELECT o.*, t.business_name AS store_name
      FROM orders o JOIN tenants t ON t.id = o.tenant_id
      WHERE (${opts.status ?? null}::text IS NULL OR o.status = ${opts.status ?? null})
      ORDER BY o.created_at DESC
      LIMIT ${opts.limit ?? 200}
    `) as Array<Record<string, unknown>>;
    return rows.map((r) => ({ ...mapOrder(r), store_name: str(r.store_name) }));
  } catch (error) {
    console.error('getAllOrders failed', error);
    return [];
  }
}

export async function getAllCustomers() {
  const client = getSql();
  if (!client) return [];
  try {
    const rows = (await client`
      SELECT c.*, t.business_name AS store_name
      FROM customers c JOIN tenants t ON t.id = c.tenant_id
      ORDER BY c.last_order_at DESC NULLS LAST
      LIMIT 300
    `) as Array<Record<string, unknown>>;
    return rows.map((r) => ({
      id: num(r.id),
      tenant_id: str(r.tenant_id),
      phone: str(r.phone),
      name: strOrNull(r.name),
      address: strOrNull(r.address),
      total_orders: num(r.total_orders),
      total_spent: num(r.total_spent),
      last_order_at: strOrNull(r.last_order_at),
      store_name: str(r.store_name),
    }));
  } catch (error) {
    console.error('getAllCustomers failed', error);
    return [];
  }
}

export async function getPlatformStats() {
  const empty = {
    sellers: 0,
    stores: 0,
    products: 0,
    orders: 0,
    revenue: 0,
    customers: 0,
    newSellers7d: 0,
  };
  const client = getSql();
  if (!client) return empty;
  try {
    const rows = (await client`
      SELECT
        (SELECT COUNT(*)::int FROM users WHERE role = 'seller') AS sellers,
        (SELECT COUNT(*)::int FROM tenants) AS stores,
        (SELECT COUNT(*)::int FROM products) AS products,
        (SELECT COUNT(*)::int FROM orders) AS orders,
        (SELECT COALESCE(SUM(total) FILTER (WHERE status IN ('confirmed','packed','delivered','completed')), 0)::float FROM orders) AS revenue,
        (SELECT COUNT(*)::int FROM customers) AS customers,
        (SELECT COUNT(*)::int FROM users WHERE role = 'seller' AND created_at >= now() - interval '7 days') AS new_sellers
    `) as Array<Record<string, unknown>>;
    const r = rows[0] ?? {};
    return {
      sellers: num(r.sellers),
      stores: num(r.stores),
      products: num(r.products),
      orders: num(r.orders),
      revenue: num(r.revenue),
      customers: num(r.customers),
      newSellers7d: num(r.new_sellers),
    };
  } catch (error) {
    console.error('getPlatformStats failed', error);
    return empty;
  }
}

export async function getPlatformSignups(days = 14): Promise<AnalyticsPoint[]> {
  const client = getSql();
  if (!client) return [];
  try {
    const rows = (await client`
      SELECT to_char(date_trunc('day', created_at), 'YYYY-MM-DD') AS d, COUNT(*)::int AS count
      FROM users WHERE role = 'seller' AND created_at >= now() - (${days} || ' days')::interval
      GROUP BY d
    `) as Array<Record<string, unknown>>;
    const map = new Map<string, AnalyticsPoint>();
    const today = new Date();
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      map.set(key, { day: dayLabel(d, 14), views: 0, carts: 0, clicks: 0, orders: 0 });
    }
    for (const r of rows) {
      const p = map.get(str(r.d));
      if (p) p.orders = num(r.count);
    }
    return Array.from(map.values());
  } catch (error) {
    console.error('getPlatformSignups failed', error);
    return [];
  }
}

export { mapOrder, mapOrderItem };
