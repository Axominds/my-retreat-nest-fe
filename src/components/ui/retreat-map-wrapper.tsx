"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { Loader2, MapPin } from "lucide-react";

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
  const [selectedAddress, setSelectedAddress] = useState(address ?? null);

  return (
    <div className="space-y-3">
      {(selectedAddress ?? address) && (
        <div className="flex items-start gap-3 text-sm">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </div>
          <span className="mt-1.5 text-muted-foreground">
            {selectedAddress ?? address}
          </span>
        </div>
      )}
      <StaticMap
        latitude={latitude}
        longitude={longitude}
        address={address}
        onLocationSelect={(data) => setSelectedAddress(data.address)}
      />
    </div>
  );
}
