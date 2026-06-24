import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getRetreats } from "@/lib/api/retreats";
import { getCategories } from "@/lib/api/categories";
import { RetreatCard } from "@/components/retreats/retreat-card";
import type { Retreat } from "@/types/retreat";

export default async function HomePage() {
  let featuredRetreats: Retreat[] = [];
  let categories: Awaited<ReturnType<typeof getCategories>> = [];
  let error: string | null = null;

  try {
    const [retreatResult, catResult] = await Promise.all([
      getRetreats({ page: 1, page_size: 6 }),
      getCategories(),
    ]);
    featuredRetreats = retreatResult.items;
    categories = catResult;
  } catch {
    error = "Failed to load data";
  }

  const categoryMap = new Map(categories.map((c) => [c.category_id, c.name]));

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
          {featuredRetreats.length > 0 && (
            <section className="container mx-auto px-4 py-12">
              <h2 className="text-2xl font-bold mb-6">Featured Retreats</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredRetreats.map((retreat) => (
                  <RetreatCard
                    key={retreat.retreat_id}
                    retreat={retreat}
                    categoryName={categoryMap.get(retreat.category_id)}
                  />
                ))}
              </div>
              <div className="text-center mt-8">
                <Link href="/retreats">
                  <Button variant="outline">View All Retreats</Button>
                </Link>
              </div>
            </section>
          )}

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
