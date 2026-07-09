import type { Retreat } from "@/types/retreat";
import type { Category } from "@/types/category";
import { RetreatCard } from "@/components/retreats/retreat-card";

interface RetreatGridProps {
  retreats: Retreat[];
  categories: Category[];
  renderWishlistButton?: (retreatId: number) => React.ReactNode;
  imageUrlMap?: Map<number, string>;
}

export function RetreatGrid({ retreats, categories, renderWishlistButton, imageUrlMap }: RetreatGridProps) {
  const categoryMap = new Map(
    categories.map((c) => [c.category_id, c.name])
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {retreats.map((retreat, index) => (
        <div
          key={retreat.retreat_id}
          className="animate-fade-in-up"
          style={{ animationDelay: `${index * 80}ms` }}
        >
          <RetreatCard
            retreat={retreat}
            categoryName={categoryMap.get(retreat.category_id)}
            wishlistButton={renderWishlistButton?.(retreat.retreat_id)}
            index={index}
            imageUrl={imageUrlMap?.get(retreat.retreat_id)}
          />
        </div>
      ))}
    </div>
  );
}
