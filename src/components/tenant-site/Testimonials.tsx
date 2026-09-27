"use client";

import { useEffect, useState } from "react";
import { getReviews } from "@/lib/api/reviews";
import type { RetreatReview } from "@/types/review";
import { Star } from "lucide-react";

function Stars({ value }: { value: number }) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${i <= Math.round(value) ? "fill-[#b45309] text-[#b45309]" : "text-[#e7e0d2]"}`}
        />
      ))}
    </span>
  );
}

export function Testimonials({ retreatId }: { retreatId: number }) {
  const [reviews, setReviews] = useState<RetreatReview[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    getReviews(retreatId, { page: 1, page_size: 6 })
      .then((res) => {
        if (!cancelled) setReviews(res.items);
      })
      .catch(() => {
        if (!cancelled) setReviews([]);
      });
    return () => {
      cancelled = true;
    };
  }, [retreatId]);

  if (reviews == null || reviews.length === 0) return null;

  const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

  return (
    <section id="stories" className="scroll-mt-24 border-y ts-hairline bg-[#fffdf8]">
      <div className="mx-auto max-w-6xl px-5 py-20 md:py-28">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="ts-overline text-[#b45309]">Guest stories</p>
            <h2 className="ts-display mt-3 text-3xl font-medium leading-tight md:text-5xl">
              Loved by those who stayed
            </h2>
          </div>
          <p className="flex items-center gap-2 text-sm text-[#78716c]">
            <Stars value={avg} />
            {avg.toFixed(1)} average
          </p>
        </div>
        <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3">
          {reviews.slice(0, 3).map((review) => (
            <figure key={review.review_id} className="flex flex-col">
              <Stars value={review.rating} />
              <blockquote className="ts-display mt-4 flex-1 text-xl font-normal leading-snug text-[#44403c]">
                &ldquo;{(review.review ?? "").slice(0, 220)}
                {(review.review ?? "").length > 220 ? "…" : ""}&rdquo;
              </blockquote>
              <figcaption className="mt-4 text-[13px] uppercase tracking-[0.14em] text-[#a8a29e]">
                Verified guest
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
