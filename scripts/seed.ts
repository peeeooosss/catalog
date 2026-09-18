import { neon } from '@neondatabase/serverless';

try {
  process.loadEnvFile?.('.env.local');
} catch {
  // .env.local optional (DATABASE_URL may already be in the environment)
}

const url = process.env.DATABASE_URL;
if (!url) {
  console.error('DATABASE_URL is not set. Add it to .env.local first.');
  process.exit(1);
}

const sql = neon(url);

const TENANT = {
  id: 'lumiere-boutique',
  business_name: 'Lumière Boutique',
  whatsapp_number: '1234567890',
  description: 'Premium clothing for the modern individual',
  logo_url: null,
  theme: { primary: '#10B981', secondary: '#64748B', accent: '#F59E0B' },
};

const CATEGORIES = [
  { id: 'tops', name: 'Tops', sort: 1 },
  { id: 'bottoms', name: 'Bottoms', sort: 2 },
  { id: 'dresses', name: 'Dresses', sort: 3 },
  { id: 'outerwear', name: 'Outerwear', sort: 4 },
];

const PRODUCTS = [
  { name: 'Premium Cotton Shirt', price: 45.0, category_id: 'tops', stock: 12, description: 'Breathable 100% organic cotton', image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=400&q=80' },
  { name: 'Classic Denim Jeans', price: 65.0, category_id: 'bottoms', stock: 8, description: 'Stretch denim for comfort', image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=400&q=80' },
  { name: 'Summer Maxi Dress', price: 89.0, category_id: 'dresses', stock: 0, description: 'Lightweight chiffon with pockets', image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=400&q=80' },
  { name: 'Leather Biker Jacket', price: 120.0, category_id: 'outerwear', stock: 5, description: 'Genuine distressed leather', image: 'https://images.unsplash.com/photo-1551028719-00575905b463?auto=format&fit=crop&w=400&q=80' },
];

async function main() {
  console.log('Applying schema...');
  await sql`
    CREATE TABLE IF NOT EXISTS tenants (
      id TEXT PRIMARY KEY,
      business_name TEXT NOT NULL,
      whatsapp_number TEXT NOT NULL,
      description TEXT,
      logo_url TEXT,
      theme JSONB NOT NULL DEFAULT '{"primary":"#10B981","secondary":"#64748B","accent":"#F59E0B"}'::jsonb,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )`;
  await sql`
    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      sort_order INT NOT NULL DEFAULT 0
    )`;
  await sql`
    CREATE INDEX IF NOT EXISTS idx_categories_tenant ON categories(tenant_id)`;
  await sql`
    CREATE TABLE IF NOT EXISTS products (
      id SERIAL PRIMARY KEY,
      tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
      category_id TEXT REFERENCES categories(id) ON DELETE SET NULL,
      name TEXT NOT NULL,
      description TEXT,
      price NUMERIC(10,2) NOT NULL DEFAULT 0,
      image TEXT,
      stock INT NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'active',
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )`;
  await sql`
    CREATE INDEX IF NOT EXISTS idx_products_tenant ON products(tenant_id)`;
  await sql`
    CREATE TABLE IF NOT EXISTS analytics_events (
      id BIGSERIAL PRIMARY KEY,
      tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
      event_type TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )`;
  await sql`
    CREATE INDEX IF NOT EXISTS idx_analytics_tenant ON analytics_events(tenant_id, created_at)`;

  console.log('Seeding tenant...');
  await sql`
    INSERT INTO tenants (id, business_name, whatsapp_number, description, logo_url, theme)
    VALUES (${TENANT.id}, ${TENANT.business_name}, ${TENANT.whatsapp_number}, ${TENANT.description}, ${TENANT.logo_url}, ${JSON.stringify(TENANT.theme)}::jsonb)
    ON CONFLICT (id) DO UPDATE SET
      business_name = EXCLUDED.business_name,
      whatsapp_number = EXCLUDED.whatsapp_number,
      description = EXCLUDED.description,
      logo_url = EXCLUDED.logo_url,
      theme = EXCLUDED.theme`;

  await sql`DELETE FROM categories WHERE tenant_id = ${TENANT.id}`;
  for (const c of CATEGORIES) {
    await sql`
      INSERT INTO categories (id, tenant_id, name, sort_order)
      VALUES (${c.id}, ${TENANT.id}, ${c.name}, ${c.sort})
      ON CONFLICT (id) DO NOTHING`;
  }

  await sql`DELETE FROM products WHERE tenant_id = ${TENANT.id}`;
  for (const p of PRODUCTS) {
    await sql`
      INSERT INTO products (tenant_id, category_id, name, description, price, image, stock)
      VALUES (${TENANT.id}, ${p.category_id}, ${p.name}, ${p.description}, ${p.price}, ${p.image}, ${p.stock})`;
  }

  console.log('Seeding analytics events...');
  await sql`DELETE FROM analytics_events WHERE tenant_id = ${TENANT.id}`;
  const eventCount = 70 * 7;
  await sql`
    INSERT INTO analytics_events (tenant_id, event_type, created_at)
    SELECT
      ${TENANT.id},
      (ARRAY['view','view','view','view','add_to_cart','whatsapp_click'])[1 + floor(random() * 6)::int],
      now() - floor(random() * 7)::int * interval '1 day' - (random() * 86400) * interval '1 second'
    FROM generate_series(1, ${eventCount})
  `;

  console.log('Done ✅');
}

main().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});