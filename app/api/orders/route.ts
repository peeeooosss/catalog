import { NextResponse } from 'next/server';
import { getSql } from '@/lib/db';
import { formatMoney } from '@/lib/utils';

export const dynamic = 'force-dynamic';

interface IncomingItem {
  product_id?: number;
  variant_id?: number | null;
  quantity?: number;
}

interface IncomingBody {
  tenantId?: string;
  sessionId?: string;
  customer?: { name?: string; phone?: string; address?: string; notes?: string };
  items?: IncomingItem[];
}

export async function POST(request: Request) {
  const sql = getSql();
  if (!sql) {
    return NextResponse.json({ ok: false, error: 'Database not configured' }, { status: 503 });
  }

  let body: IncomingBody;
  try {
    body = (await request.json()) as IncomingBody;
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON' }, { status: 400 });
  }

  const tenantId = String(body.tenantId ?? '');
  const items = Array.isArray(body.items) ? body.items.slice(0, 50) : [];
  const customer = body.customer ?? {};
  const name = String(customer.name ?? '').trim();
  const phone = String(customer.phone ?? '').trim();
  const address = String(customer.address ?? '').trim();
  const notes = String(customer.notes ?? '').trim();
  const sessionId = body.sessionId ? String(body.sessionId).slice(0, 64) : null;

  if (!tenantId || !name || !items.length) {
    return NextResponse.json({ ok: false, error: 'Missing required fields' }, { status: 400 });
  }

  const tenantRows = (await sql`
    SELECT id, business_name, whatsapp_number, currency, is_active FROM tenants WHERE id = ${tenantId} LIMIT 1
  `) as Array<Record<string, unknown>>;
  if (!tenantRows.length || !tenantRows[0].is_active) {
    return NextResponse.json({ ok: false, error: 'Store not found' }, { status: 404 });
  }
  const tenant = tenantRows[0];
  const currency = String(tenant.currency ?? 'INR');

  const productIds = Array.from(
    new Set(items.map((i) => Number(i.product_id)).filter((n) => Number.isFinite(n) && n > 0))
  );
  if (!productIds.length) {
    return NextResponse.json({ ok: false, error: 'No valid items' }, { status: 400 });
  }

  const productRows = (await sql`
    SELECT id, name, price FROM products WHERE tenant_id = ${tenantId} AND id = ANY(${productIds})
  `) as Array<Record<string, unknown>>;
  const variantRows = (await sql`
    SELECT v.id, v.product_id, v.label, v.price
    FROM product_variants v JOIN products p ON p.id = v.product_id
    WHERE p.tenant_id = ${tenantId} AND v.id = ANY(${items
      .map((i) => Number(i.variant_id))
      .filter((n) => Number.isFinite(n) && n > 0)})
  `) as Array<Record<string, unknown>>;

  const productMap = new Map(productRows.map((p) => [Number(p.id), p]));
  const variantMap = new Map(variantRows.map((v) => [Number(v.id), v]));

  const lines: { product_id: number; variant_id: number | null; name: string; variant_label: string | null; price: number; quantity: number; subtotal: number }[] = [];
  for (const item of items) {
    const productId = Number(item.product_id);
    const product = productMap.get(productId);
    if (!product) continue;
    const quantity = Math.min(Math.max(Math.floor(Number(item.quantity) || 1), 1), 999);
    const variantId = Number(item.variant_id);
    const variant = Number.isFinite(variantId) ? variantMap.get(variantId) : undefined;
    if (variant && Number(variant.product_id) !== productId) continue;
    const variantPrice = variant && variant.price != null ? Number(variant.price) : null;
    const price = variantPrice != null ? variantPrice : Number(product.price);
    lines.push({
      product_id: productId,
      variant_id: variant ? Number(variant.id) : null,
      name: String(product.name),
      variant_label: variant ? String(variant.label) : null,
      price,
      quantity,
      subtotal: Math.round(price * quantity * 100) / 100,
    });
  }

  if (!lines.length) {
    return NextResponse.json({ ok: false, error: 'No valid items' }, { status: 400 });
  }

  const subtotal = Math.round(lines.reduce((s, l) => s + l.subtotal, 0) * 100) / 100;
  const itemCount = lines.reduce((s, l) => s + l.quantity, 0);

  const orderRows = (await sql`
    INSERT INTO orders (tenant_id, customer_name, customer_phone, customer_address, notes, subtotal, total, item_count, status)
    VALUES (${tenantId}, ${name}, ${phone || null}, ${address || null}, ${notes || null}, ${subtotal}, ${subtotal}, ${itemCount}, 'submitted')
    RETURNING id, order_number
  `) as Array<Record<string, unknown>>;
  const orderId = String(orderRows[0].id);
  const orderNumber = Number(orderRows[0].order_number);

  for (const line of lines) {
    await sql`
      INSERT INTO order_items (order_id, product_id, variant_id, name, variant_label, price, quantity, subtotal)
      VALUES (${orderId}, ${line.product_id}, ${line.variant_id}, ${line.name}, ${line.variant_label}, ${line.price}, ${line.quantity}, ${line.subtotal})`;
  }

  if (phone) {
    await sql`
      INSERT INTO customers (tenant_id, phone, name, address, total_orders, total_spent, last_order_at)
      VALUES (${tenantId}, ${phone}, ${name}, ${address || null}, 1, ${subtotal}, now())
      ON CONFLICT (tenant_id, phone) DO UPDATE SET
        name = COALESCE(EXCLUDED.name, customers.name),
        address = COALESCE(EXCLUDED.address, customers.address),
        total_orders = customers.total_orders + 1,
        total_spent = customers.total_spent + EXCLUDED.total_spent,
        last_order_at = now()`;
  }

  await sql`
    INSERT INTO analytics_events (tenant_id, event_type, session_id, value) VALUES
      (${tenantId}, 'order_created', ${sessionId}, ${subtotal}),
      (${tenantId}, 'whatsapp_click', ${sessionId}, NULL)`;

  const businessName = String(tenant.business_name);
  let message = `*New Order #${orderNumber} — ${businessName}*\n\n`;
  message += `*Items*\n`;
  for (const line of lines) {
    message += `• ${line.name}${line.variant_label ? ` (${line.variant_label})` : ''}\n`;
    message += `   ${line.quantity} x ${formatMoney(line.price, currency)} = ${formatMoney(line.subtotal, currency)}\n`;
  }
  message += `\n*Total: ${formatMoney(subtotal, currency)}*\n`;
  message += `\n*Customer*\nName: ${name}\n`;
  if (phone) message += `Phone: ${phone}\n`;
  if (address) message += `Address: ${address}\n`;
  if (notes) message += `Notes: ${notes}\n`;

  const whatsappUrl = `https://wa.me/${String(tenant.whatsapp_number).replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;

  return NextResponse.json({ ok: true, orderId, orderNumber, total: subtotal, whatsappUrl });
}
