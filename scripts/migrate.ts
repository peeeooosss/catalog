import { neon } from '@neondatabase/serverless';
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

async function migrate() {
  console.log('Applying CatalogPro schema (idempotent)...');
  await applySchema(sql);
  console.log('Schema up to date ✅');
}

migrate().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
