import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="min-h-screen">
      <div className="relative overflow-hidden h-[calc(40vh+4rem)] flex items-end">
        <Skeleton className="absolute inset-0 rounded-none" />
        <div className="container mx-auto px-4 pt-28 pb-10 lg:pt-32 lg:pb-14 relative w-full space-y-3">
          <Skeleton className="h-8 w-24 bg-white/20" />
          <Skeleton className="h-10 w-3/4 bg-white/20" />
          <Skeleton className="h-5 w-1/2 bg-white/20" />
        </div>
      </div>

      <div className="container mx-auto px-4 py-10 max-w-3xl space-y-4">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    </div>
  );
}
