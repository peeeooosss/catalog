import Skeleton from '@/components/ui/Skeleton';

export default function Loading() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-4 pt-32 pb-20">
        <div className="flex flex-col items-center text-center">
          <Skeleton className="h-6 w-40 rounded-full mb-6 mx-auto" />
          <Skeleton className="h-12 w-3/4 mb-4" />
          <Skeleton className="h-12 w-2/3 mb-6" />
          <Skeleton className="h-6 w-1/2 mb-10" />
          <div className="flex gap-4">
            <Skeleton className="h-12 w-40 rounded-xl" />
            <Skeleton className="h-12 w-40 rounded-xl" />
          </div>
        </div>
        <div className="grid md:grid-cols-3 gap-8 mt-20">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-2xl" />
          ))}
        </div>
      </div>
    </div>
  );
}