import dynamic from 'next/dynamic';
import Navbar from '@/components/homepage/Navbar';
import Hero from '@/components/homepage/Hero';
import SectionSkeleton from '@/components/ui/SectionSkeleton';

const LivePreview = dynamic(
  () => import('@/components/homepage/LivePreview'),
  { loading: () => <SectionSkeleton /> }
);
const Screenshots = dynamic(
  () => import('@/components/homepage/Screenshots'),
  { loading: () => <SectionSkeleton /> }
);
const Features = dynamic(
  () => import('@/components/homepage/Features'),
  { loading: () => <SectionSkeleton /> }
);
const Pricing = dynamic(
  () => import('@/components/homepage/Pricing'),
  { loading: () => <SectionSkeleton /> }
);
const CTA = dynamic(
  () => import('@/components/homepage/CTA'),
  { loading: () => <SectionSkeleton /> }
);
const Footer = dynamic(
  () => import('@/components/homepage/Footer'),
  { loading: () => <SectionSkeleton /> }
);

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <Hero />
      <LivePreview />
      <Screenshots />
      <Features />
      <Pricing />
      <CTA />
      <Footer />
    </div>
  );
}