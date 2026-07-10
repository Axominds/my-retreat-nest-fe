"use client";

import { useAuth } from "@/hooks/use-auth";
import { WishlistPageContent } from "@/components/wishlist/wishlist-page-content";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Heart } from "lucide-react";

export default function WishlistPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Skeleton className="h-10 w-56 mb-2" />
        <Skeleton className="h-5 w-72 mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-72 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <Heart className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">My Wishlist</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Retreats you have saved and loved
            </p>
          </div>
        </div>
      </div>
      <WishlistPageContent />
    </div>
  );
}