import { Skeleton } from "@/components/ui/skeleton";

export default function RetreatsLoading() {
  return (
    <div className="min-h-screen">
      <section className="border-b bg-muted/30">
        <div className="container mx-auto px-4 py-10 lg:py-14">
          <div className="max-w-2xl space-y-4">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-12 w-64" />
            <Skeleton className="h-5 w-96" />
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8 space-y-8">
        <Skeleton className="h-32 w-full rounded-xl" />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="aspect-video w-full rounded-xl" />
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
