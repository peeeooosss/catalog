# CatalogPro - Multi-Tenant Digital Catalog SaaS

A platform where store owners create digital catalogs, customize themes,
and share links on WhatsApp/Instagram to receive orders.

## Tech Stack
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Neon Postgres (`@neondatabase/serverless`)
- Framer Motion, Recharts, Sonner, qrcode.react
- Lucide React (Icons)

> The app runs out of the box with mock data. Set `DATABASE_URL` to a Neon
> connection string to use live data.

## Getting Started

1. Install dependencies:

   npm install

2. Set up environment variables in .env.local:

   DATABASE_URL=postgresql://...neon.tech/neondb?sslmode=require
   NEXT_PUBLIC_APP_URL=http://localhost:3000

3. (Optional) Create the schema and seed demo data into Neon:

   npm run db:seed

4. Run development server:

   npm run dev

## Project Structure

- app/ - Next.js App Router pages
  - store/[tenantId]/ - Public storefront (dynamic, SEO-ready)
  - dashboard/ - Store owner dashboard (products, theme, analytics, onboarding)
  - my-store/ - Redirects to the demo storefront
- components/homepage/ - Marketing homepage components
- components/dashboard/ - Store owner dashboard components
- components/store/ - Public storefront components
- db/schema.sql - Neon Postgres schema
- scripts/seed.ts - Schema creation + demo seed
- lib/ - utils (cn), Neon data layer (with mock fallback), mock data
- types/ - TypeScript type definitions

## Key Features

- Multi-tenant architecture (each store has unique URL)
- Customizable themes with live keyboard-accessible preview
- WhatsApp ordering (cart → WhatsApp message)
- Share modal with QR code + social sharing (WhatsApp, Facebook, Twitter, Instagram)
- Analytics dashboard (recharts) with live Neon data when configured
- 3-step store onboarding wizard
- Custom 404 + error boundaries for storefront
- Dynamic metadata, Open Graph tags, and JSON-LD product schema
- Animations, loading skeletons, fully responsive (320px → 1440px)

## Deployment (Netlify)

Deploy from GitHub. Required environment variables:

- DATABASE_URL (Neon Postgres connection string)
- NEXT_PUBLIC_APP_URL (production URL, e.g. https://your-site.netlify.app)