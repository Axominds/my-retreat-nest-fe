"use client";

import { useEffect, useRef, useState } from "react";
import { getAmenities, setRetreatAmenities } from "@/lib/api/amenities";
import { getRetreat } from "@/lib/api/retreats";
import { useTenantAdmin } from "@/components/tenant/tenant-admin-provider";
import type { Amenity } from "@/types/amenity";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AmenityChipSelector } from "@/components/admin/amenity-chip-selector";
import { ApiError } from "@/lib/api/client";
import { toast } from "sonner";
import { Save, Loader2 } from "lucide-react";

export default function TenantAdminAmenitiesPage() {
  const { retreatId } = useTenantAdmin();
  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const fetched = useRef(false);

  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;
    Promise.all([getAmenities({ page_size: 100 }), getRetreat(retreatId)])
      .then(([all, retreat]) => {
        setAmenities(all.items ?? all);
        setSelected(retreat.amenities?.map((a) => a.amenity_id) ?? []);
      })
      .catch(() => toast.error("Failed to load amenities"))
      .finally(() => setLoading(false));
  }, [retreatId]);

  async function handleSave() {
    setSaving(true);
    try {
      await setRetreatAmenities(retreatId, selected);
      toast.success("Amenities updated.");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-48 w-full rounded-lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold">Amenities</h1>
        <p className="text-sm text-muted-foreground">
          Choose what your retreat offers — shown on your site.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Offered amenities</CardTitle>
          <CardDescription>{selected.length} selected</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <AmenityChipSelector
            amenities={amenities}
            selected={selected}
            onChange={setSelected}
          />
          <Button onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            Save amenities
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
