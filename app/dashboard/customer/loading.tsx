import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header Skeleton */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <div className="space-y-2">
          <Skeleton className="h-9 w-64" />
          <Skeleton className="h-5 w-48" />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <Skeleton className="h-10 w-full md:w-64" />
          <Skeleton className="h-10 w-20" />
        </div>
      </div>

      {/* Impact Banner Skeleton */}
      <Skeleton className="h-32 w-full rounded-2xl" />

      {/* Categories Skeleton */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-10 w-24 rounded-full shrink-0" />
        ))}
      </div>

      {/* Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="space-y-4">
            <Skeleton className="aspect-video w-full rounded-2xl" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
            <Skeleton className="h-10 w-full rounded-xl" />
          </div>
        ))}
      </div>
    </div>
  );
}
