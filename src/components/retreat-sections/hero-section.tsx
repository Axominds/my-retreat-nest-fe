import Link from "next/link";
import { ArrowLeft, ChevronRight, TreePine } from "lucide-react";
import type { Retreat } from "@/types/retreat";

interface HeroSectionProps {
  retreat: Retreat;
  heroImage: string | null;
  /** Back navigation. Hidden when omitted (tenant homepage). */
  backHref?: string;
  backLabel?: string;
  /** Breadcrumb root. Hidden when omitted (tenant homepage). */
  breadcrumbRootHref?: string;
  breadcrumbRootLabel?: string;
}

export function HeroSection({
  retreat,
  heroImage,
  backHref,
  backLabel = "Retreats",
  breadcrumbRootHref,
  breadcrumbRootLabel = "Retreats",
}: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden -mt-16 h-[calc(45vh+4rem)] md:h-[calc(55vh+4rem)]">
      {heroImage ? (
        <>
          <img
            src={heroImage}
            alt={retreat.name}
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-transparent" />
        </>
      ) : (
        <>
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/90 to-emerald-700" />
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.6) 1px, transparent 1px), radial-gradient(circle at 80% 60%, rgba(255,255,255,0.4) 1px, transparent 1px)",
              backgroundSize: "48px 48px",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/10" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-transparent" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4 opacity-90">
              <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-white/15 backdrop-blur-sm ring-8 ring-white/10">
                <TreePine className="h-12 w-12 text-white/90" />
              </div>
            </div>
          </div>
        </>
      )}

      {/* Back button */}
      {backHref && (
        <div className="absolute top-20 left-4 md:top-24 md:left-6 z-10">
          <Link
            href={backHref}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/15 backdrop-blur-sm text-white text-sm font-medium hover:bg-white/25 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            {backLabel}
          </Link>
        </div>
      )}

      {/* Hero content */}
      <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
        <div className="container mx-auto">
          {breadcrumbRootHref && (
            <div className="flex items-center gap-2 text-white/60 text-sm mb-3">
              <Link href={breadcrumbRootHref} className="hover:text-white/80 transition-colors">
                {breadcrumbRootLabel}
              </Link>
              <ChevronRight className="h-3 w-3" />
              <span className="text-white/80 truncate">{retreat.name}</span>
            </div>
          )}
          <h1 className="text-3xl md:text-5xl font-bold text-white drop-shadow-lg leading-tight">
            {retreat.name}
          </h1>
        </div>
      </div>
    </section>
  );
}
