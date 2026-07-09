"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { getRetreats } from "@/lib/api/retreats";
import { getCategories } from "@/lib/api/categories";
import { getWishlist } from "@/lib/api/wishlist";
import { RetreatGrid } from "@/components/retreats/retreat-grid";
import { WishlistButton } from "@/components/wishlist/wishlist-button";
import { useAuth } from "@/hooks/use-auth";
import type { Retreat } from "@/types/retreat";
import type { Category } from "@/types/category";
import {
  Search,
  MapPin,
  Shield,
  HeartHandshake,
  ArrowRight,
  Star,
  Users,
} from "lucide-react";

const STATIC_RETREAT_IMAGES = [
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&q=80",
  "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600&q=80",
  "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&q=80",
  "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&q=80",
  "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&q=80",
  "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=600&q=80",
];

const CATEGORY_IMAGES = [
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&q=80",
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=80",
  "https://images.unsplash.com/photo-1542332213-9b5a5a3fad35?w=600&q=80",
  "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=600&q=80",
  "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=600&q=80",
  "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&q=80",
  "https://images.unsplash.com/photo-1540541338287-41700207dee6?w=600&q=80",
  "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=600&q=80",
];

export default function HomePage() {
  const { isAuthenticated } = useAuth();

  const [featuredRetreats, setFeaturedRetreats] = useState<Retreat[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [wishlistIds, setWishlistIds] = useState<Set<number>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch(() => {});
  }, []);

  useEffect(() => {
    let cancelled = false;

    getRetreats({ page: 1, page_size: 6 })
      .then((result) => {
        if (cancelled) return;
        setFeaturedRetreats(result.items);
        setIsLoading(false);
      })
      .catch(() => {
        if (!cancelled) {
          setError("Failed to load data");
          setIsLoading(false);
        }
      });

    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;

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
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary via-primary/90 to-emerald-700">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/20" />
        <div className="container mx-auto px-4 py-20 md:py-28 relative">
          <div className="max-w-3xl mx-auto text-center text-primary-foreground">
            <Badge variant="secondary" className="mb-6 text-xs px-4 py-1.5">
              Find your perfect escape
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4 leading-tight">
              Discover Your
              <span className="block text-primary-foreground/90">Perfect Retreat</span>
            </h1>
            <p className="text-lg md:text-xl text-primary-foreground/80 mb-10 max-w-xl mx-auto leading-relaxed">
              Explore handpicked retreats, resorts, and hotels for your next unforgettable getaway.
            </p>

            <div className="bg-background rounded-xl shadow-2xl p-2 flex flex-col sm:flex-row gap-2 max-w-2xl mx-auto">
              <div className="flex-1 flex items-center gap-1 px-3 py-1">
                <Search className="h-5 w-5 text-muted-foreground shrink-0" />
                <Input
                  placeholder="Search retreats..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="border-0 bg-transparent shadow-none focus-visible:ring-0 px-0 placeholder:text-muted-foreground/60"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && searchQuery.trim()) {
                      window.location.href = `/retreats?search=${encodeURIComponent(searchQuery.trim())}`;
                    }
                  }}
                />
              </div>
              <Link href={searchQuery.trim() ? `/retreats?search=${encodeURIComponent(searchQuery.trim())}` : "/retreats"}>
                <Button size="lg" className="w-full sm:w-auto cursor-pointer">
                  <Search className="h-4 w-4 mr-1" />
                  Search
                </Button>
              </Link>
            </div>

            <div className="flex flex-wrap justify-center gap-6 mt-10 text-sm text-primary-foreground/70">
              <span className="flex items-center gap-1.5">
                <Shield className="h-4 w-4" /> Verified listings
              </span>
              <span className="flex items-center gap-1.5">
                <Star className="h-4 w-4" /> Guest reviews
              </span>
              <span className="flex items-center gap-1.5">
                <HeartHandshake className="h-4 w-4" /> Easy booking
              </span>
            </div>
          </div>
        </div>
      </section>

      {error ? (
        <div className="container mx-auto px-4 py-12 text-center">
          <p className="text-destructive">{error}</p>
        </div>
      ) : (
        <>
          {/* Featured Retreats */}
          <section className="container mx-auto px-4 py-12 md:py-16">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-3">
                <Star className="h-3.5 w-3.5 fill-primary/30" />
                Featured
              </div>
              <h2 className="text-3xl md:text-4xl font-bold">
                <span className="bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                  Popular Retreats
                </span>
              </h2>
              <p className="text-muted-foreground mt-2">
                Handpicked stays our guests love most
              </p>
              <Link
                href="/retreats"
                className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline mt-3"
              >
                View all <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="space-y-3">
                    <Skeleton className="h-52 w-full rounded-xl" />
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ))}
              </div>
            ) : featuredRetreats.length > 0 ? (
              <>
                <RetreatGrid
                  retreats={featuredRetreats}
                  categories={categories}
                  imageUrlMap={new Map(featuredRetreats.map((r, i) => [r.retreat_id, STATIC_RETREAT_IMAGES[i % STATIC_RETREAT_IMAGES.length]]))}
                  renderWishlistButton={(id) => (
                    <WishlistButton
                      retreatId={id}
                      isWishlisted={wishlistIds.has(id)}
                      variant="ghost"
                      className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white"
                      onToggle={(newState) => {
                        setWishlistIds((prev) => {
                          const next = new Set(prev);
                          if (newState) next.add(id);
                          else next.delete(id);
                          return next;
                        });
                      }}
                    />
                  )}
                />
                <div className="text-center mt-10 sm:hidden">
                  <Link href="/retreats">
                    <Button variant="outline" size="lg">
                      View All Retreats <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </>
            ) : null}
          </section>

          {/* Why Choose Us */}
          <section className="pb-8 md:pb-12">
            <div className="container mx-auto px-4">
              <div className="text-center mb-8 animate-fade-in-up">
                <h2 className="text-3xl md:text-4xl font-bold">Designed for Your Perfect Stay</h2>
                <p className="text-muted-foreground mt-3 max-w-2xl mx-auto text-lg">
                  We make finding and booking your ideal retreat effortless
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  {
                    icon: Search,
                    title: "Curated Selection",
                    desc: "Every retreat is handpicked for quality and experience",
                  },
                  {
                    icon: MapPin,
                    title: "Amazing Locations",
                    desc: "From mountain cabins to beachfront villas",
                  },
                  {
                    icon: Star,
                    title: "Real Reviews",
                    desc: "Honest feedback from verified guests",
                  },
                  {
                    icon: Users,
                    title: "24/7 Support",
                    desc: "We are here to help at every step",
                  },
                ].map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.title}
                      className="flex items-center gap-3 p-3.5 rounded-lg border transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md animate-fade-in-up bg-card border-border hover:bg-green-50 hover:border-green-200"
                      style={{ animationDelay: `${i * 80}ms` }}
                    >
                      <div className="shrink-0 w-9 h-9 rounded-lg flex items-center justify-center transition-colors duration-300 bg-primary/10 hover:bg-green-100">
                        <Icon className="h-4 w-4 text-primary hover:text-green-600" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium leading-tight">{item.title}</p>
                        <p className="text-xs text-muted-foreground leading-tight mt-0.5">{item.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 pt-4 border-t text-center animate-fade-in-up" style={{ animationDelay: "320ms" }}>
                <p className="text-green-800 text-sm bg-green-50 py-3 px-5 rounded-lg inline-block">
                  Members always get our best prices when{" "}
                  <Link href="/login" className="text-green-700 font-semibold underline underline-offset-2 hover:no-underline">
                    signed in
                  </Link>
                </p>
              </div>
            </div>
          </section>

          {/* Categories */}
          {categories.length > 0 && (
            <section className="container mx-auto px-4 pb-10 md:pb-14">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {categories.map((cat, index) => {
                  const src = CATEGORY_IMAGES[index % CATEGORY_IMAGES.length];
                  return (
                    <Link key={cat.category_id} href={`/retreats?category=${cat.category_id}`}>
                      <div className="group relative overflow-hidden rounded-2xl transition-all duration-500 hover:shadow-2xl">
                        <img
                          src={src}
                          alt={cat.name}
                          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-black/20" />
                        <div className="relative p-6 md:p-8 min-h-[220px] md:min-h-[260px] flex flex-col justify-end">
                          <h3 className="text-white text-xl md:text-2xl font-bold drop-shadow-lg">{cat.name}</h3>
                          {cat.description && (
                            <p className="text-white/70 text-sm mt-1 drop-shadow-md line-clamp-1">{cat.description}</p>
                          )}
                          <div className="mt-4 flex items-center gap-1.5 text-white/60 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            Explore <ArrowRight className="h-3 w-3" />
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          )}

          {/* List Your Property */}
          <section className="container mx-auto px-4 pb-10 md:pb-14">
            <div className="relative overflow-hidden rounded-2xl">
              <img
                src="https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1200&q=80"
                alt=""
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/50" />
              <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 25% 25%, white 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
              <div className="relative p-8 md:p-12 lg:p-16 flex flex-col lg:flex-row items-center justify-between gap-6">
                <div className="text-center lg:text-left">
                  <span className="inline-block px-3 py-1 rounded-full bg-white/20 text-white text-xs font-medium mb-3">
                    Owners
                  </span>
                  <h2 className="text-3xl md:text-4xl font-bold text-white">
                    List Your Property
                  </h2>
                  <p className="text-white/80 mt-2 max-w-lg text-lg">
                    Earn up to $10,000/month hosting your retreat. Zero setup fees, instant bookings, dedicated support.
                  </p>
                  <div className="flex flex-wrap items-center gap-4 mt-6">
                    <Link href="/list-your-property">
                      <Button size="lg" className="bg-white text-violet-600 hover:bg-white/90 font-semibold shadow-lg">
                        Get Started <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </Link>
                    <p className="text-white/60 text-xs">Free to list · No hidden fees</p>
                  </div>
                </div>
                <div className="shrink-0 text-center">
                  <div className="text-6xl md:text-7xl font-black text-white/30 leading-none">$$</div>
                  <p className="text-white/50 text-sm mt-1">EARN</p>
                </div>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="container mx-auto px-4 pb-10 md:pb-14">
            <div className="relative overflow-hidden rounded-2xl">
              <img
                src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&q=80"
                alt=""
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/50" />
              <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 25% 25%, white 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
              <div className="relative p-8 md:p-12 lg:p-16 flex flex-col lg:flex-row items-center justify-between gap-6">
                <div className="text-center lg:text-left">
                  <span className="inline-block px-3 py-1 rounded-full bg-white/20 text-white text-xs font-medium mb-3">
                    Join Today
                  </span>
                  <h2 className="text-3xl md:text-4xl font-bold text-white">
                    Ready to Escape?
                  </h2>
                  <p className="text-white/80 mt-2 max-w-lg text-lg">
                    Join thousands of happy travelers who found their perfect retreat.
                  </p>
                  <div className="flex flex-wrap items-center gap-4 mt-6">
                    <Link href="/retreats">
                      <Button size="lg" className="bg-white text-emerald-600 hover:bg-white/90 font-semibold shadow-lg">
                        Browse All Retreats <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </Link>
                    {!isAuthenticated && (
                      <Link href="/signup">
                        <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 hover:text-white">
                          Sign Up Free
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
                <div className="shrink-0 text-center">
                  <div className="text-6xl md:text-7xl font-black text-white/30 leading-none">GO</div>
                  <p className="text-white/50 text-sm mt-1">BOOK</p>
                </div>
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
