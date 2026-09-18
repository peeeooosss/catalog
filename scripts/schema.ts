import type { NeonQueryFunction } from '@neondatabase/serverless';

type Sql = NeonQueryFunction<false, false>;

export async function applySchema(sql: Sql) {
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'seller' CHECK (role IN ('seller', 'admin')),
      phone TEXT,
      is_active BOOLEAN NOT NULL DEFAULT true,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      last_login_at TIMESTAMPTZ
    )`;

  await sql`
    CREATE TABLE IF NOT EXISTS sessions (
      token_hash TEXT PRIMARY KEY,
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      expires_at TIMESTAMPTZ NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )`;
  await sql`CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id)`;

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
  await sql`ALTER TABLE tenants ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES users(id) ON DELETE SET NULL`;
  await sql`ALTER TABLE tenants ADD COLUMN IF NOT EXISTS currency TEXT NOT NULL DEFAULT 'USD'`;
  await sql`ALTER TABLE tenants ADD COLUMN IF NOT EXISTS offer_text TEXT`;
  await sql`ALTER TABLE tenants ADD COLUMN IF NOT EXISTS offer_active BOOLEAN NOT NULL DEFAULT false`;
  await sql`ALTER TABLE tenants ADD COLUMN IF NOT EXISTS address TEXT`;
  await sql`ALTER TABLE tenants ADD COLUMN IF NOT EXISTS industry TEXT`;
  await sql`ALTER TABLE tenants ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true`;
  await sql`ALTER TABLE tenants ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now()`;
  await sql`CREATE UNIQUE INDEX IF NOT EXISTS idx_tenants_owner ON tenants(owner_id) WHERE owner_id IS NOT NULL`;

  await sql`
    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      sort_order INT NOT NULL DEFAULT 0
    )`;
  await sql`ALTER TABLE categories ADD COLUMN IF NOT EXISTS icon TEXT`;
  await sql`ALTER TABLE categories ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true`;
  await sql`ALTER TABLE categories ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now()`;
  await sql`CREATE INDEX IF NOT EXISTS idx_categories_tenant ON categories(tenant_id)`;
  await sql`CREATE UNIQUE INDEX IF NOT EXISTS idx_categories_tenant_name ON categories(tenant_id, lower(name))`;

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
  await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS compare_at_price NUMERIC(10,2)`;
  await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS unit TEXT`;
  await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS sort_order INT NOT NULL DEFAULT 0`;
  await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now()`;
  await sql`CREATE INDEX IF NOT EXISTS idx_products_tenant ON products(tenant_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_products_category ON products(tenant_id, category_id)`;

  await sql`
    CREATE TABLE IF NOT EXISTS product_variants (
      id SERIAL PRIMARY KEY,
      product_id INT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      label TEXT NOT NULL,
      price NUMERIC(10,2),
      compare_at_price NUMERIC(10,2),
      stock INT NOT NULL DEFAULT 0,
      sku TEXT,
      sort_order INT NOT NULL DEFAULT 0,
      is_active BOOLEAN NOT NULL DEFAULT true,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )`;
  await sql`CREATE INDEX IF NOT EXISTS idx_variants_product ON product_variants(product_id)`;

  await sql`
    CREATE TABLE IF NOT EXISTS customers (
      id SERIAL PRIMARY KEY,
      tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
      phone TEXT NOT NULL,
      name TEXT,
      address TEXT,
      total_orders INT NOT NULL DEFAULT 0,
      total_spent NUMERIC(12,2) NOT NULL DEFAULT 0,
      last_order_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      UNIQUE (tenant_id, phone)
    )`;
  await sql`CREATE INDEX IF NOT EXISTS idx_customers_tenant ON customers(tenant_id, last_order_at DESC)`;

  await sql`
    CREATE TABLE IF NOT EXISTS orders (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      order_number BIGINT GENERATED ALWAYS AS IDENTITY UNIQUE,
      tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
      customer_name TEXT NOT NULL,
      customer_phone TEXT,
      customer_address TEXT,
      notes TEXT,
      subtotal NUMERIC(12,2) NOT NULL DEFAULT 0,
      discount NUMERIC(12,2) NOT NULL DEFAULT 0,
      total NUMERIC(12,2) NOT NULL DEFAULT 0,
      item_count INT NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'submitted'
        CHECK (status IN ('submitted', 'confirmed', 'packed', 'delivered', 'completed', 'cancelled')),
      source TEXT NOT NULL DEFAULT 'whatsapp',
      whatsapp_opened BOOLEAN NOT NULL DEFAULT false,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )`;
  await sql`CREATE INDEX IF NOT EXISTS idx_orders_tenant ON orders(tenant_id, created_at DESC)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status)`;

  await sql`
    CREATE TABLE IF NOT EXISTS order_items (
      id BIGSERIAL PRIMARY KEY,
      order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      product_id INT REFERENCES products(id) ON DELETE SET NULL,
      variant_id INT REFERENCES product_variants(id) ON DELETE SET NULL,
      name TEXT NOT NULL,
      variant_label TEXT,
      price NUMERIC(12,2) NOT NULL DEFAULT 0,
      quantity INT NOT NULL DEFAULT 1,
      subtotal NUMERIC(12,2) NOT NULL DEFAULT 0
    )`;
  await sql`CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id)`;

  await sql`
    CREATE TABLE IF NOT EXISTS analytics_events (
      id BIGSERIAL PRIMARY KEY,
      tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
      event_type TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )`;
  await sql`ALTER TABLE analytics_events ADD COLUMN IF NOT EXISTS product_id INT`;
  await sql`ALTER TABLE analytics_events ADD COLUMN IF NOT EXISTS session_id TEXT`;
  await sql`ALTER TABLE analytics_events ADD COLUMN IF NOT EXISTS value NUMERIC(12,2)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_analytics_tenant ON analytics_events(tenant_id, created_at)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_analytics_type ON analytics_events(tenant_id, event_type, created_at)`;
}
