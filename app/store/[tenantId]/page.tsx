import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import StoreFront from '@/components/store/StoreFront';
import { getCategories, getProducts, getTenantBySlug, isDbEnabled } from '@/lib/db';
import { MOCK_TENANT } from '@/lib/mock';
import type { Tenant } from '@/types';

type Params = { tenantId: string };

export const dynamic = 'force-dynamic';

async function resolveTenant(slug: string): Promise<Tenant | null | undefined> {
  const row = await getTenantBySlug(slug);
  if (row) {
    const [categories, products] = await Promise.all([
      getCategories(slug),
      getProducts(slug),
    ]);
    return {
      ...row,
      description: row.description ?? undefined,
      categories: categories ?? [],
      products: (products ?? []).filter((p) => p.status === 'active'),
    };
  }
  if (isDbEnabled()) return null;
  if (slug === MOCK_TENANT.id) return MOCK_TENANT;
  return null;
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const tenant = await resolveTenant(params.tenantId);
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const url = `${baseUrl}/store/${params.tenantId}`;

  if (!tenant) {
    return {
      title: 'Store Not Found',
      description: 'This store does not exist or may have been removed.',
    };
  }

  return {
    title: `${tenant.business_name} — Order via WhatsApp`,
    description: tenant.description ?? `Browse ${tenant.business_name} catalog and order instantly via WhatsApp.`,
    openGraph: {
      title: `${tenant.business_name} | CatalogPro`,
      description: tenant.description ?? `Order ${tenant.business_name} products instantly via WhatsApp.`,
      url,
      type: 'website',
      siteName: 'CatalogPro',
      images: tenant.logo_url ? [tenant.logo_url] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${tenant.business_name} | CatalogPro`,
      description: tenant.description ?? `Order ${tenant.business_name} products instantly via WhatsApp.`,
    },
  };
}

export default async function StorePage({ params }: { params: Params }) {
  const tenant = await resolveTenant(params.tenantId);
  if (!tenant) notFound();

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const storeUrl = `${baseUrl}/store/${params.tenantId}`;

  const productLd = tenant.products.map((p, i) => ({
    '@type': 'Product',
    position: i + 1,
    name: p.name,
    description: p.description,
    image: p.image,
    offers: {
      '@type': 'Offer',
      price: p.price,
      priceCurrency: tenant.currency || 'INR',
      availability: 'https://schema.org/InStock',
    },
  }));

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Store',
    name: tenant.business_name,
    description: tenant.description,
    url: storeUrl,
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: `${tenant.business_name} catalog`,
      itemListElement: productLd,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <StoreFront tenant={tenant} />
    </>
  );
}