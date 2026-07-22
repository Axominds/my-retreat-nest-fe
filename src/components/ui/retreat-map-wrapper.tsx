"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

const StaticMap = dynamic(
  () =>
    import("@/components/ui/static-map").then((m) => ({
      default: m.StaticMap,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="h-48 rounded-lg border bg-muted flex items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    ),
  },
);

interface RetreatMapWrapperProps {
  latitude: number;
  longitude: number;
  address?: string | null;
}

export function RetreatMapWrapper({
  latitude,
  longitude,
  address,
}: RetreatMapWrapperProps) {
  return (
    <StaticMap latitude={latitude} longitude={longitude} address={address} />
  );
}
