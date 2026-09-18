import Skeleton from '@/components/ui/Skeleton';

export default function SectionSkeleton() {
  return (
    <section className="py-20 bg-white" aria-hidden>
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-16">
          <Skeleton className="h-10 w-72 mx-auto mb-4" />
          <Skeleton className="h-6 w-96 max-w-full mx-auto" />
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-44 rounded-2xl" />
          ))}
        </div>
      </div>
    </section>
  );
}