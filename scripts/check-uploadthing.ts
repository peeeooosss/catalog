import { UTApi } from 'uploadthing/server';

try {
  process.loadEnvFile?.('.env.local');
} catch {}

if (!process.env.UPLOADTHING_TOKEN) {
  console.error('UPLOADTHING_TOKEN is not set.');
  process.exit(1);
}

const api = new UTApi({ logLevel: 'Error' });

async function main() {
  const result = await api.listFiles({ limit: 1 });
  console.log('UploadThing token is valid.');
  console.log(`Files visible: ${result.files?.length ?? 0}`);
}

main().catch((error) => {
  console.error('UploadThing token check failed:', error instanceof Error ? error.message : error);
  process.exit(1);
});
