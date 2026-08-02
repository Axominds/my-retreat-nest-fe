import Link from "next/link";
import { Button } from "@/components/ui/button";
import { TreePine, ArrowRight, Compass } from "lucide-react";

export default function NotFound() {
  return (
    <div className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
      {/* Decorative background */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.4) 1px, transparent 1px), radial-gradient(circle at 80% 60%, rgba(255,255,255,0.3) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <div className="container mx-auto px-4 py-16 relative text-center animate-fade-in-up">
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-primary/10 ring-8 ring-primary/5">
              <TreePine className="h-12 w-12 text-primary" />
            </div>
            <div className="absolute -bottom-2 -right-2 flex h-10 w-10 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
              <Compass className="h-5 w-5" />
            </div>
          </div>
        </div>

        <div className="mb-3">
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider">
            Lost in the woods?
          </span>
        </div>

        <h1 className="text-7xl md:text-9xl font-black tracking-tight">
          <span className="bg-gradient-to-r from-primary via-emerald-600 to-teal-600 bg-clip-text text-transparent">
            404
          </span>
        </h1>

        <p className="mt-4 text-xl md:text-2xl font-semibold">
          This trail doesn&apos;t exist
        </p>
        <p className="mt-2 text-muted-foreground max-w-md mx-auto">
          The page you&apos;re looking for has wandered off the beaten path.
          Let&apos;s get you back to your retreat.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8">
          <Link href="/">
            <Button size="lg" className="rounded-xl px-8 shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transition-shadow">
              Go Home
            </Button>
          </Link>
          <Link href="/retreats">
            <Button
              size="lg"
              variant="outline"
              className="rounded-xl px-8"
            >
              Browse Retreats <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
