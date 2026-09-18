import { neon } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';
import { applySchema } from './schema';

try {
  process.loadEnvFile?.('.env.local');
} catch {
  // .env.local optional
}

const url = process.env.DATABASE_URL;
if (!url) {
  console.error('DATABASE_URL is not set. Add it to .env.local first.');
  process.exit(1);
}

const sql = neon(url);

const TENANT_ID = 'lumiere-boutique';
const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || 'admin@catalogpro.app').toLowerCase();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
const SELLER_EMAIL = (process.env.DEMO_SELLER_EMAIL || 'seller@catalogpro.app').toLowerCase();
const SELLER_PASSWORD = process.env.DEMO_SELLER_PASSWORD || 'seller123';

const CATEGORIES = [
  { id: 'tops', name: 'Tops', icon: '👕', sort: 1 },
  { id: 'bottoms', name: 'Bottoms', icon: '👖', sort: 2 },
  { id: 'dresses', name: 'Dresses', icon: '👗', sort: 3 },
  { id: 'outerwear', name: 'Outerwear', icon: '🧥', sort: 4 },
];

const IMG = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=500&q=80`;

const PRODUCTS = [
  { name: 'Premium Cotton Shirt', price: 45, mrp: 60, category_id: 'tops', stock: 34, unit: 'per pc', description: 'Breathable 100% organic cotton', image: IMG('photo-1596755094514-f87e34085b2c') },
  { name: 'Slim Fit Oxford Shirt', price: 52, mrp: null, category_id: 'tops', stock: 18, unit: 'per pc', description: 'Crisp oxford weave for office days', image: IMG('photo-1602810318383-e386cc2a3ccf') },
  { name: 'Classic Denim Jeans', price: 65, mrp: 80, category_id: 'bottoms', stock: 22, unit: 'per pc', description: 'Stretch denim for all-day comfort', image: IMG('photo-1542272604-787c3835535d') },
  { name: 'Chino Trousers', price: 48, mrp: null, category_id: 'bottoms', stock: 15, unit: 'per pc', description: 'Tailored chinos in soft twill', image: IMG('photo-1473966968600-fa801b869a1a') },
  { name: 'Summer Maxi Dress', price: 89, mrp: 110, category_id: 'dresses', stock: 9, unit: 'per pc', description: 'Lightweight chiffon with pockets', image: IMG('photo-1595777457583-95e059d581b8') },
  { name: 'Floral Wrap Dress', price: 74, mrp: 95, category_id: 'dresses', stock: 0, unit: 'per pc', description: 'Flattering wrap silhouette', image: IMG('photo-1572804013309-59a88b7e92f1') },
  { name: 'Leather Biker Jacket', price: 120, mrp: 160, category_id: 'outerwear', stock: 6, unit: 'per pc', description: 'Genuine distressed leather', image: IMG('photo-1551028719-00575905b463') },
  { name: 'Wool Overcoat', price: 145, mrp: null, category_id: 'outerwear', stock: 4, unit: 'per pc', description: 'Warm tailored wool blend', image: IMG('photo-1539533018447-63fcce2678e3') },
  { name: 'Cotton Lounge Tee', price: 24, mrp: 32, category_id: 'tops', stock: 40, unit: 'per pc', description: 'Everyday soft-touch tee', image: IMG('photo-1521572163474-6864f9cf17ab') },
  { name: 'High-Waist Leggings', price: 38, mrp: 49, category_id: 'bottoms', stock: 26, unit: 'per pc', description: 'Four-way stretch, squat-proof', image: IMG('photo-1506629082955-511b1aa562c8') },
];

const VARIANTS = [
  { product: 'Premium Cotton Shirt', variants: [['Size S', 45, 60, 10], ['Size M', 45, 60, 14], ['Size L', 47, 62, 10]] },
  { product: 'Classic Denim Jeans', variants: [['Waist 30', 65, 80, 8], ['Waist 32', 65, 80, 9], ['Waist 34', 65, 80, 5]] },
];

const CUSTOMERS = [
  ['Aarav Mehta', '919876543210', '12 MG Road, Bengaluru'],
  ['Priya Sharma', '919812345678', '45 Park Street, Kolkata'],
  ['Rahul Verma', '918800112233', '7 Banjara Hills, Hyderabad'],
  ['Sara Khan', '919900223344', '22 Marine Drive, Mumbai'],
  ['Emily Carter', '447700900123', '18 Baker Street, London'],
  ['John Miller', '14155550123', '500 Market St, San Francisco'],
  ['Neha Gupta', '919711445566', '9 Connaught Place, Delhi'],
  ['Omar Farooq', '923001234567', '3 Gulberg, Lahore'],
];

const STATUSES = ['completed', 'delivered', 'confirmed', 'packed', 'submitted', 'cancelled'];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function upsertUser(email: string, password: string, name: string, role: 'seller' | 'admin') {
  const hash = await bcrypt.hash(password, 10);
  const rows = (await sql`
    INSERT INTO users (email, password_hash, name, role)
    VALUES (${email}, ${hash}, ${name}, ${role})
    ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash, role = EXCLUDED.role, is_active = true
    RETURNING id
  `) as Array<Record<string, unknown>>;
  return String(rows[0].id);
}

async function main() {
  console.log('Applying schema...');
  await applySchema(sql);

  console.log('Seeding admin + demo seller...');
  const adminId = await upsertUser(ADMIN_EMAIL, ADMIN_PASSWORD, 'Platform Admin', 'admin');
  const sellerId = await upsertUser(SELLER_EMAIL, SELLER_PASSWORD, 'Demo Seller', 'seller');
  console.log(`  admin:  ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
  console.log(`  seller: ${SELLER_EMAIL} / ${SELLER_PASSWORD}`);

  console.log('Seeding tenant...');
  await sql`
    INSERT INTO tenants (id, owner_id, business_name, whatsapp_number, description, logo_url, currency, offer_text, offer_active, industry, theme)
    VALUES (
      ${TENANT_ID}, ${sellerId}, 'Lumière Boutique', '919876543210',
      'Premium clothing for the modern individual', NULL, 'USD',
      'Flat 20% off this week — limited time!', true, 'fashion',
      ${JSON.stringify({ primary: '#10B981', secondary: '#64748B', accent: '#F59E0B' })}::jsonb
    )
    ON CONFLICT (id) DO UPDATE SET
      owner_id = EXCLUDED.owner_id,
      business_name = EXCLUDED.business_name,
      whatsapp_number = EXCLUDED.whatsapp_number,
      description = EXCLUDED.description,
      currency = EXCLUDED.currency,
      offer_text = EXCLUDED.offer_text,
      offer_active = EXCLUDED.offer_active,
      industry = EXCLUDED.industry,
      theme = EXCLUDED.theme,
      is_active = true,
      updated_at = now()`;

  console.log('Clearing previous demo data...');
  await sql`DELETE FROM orders WHERE tenant_id = ${TENANT_ID}`;
  await sql`DELETE FROM customers WHERE tenant_id = ${TENANT_ID}`;
  await sql`DELETE FROM analytics_events WHERE tenant_id = ${TENANT_ID}`;
  await sql`DELETE FROM products WHERE tenant_id = ${TENANT_ID}`;
  await sql`DELETE FROM categories WHERE tenant_id = ${TENANT_ID}`;

  console.log('Seeding categories...');
  for (const c of CATEGORIES) {
    await sql`
      INSERT INTO categories (id, tenant_id, name, icon, sort_order)
      VALUES (${c.id}, ${TENANT_ID}, ${c.name}, ${c.icon}, ${c.sort})
      ON CONFLICT (id) DO NOTHING`;
  }

  console.log('Seeding products + variants...');
  const productIds: { id: number; name: string; price: number }[] = [];
  for (const p of PRODUCTS) {
    const rows = (await sql`
      INSERT INTO products (tenant_id, category_id, name, description, price, compare_at_price, image, stock, unit, status)
      VALUES (${TENANT_ID}, ${p.category_id}, ${p.name}, ${p.description}, ${p.price}, ${p.mrp}, ${p.image}, ${p.stock}, ${p.unit}, ${p.stock === 0 ? 'out_of_stock' : 'active'})
      RETURNING id, name, price
    `) as Array<Record<string, unknown>>;
    productIds.push({ id: Number(rows[0].id), name: String(rows[0].name), price: Number(rows[0].price) });
  }

  for (const group of VARIANTS) {
    const product = productIds.find((p) => p.name === group.product);
    if (!product) continue;
    for (const [label, price, mrp, stock] of group.variants as [string, number, number, number][]) {
      await sql`
        INSERT INTO product_variants (product_id, label, price, compare_at_price, stock)
        VALUES (${product.id}, ${label}, ${price}, ${mrp}, ${stock})`;
    }
  }

  console.log('Seeding analytics events...');
  await sql`
    INSERT INTO analytics_events (tenant_id, event_type, product_id, session_id, created_at)
    SELECT
      ${TENANT_ID},
      (ARRAY['view','view','view','view','view','product_view','add_to_cart','whatsapp_click'])[1 + floor(random() * 8)::int],
      ${productIds[0]?.id ?? null},
      'sess-' || floor(random() * 400)::int,
      now() - floor(random() * 30)::int * interval '1 day' - (random() * 86400) * interval '1 second'
    FROM generate_series(1, ${60 * 30})`;

  console.log('Seeding customers + orders...');
  for (let i = 0; i < 32; i++) {
    const [name, phone, address] = pick(CUSTOMERS);
    const status = i < 3 ? 'submitted' : pick(STATUSES);
    const daysAgo = Math.floor(Math.random() * 30);
    const itemCount = 1 + Math.floor(Math.random() * 3);
    const chosen: { id: number; name: string; price: number; qty: number }[] = [];
    for (let j = 0; j < itemCount; j++) {
      const p = pick(productIds);
      const existing = chosen.find((c) => c.id === p.id);
      if (existing) existing.qty += 1;
      else chosen.push({ id: p.id, name: p.name, price: p.price, qty: 1 });
    }
    const subtotal = chosen.reduce((s, c) => s + c.price * c.qty, 0);
    const items = chosen.reduce((s, c) => s + c.qty, 0);
    const rows = (await sql`
      INSERT INTO orders (tenant_id, customer_name, customer_phone, customer_address, subtotal, total, item_count, status, created_at, updated_at)
      VALUES (${TENANT_ID}, ${name}, ${phone}, ${address}, ${subtotal}, ${subtotal}, ${items}, ${status},
        now() - (${daysAgo} || ' days')::interval - (random() * 86400) * interval '1 second',
        now() - (${daysAgo} || ' days')::interval)
      RETURNING id
    `) as Array<Record<string, unknown>>;
    const orderId = String(rows[0].id);
    for (const c of chosen) {
      await sql`
        INSERT INTO order_items (order_id, product_id, name, price, quantity, subtotal)
        VALUES (${orderId}, ${c.id}, ${c.name}, ${c.price}, ${c.qty}, ${c.price * c.qty})`;
    }
  }

  console.log('Rebuilding customers from orders...');
  await sql`
    INSERT INTO customers (tenant_id, phone, name, address, total_orders, total_spent, last_order_at)
    SELECT tenant_id, customer_phone, MAX(customer_name), MAX(customer_address),
      COUNT(*)::int, SUM(total), MAX(created_at)
    FROM orders
    WHERE tenant_id = ${TENANT_ID} AND customer_phone IS NOT NULL AND status <> 'cancelled'
    GROUP BY tenant_id, customer_phone
    ON CONFLICT (tenant_id, phone) DO UPDATE SET
      name = EXCLUDED.name,
      address = EXCLUDED.address,
      total_orders = EXCLUDED.total_orders,
      total_spent = EXCLUDED.total_spent,
      last_order_at = EXCLUDED.last_order_at`;

  console.log('Done ✅');
  console.log(`Admin login:  ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
  console.log(`Seller login: ${SELLER_EMAIL} / ${SELLER_PASSWORD}`);
  console.log(`Storefront:    /store/${TENANT_ID}`);
}

main().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
