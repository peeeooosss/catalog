import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Providers from '@/components/providers';

const inter = Inter({ subsets: ['latin'] });

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: 'CatalogPro - Create Your Digital Catalog in Minutes',
    template: '%s | CatalogPro',
  },
  description:
    'Build beautiful mobile catalogs, share on WhatsApp & Instagram, and receive orders instantly. No coding required.',
  keywords: 'digital catalog, whatsapp ordering, small business, e-commerce',
  openGraph: {
    type: 'website',
    siteName: 'CatalogPro',
    title: 'CatalogPro - Create Your Digital Catalog in Minutes',
    description:
      'Build beautiful mobile catalogs, share on WhatsApp & Instagram, and receive orders instantly. No coding required.',
    url: baseUrl,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CatalogPro - Create Your Digital Catalog in Minutes',
    description:
      'Build beautiful mobile catalogs, share on WhatsApp & Instagram, and receive orders instantly.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}