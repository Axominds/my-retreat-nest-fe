import type { Retreat } from "@/types/retreat";
import type { Category } from "@/types/category";
import { RetreatCard } from "@/components/retreats/retreat-card";

interface RetreatGridProps {
  retreats: Retreat[];
  categories: Category[];
  renderWishlistButton?: (retreatId: number) => React.ReactNode;
}

export function RetreatGrid({ retreats, categories, renderWishlistButton }: RetreatGridProps) {
  const categoryMap = new Map(
    categories.map((c) => [c.category_id, c.name])
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {retreats.map((retreat) => (
        <RetreatCard
          key={retreat.retreat_id}
          retreat={retreat}
          categoryName={categoryMap.get(retreat.category_id)}
          wishlistButton={renderWishlistButton?.(retreat.retreat_id)}
        />
      ))}
    </div>
  );
}
