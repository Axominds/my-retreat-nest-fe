import Link from "next/link";
import { APP_URL } from "@/lib/constants";

export default function TenantNotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4 py-16">
      <h1 className="text-4xl font-bold mb-3">Page not found</h1>
      <p className="text-muted-foreground mb-6 max-w-md">
        This retreat page doesn&apos;t exist or isn&apos;t published yet.
      </p>
      <div className="flex items-center gap-3">
        <Link
          href="/"
          className="inline-flex h-10 items-center px-4 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90"
        >
          Back to home
        </Link>
        <Link
          href={APP_URL}
          className="inline-flex h-10 items-center px-4 rounded-xl border text-sm font-medium hover:bg-muted"
        >
          Browse all retreats
        </Link>
      </div>
    </div>
  );
}
