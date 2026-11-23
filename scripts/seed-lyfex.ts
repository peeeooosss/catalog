import { randomBytes } from 'node:crypto';
import { neon } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';
import catalogue from '../data/lyfex-catalogue.json';
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

const TENANT_ID = 'lyfexdigital-comic-store';
const STORE_NAME = 'LyfexDigital Comic Store';
const WHATSAPP = '917303502409';
const SELLER_EMAIL = (process.env.LYFEX_SELLER_EMAIL || 'shakticomics@gmail.com').toLowerCase();
const SELLER_NAME = 'LyfexDigital Admin';
const IMAGE = 'https://images.unsplash.com/photo-1560393464-5c69a73c5770?auto=format&fit=crop&w=500&q=80';

function slug(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function productDescription(item: (typeof catalogue)[number]) {
  const parts = [
    `${item.language} edition`,
    `MRP ₹${item.price} as per Shakti Comics Illustrated Catalogue 2026`,
  ];
  if (item.badge) parts.push(item.badge);
  if (item.isbn) parts.push(`ISBN ${item.isbn}`);
  return parts.join(' • ');
}

async function main() {
  await applySchema(sql);

  let generatedPassword = '';
  const existingUser = (await sql`
    SELECT id FROM users WHERE lower(email) = lower(${SELLER_EMAIL}) LIMIT 1
  `) as Array<Record<string, unknown>>;

  let ownerId = String(existingUser[0]?.id ?? '');
  if (!ownerId) {
    generatedPassword = process.env.LYFEX_SELLER_PASSWORD || randomBytes(9).toString('base64url');
    const passwordHash = await bcrypt.hash(generatedPassword, 10);
    const userRows = (await sql`
      INSERT INTO users (email, password_hash, name, role)
      VALUES (${SELLER_EMAIL}, ${passwordHash}, ${SELLER_NAME}, 'seller')
      RETURNING id
    `) as Array<Record<string, unknown>>;
    ownerId = String(userRows[0].id);
  }

  await sql`
    INSERT INTO tenants (
      id, owner_id, business_name, whatsapp_number, description, currency,
      offer_text, offer_active, industry, theme, is_active, updated_at
    )
    VALUES (
      ${TENANT_ID}, ${ownerId}, ${STORE_NAME}, ${WHATSAPP},
      'India''s home for classic heroes — comics, collections, world classics and merchandise.',
      'INR', NULL, false, 'comics',
      ${JSON.stringify({ primary: '#6D28D9', secondary: '#0F172A', accent: '#F59E0B', template: 'bold', radius: 18 })}::jsonb,
      true, now()
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

  await sql`DELETE FROM products WHERE tenant_id = ${TENANT_ID}`;
  await sql`DELETE FROM categories WHERE tenant_id = ${TENANT_ID}`;

  const categories = Array.from(new Set(catalogue.map((item) => item.category)));
  for (let index = 0; index < categories.length; index++) {
    const name = categories[index];
    await sql`
      INSERT INTO categories (id, tenant_id, name, sort_order)
      VALUES (${slug(name)}, ${TENANT_ID}, ${name}, ${index + 1})`;
  }

  for (let index = 0; index < catalogue.length; index++) {
    const item = catalogue[index];
    await sql`
      INSERT INTO products (
        tenant_id, category_id, name, description, price, image, images,
        stock, unit, status, sort_order, updated_at
      )
      VALUES (
        ${TENANT_ID}, ${slug(item.category)}, ${item.name}, ${productDescription(item)}, ${item.price},
        ${IMAGE}, ${JSON.stringify([IMAGE])}::jsonb,
        10, 'per pc', 'active', ${index + 1}, now()
      )`;
  }

  console.log(`Seeded ${STORE_NAME}: ${categories.length} categories, ${catalogue.length} products.`);
  console.log(`Storefront: /store/${TENANT_ID}`);
  console.log(`WhatsApp: +${WHATSAPP}`);
  if (generatedPassword) {
    console.log(`Login: ${SELLER_EMAIL}`);
    console.log(`Password: ${generatedPassword}`);
  }
}

main().catch((error) => {
  console.error('LyfexDigital seed failed:', error);
  process.exit(1);
});
