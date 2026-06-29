"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getRetreats } from "@/lib/api/retreats";
import { getCategories } from "@/lib/api/categories";
import { getWishlist } from "@/lib/api/wishlist";
import { RetreatGrid } from "@/components/retreats/retreat-grid";
import { WishlistButton } from "@/components/wishlist/wishlist-button";
import { useAuth } from "@/hooks/use-auth";
import type { Retreat } from "@/types/retreat";
import type { Category } from "@/types/category";

export default function HomePage() {
  const { isAuthenticated } = useAuth();

  const [featuredRetreats, setFeaturedRetreats] = useState<Retreat[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [wishlistIds, setWishlistIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch(() => {});
  }, []);

  useEffect(() => {
    getRetreats({ page: 1, page_size: 6 })
      .then((result) => {
        setFeaturedRetreats(result.items);
        setIsLoading(false);
      })
      .catch(() => {
        setError("Failed to load data");
        setIsLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    let cancelled = false;

    getWishlist()
      .then((result) => {
        if (!cancelled) {
          setWishlistIds(new Set(result.items.map((item) => item.retreat_id)));
        }
      })
      .catch(() => {});

    return () => { cancelled = true; };
  }, [isAuthenticated]);

  return (
    <div>
      <section className="bg-gradient-to-b from-primary/5 to-background py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Discover Your Perfect Retreat
          </h1>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Explore curated retreats, hotels, and resorts for your next getaway.
          </p>
          <Link href="/retreats">
            <Button size="lg">Browse Retreats</Button>
          </Link>
        </div>
      </section>

      {error ? (
        <div className="container mx-auto px-4 py-12 text-center">
          <p className="text-destructive">{error}</p>
        </div>
      ) : (
        <>
          <section className="container mx-auto px-4 py-12">
            <h2 className="text-2xl font-bold mb-6">Featured Retreats</h2>
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="space-y-3">
                    <Skeleton className="h-48 w-full rounded-lg" />
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ))}
              </div>
            ) : featuredRetreats.length > 0 && (
              <>
                <RetreatGrid
                  retreats={featuredRetreats}
                  categories={categories}
                  renderWishlistButton={(id) => (
                    <div className="bg-background/90 rounded-full shadow-xs p-0.5">
                      <WishlistButton
                        retreatId={id}
                        isWishlisted={wishlistIds.has(id)}
                        variant="outline"
                        onToggle={(newState) => {
                          setWishlistIds((prev) => {
                            const next = new Set(prev);
                            if (newState) {
                              next.add(id);
                            } else {
                              next.delete(id);
                            }
                            return next;
                          });
                        }}
                      />
                    </div>
                  )}
                />
                <div className="text-center mt-8">
                  <Link href="/retreats">
                    <Button variant="outline">View All Retreats</Button>
                  </Link>
                </div>
              </>
            )}
          </section>

          {categories.length > 0 && (
            <section className="bg-muted/30 py-12">
              <div className="container mx-auto px-4">
                <h2 className="text-2xl font-bold mb-6">Browse by Category</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {categories.map((cat) => (
                    <Link key={cat.category_id} href={`/retreats?category=${cat.category_id}`}>
                      <Card className="hover:shadow-md transition-shadow cursor-pointer">
                        <CardHeader>
                          <CardTitle className="text-lg">{cat.name}</CardTitle>
                        </CardHeader>
                        {cat.description && (
                          <CardContent>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {cat.description}
                            </p>
                          </CardContent>
                        )}
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
