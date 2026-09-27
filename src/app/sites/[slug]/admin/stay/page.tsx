"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  createPackage,
  createRoomType,
  deletePackage,
  deleteRoomType,
  getPackages,
  getRoomTypes,
  roomTypeImageUrl,
  updatePackage,
  updateRoomType,
  uploadRoomTypeImage,
} from "@/lib/api/retreat-offerings";
import { useTenantAdmin } from "@/components/tenant/tenant-admin-provider";
import type {
  PackageInput,
  RetreatPackage,
  RoomType,
  RoomTypeInput,
} from "@/types/retreat-offerings";
import { formatPrice, splitList } from "@/types/retreat-offerings";
import { ApiError } from "@/lib/api/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  BedDouble,
  ExternalLink,
  ImageIcon,
  Loader2,
  Pencil,
  Plus,
  Sparkles,
  Trash2,
} from "lucide-react";

/** Room form state. Empty numeric/price strings mean "not set". */
interface RoomForm {
  name: string;
  description: string;
  size_sqm: string;
  max_guests: string;
  bed_configuration: string;
  amenities: string;
  price_per_night: string;
  is_featured: boolean;
}

const EMPTY_ROOM: RoomForm = {
  name: "",
  description: "",
  size_sqm: "",
  max_guests: "",
  bed_configuration: "",
  amenities: "",
  price_per_night: "",
  is_featured: false,
};

interface PackageForm {
  name: string;
  description: string;
  room_type_id: string;
  duration_nights: string;
  includes: string;
  price: string;
  is_featured: boolean;
}

const EMPTY_PACKAGE: PackageForm = {
  name: "",
  description: "",
  room_type_id: "",
  duration_nights: "",
  includes: "",
  price: "",
  is_featured: false,
};

/** `""` for a blank input, else a trimmed number, else `null` to clear. */
function toNullableNumber(value: string): number | null {
  const trimmed = value.trim();
  if (trimmed === "") return null;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
}

/** Trims, and maps `""` to `null` so the API stores SQL NULL. */
function toNullableText(value: string): string | null {
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

/**
 * `display_order` is excluded so an edit can't silently reshuffle the public
 * ordering; only creation sets it.
 */
function toRoomPayload(form: RoomForm): Omit<RoomTypeInput, "display_order"> {
  return {
    name: form.name.trim(),
    description: toNullableText(form.description),
    size_sqm: toNullableNumber(form.size_sqm),
    max_guests: toNullableNumber(form.max_guests),
    bed_configuration: toNullableText(form.bed_configuration),
    amenities: toNullableText(form.amenities),
    price_per_night: toNullableText(form.price_per_night),
    is_featured: form.is_featured,
  };
}

function toPackagePayload(form: PackageForm): Omit<PackageInput, "display_order"> {
  return {
    name: form.name.trim(),
    description: toNullableText(form.description),
    room_type_id: toNullableNumber(form.room_type_id),
    duration_nights: toNullableNumber(form.duration_nights),
    includes: toNullableText(form.includes),
    price: toNullableText(form.price),
    is_featured: form.is_featured,
  };
}

/** Text/number inputs are coerced back to strings so React never warns. */
function roomToForm(room: RoomType): RoomForm {
  return {
    name: room.name,
    description: room.description ?? "",
    size_sqm: room.size_sqm != null ? String(room.size_sqm) : "",
    max_guests: room.max_guests != null ? String(room.max_guests) : "",
    bed_configuration: room.bed_configuration ?? "",
    amenities: room.amenities ?? "",
    price_per_night: room.price_per_night ?? "",
    is_featured: room.is_featured,
  };
}

function packageToForm(pkg: RetreatPackage): PackageForm {
  return {
    name: pkg.name,
    description: pkg.description ?? "",
    room_type_id: pkg.room_type_id != null ? String(pkg.room_type_id) : "",
    duration_nights: pkg.duration_nights != null ? String(pkg.duration_nights) : "",
    includes: pkg.includes ?? "",
    price: pkg.price ?? "",
    is_featured: pkg.is_featured,
  };
}

export default function TenantAdminStayPage() {
  const { retreatId, slug } = useTenantAdmin();
  const [rooms, setRooms] = useState<RoomType[]>([]);
  const [packages, setPackages] = useState<RetreatPackage[]>([]);
  const [loading, setLoading] = useState(true);

  // Dialogs
  const [roomDialog, setRoomDialog] = useState<{ open: boolean; room: RoomType | null }>({
    open: false,
    room: null,
  });
  const [packageDialog, setPackageDialog] = useState<{
    open: boolean;
    pkg: RetreatPackage | null;
  }>({ open: false, pkg: null });

  const [roomForm, setRoomForm] = useState<RoomForm>(EMPTY_ROOM);
  const [packageForm, setPackageForm] = useState<PackageForm>(EMPTY_PACKAGE);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [uploadingId, setUploadingId] = useState<number | null>(null);
  const fileInputRef = useRef<Record<number, HTMLInputElement | null>>({});
  const fetched = useRef(false);

  const load = useCallback(async () => {
    const [loadedRooms, loadedPackages] = await Promise.all([
      getRoomTypes(retreatId),
      getPackages(retreatId),
    ]);
    setRooms(loadedRooms);
    setPackages(loadedPackages);
  }, [retreatId]);

  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;
    load()
      .catch(() => toast.error("Failed to load rooms and packages"))
      .finally(() => setLoading(false));
  }, [load]);

  function openAddRoom() {
    setRoomForm(EMPTY_ROOM);
    setRoomDialog({ open: true, room: null });
  }

  function openEditRoom(room: RoomType) {
    setRoomForm(roomToForm(room));
    setRoomDialog({ open: true, room });
  }

  function openAddPackage() {
    setPackageForm(EMPTY_PACKAGE);
    setPackageDialog({ open: true, pkg: null });
  }

  function openEditPackage(pkg: RetreatPackage) {
    setPackageForm(packageToForm(pkg));
    setPackageDialog({ open: true, pkg });
  }

  async function saveRoom() {
    if (!roomForm.name.trim()) {
      toast.error("Room name is required");
      return;
    }
    setSaving(true);
    try {
      if (roomDialog.room) {
        const updated = await updateRoomType(
          retreatId,
          roomDialog.room.retreat_room_type_id,
          toRoomPayload(roomForm)
        );
        setRooms((prev) =>
          prev.map((room) =>
            room.retreat_room_type_id === updated.retreat_room_type_id ? updated : room
          )
        );
        toast.success("Room updated");
      } else {
        const created = await createRoomType(retreatId, {
          ...toRoomPayload(roomForm),
          display_order: 0,
        });
        setRooms((prev) => [...prev, created]);
        toast.success("Room added");
      }
      setRoomDialog({ open: false, room: null });
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to save room");
    } finally {
      setSaving(false);
    }
  }

  async function savePackage() {
    if (!packageForm.name.trim()) {
      toast.error("Package name is required");
      return;
    }
    setSaving(true);
    try {
      if (packageDialog.pkg) {
        const updated = await updatePackage(
          retreatId,
          packageDialog.pkg.retreat_package_id,
          toPackagePayload(packageForm)
        );
        setPackages((prev) =>
          prev.map((pkg) =>
            pkg.retreat_package_id === updated.retreat_package_id ? updated : pkg
          )
        );
        toast.success("Package updated");
      } else {
        const created = await createPackage(retreatId, {
          ...toPackagePayload(packageForm),
          display_order: 0,
        });
        setPackages((prev) => [...prev, created]);
        toast.success("Package added");
      }
      setPackageDialog({ open: false, pkg: null });
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to save package");
    } finally {
      setSaving(false);
    }
  }

  async function removeRoom(room: RoomType) {
    const linked: number = packages.filter(
      (pkg) => pkg.room_type_id === room.retreat_room_type_id
    ).length;
    const warning = linked
      ? ` ${linked} package${linked === 1 ? "" : "s"} will be kept but will no longer reference a room.`
      : "";
    if (!window.confirm(`Delete “${room.name}”?${warning}`)) return;

    setBusyId(room.retreat_room_type_id);
    try {
      await deleteRoomType(retreatId, room.retreat_room_type_id);
      setRooms((prev) => prev.filter((r) => r.retreat_room_type_id !== room.retreat_room_type_id));
      // A deleted room detaches its packages server-side; refresh so the UI
      // stops showing a name that no longer resolves.
      if (linked) await load();
      toast.success("Room deleted");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to delete room");
    } finally {
      setBusyId(null);
    }
  }

  async function removePackage(pkg: RetreatPackage) {
    if (!window.confirm(`Delete “${pkg.name}”?`)) return;

    setBusyId(pkg.retreat_package_id);
    try {
      await deletePackage(retreatId, pkg.retreat_package_id);
      setPackages((prev) =>
        prev.filter((p) => p.retreat_package_id !== pkg.retreat_package_id)
      );
      toast.success("Package deleted");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to delete package");
    } finally {
      setBusyId(null);
    }
  }

  async function toggleRoomFeatured(room: RoomType) {
    setBusyId(room.retreat_room_type_id);
    try {
      const updated = await updateRoomType(retreatId, room.retreat_room_type_id, {
        is_featured: !room.is_featured,
      });
      setRooms((prev) =>
        prev.map((r) => (r.retreat_room_type_id === updated.retreat_room_type_id ? updated : r))
      );
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to update room");
    } finally {
      setBusyId(null);
    }
  }

  async function togglePackageFeatured(pkg: RetreatPackage) {
    setBusyId(pkg.retreat_package_id);
    try {
      const updated = await updatePackage(retreatId, pkg.retreat_package_id, {
        is_featured: !pkg.is_featured,
      });
      setPackages((prev) =>
        prev.map((p) => (p.retreat_package_id === updated.retreat_package_id ? updated : p))
      );
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to update package");
    } finally {
      setBusyId(null);
    }
  }

  async function handleRoomImage(room: RoomType, file: File) {
    setUploadingId(room.retreat_room_type_id);
    try {
      const updated = await uploadRoomTypeImage(retreatId, room.retreat_room_type_id, file);
      setRooms((prev) =>
        prev.map((r) => (r.retreat_room_type_id === updated.retreat_room_type_id ? updated : r))
      );
      toast.success("Photo updated");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to upload photo");
    } finally {
      setUploadingId(null);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-4 w-96" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold md:text-3xl">Rooms &amp; Packages</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            What guests can book. Rooms describe the individual spaces; packages
            describe themed stays sold against them.
          </p>
        </div>
        <Button
          variant="outline"
          className="shrink-0"
          render={<Link href={`/sites/${slug}`} target="_blank" />}
        >
          <ExternalLink className="mr-2 h-4 w-4" />
          Preview site
        </Button>
      </div>

      {/* Room types */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <CardTitle>Room types</CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="tabular-nums text-xs">
                {rooms.length}
              </Badge>
              <Button size="sm" onClick={openAddRoom}>
                <Plus className="mr-1.5 h-3.5 w-3.5" />
                Add room
              </Button>
            </div>
          </div>
          <CardDescription>
            The one marked featured is highlighted on your site.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {rooms.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed py-12 text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted">
                <BedDouble className="h-5 w-5 text-muted-foreground" />
              </span>
              <p className="text-sm font-medium">No rooms yet</p>
              <p className="max-w-sm text-sm text-muted-foreground">
                Add your first room type to start building the Stay section of
                your site.
              </p>
              <Button variant="outline" size="sm" className="mt-2" onClick={openAddRoom}>
                <Plus className="mr-1.5 h-3.5 w-3.5" />
                Add room
              </Button>
            </div>
          ) : (
            rooms.map((room) => {
              const imageUrl = roomTypeImageUrl(retreatId, room);
              const amenityList = splitList(room.amenities);
              const price = formatPrice(room.price_per_night);
              const busy = busyId === room.retreat_room_type_id;
              return (
                <div
                  key={room.retreat_room_type_id}
                  className="flex flex-col gap-4 rounded-lg border p-4 sm:flex-row"
                >
                  {/* Photo */}
                  <div className="relative h-28 w-full shrink-0 overflow-hidden rounded-lg bg-muted sm:h-24 sm:w-32">
                    {imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={`${imageUrl}?v=${room.image_path}`}
                        alt={room.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <ImageIcon className="h-5 w-5 text-muted-foreground" />
                      </div>
                    )}
                    {uploadingId === room.retreat_room_type_id && (
                      <div className="absolute inset-0 flex items-center justify-center bg-background/70">
                        <Loader2 className="h-4 w-4 animate-spin" />
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold">{room.name}</h3>
                      {room.is_featured && (
                        <Badge className="gap-1 text-xs">
                          <Sparkles className="h-3 w-3" />
                          Featured
                        </Badge>
                      )}
                      {price && (
                        <span className="text-sm font-medium tabular-nums text-muted-foreground">
                          {price} / night
                        </span>
                      )}
                    </div>
                    {room.description && (
                      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                        {room.description}
                      </p>
                    )}
                    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                      {room.size_sqm != null && <span>{room.size_sqm} m&sup2;</span>}
                      {room.max_guests != null && (
                        <span>Up to {room.max_guests} guests</span>
                      )}
                      {room.bed_configuration && <span>{room.bed_configuration}</span>}
                    </div>
                    {amenityList.length > 0 && (
                      <p className="mt-1.5 line-clamp-1 text-xs text-muted-foreground">
                        {amenityList.join(" · ")}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex shrink-0 items-start gap-1.5">
                    <input
                      ref={(el) => {
                        fileInputRef.current[room.retreat_room_type_id] = el;
                      }}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) void handleRoomImage(room, file);
                        e.target.value = "";
                      }}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={uploadingId === room.retreat_room_type_id}
                      onClick={() =>
                        fileInputRef.current[room.retreat_room_type_id]?.click()
                      }
                    >
                      <ImageIcon className="mr-1.5 h-3.5 w-3.5" />
                      {room.image_path ? "Replace" : "Add photo"}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={room.is_featured ? "Unfeature room" : "Feature room"}
                      title={room.is_featured ? "Remove featured" : "Mark as featured"}
                      disabled={busy}
                      onClick={() => void toggleRoomFeatured(room)}
                    >
                      <Sparkles
                        className={
                          room.is_featured
                            ? "h-3.5 w-3.5 text-primary"
                            : "h-3.5 w-3.5 text-muted-foreground"
                        }
                      />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Edit room"
                      onClick={() => openEditRoom(room)}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Delete room"
                      disabled={busy}
                      onClick={() => void removeRoom(room)}
                      className="hover:text-destructive"
                    >
                      {busy ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="h-3.5 w-3.5" />
                      )}
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>

      {/* Packages */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <CardTitle>Packages</CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="tabular-nums text-xs">
                {packages.length}
              </Badge>
              <Button size="sm" onClick={openAddPackage}>
                <Plus className="mr-1.5 h-3.5 w-3.5" />
                Add package
              </Button>
            </div>
          </div>
          <CardDescription>
            A package can point at one of your rooms. The featured package is
            promoted on your site.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {packages.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed py-12 text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted">
                <Sparkles className="h-5 w-5 text-muted-foreground" />
              </span>
              <p className="text-sm font-medium">No packages yet</p>
              <p className="max-w-sm text-sm text-muted-foreground">
                Packages are multi-night or themed stays. They work on their
                own, or linked to a room above.
              </p>
              <Button variant="outline" size="sm" className="mt-2" onClick={openAddPackage}>
                <Plus className="mr-1.5 h-3.5 w-3.5" />
                Add package
              </Button>
            </div>
          ) : (
            packages.map((pkg) => {
              const includeList = splitList(pkg.includes);
              const price = formatPrice(pkg.price);
              const busy = busyId === pkg.retreat_package_id;
              return (
                <div key={pkg.retreat_package_id} className="flex flex-col gap-4 rounded-lg border p-4 sm:flex-row">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold">{pkg.name}</h3>
                      {pkg.is_featured && (
                        <Badge className="gap-1 text-xs">
                          <Sparkles className="h-3 w-3" />
                          Featured
                        </Badge>
                      )}
                      {pkg.duration_nights != null && (
                        <Badge variant="secondary" className="text-xs">
                          {pkg.duration_nights}{" "}
                          {pkg.duration_nights === 1 ? "night" : "nights"}
                        </Badge>
                      )}
                      {price && (
                        <span className="text-sm font-medium tabular-nums text-muted-foreground">
                          {price}
                        </span>
                      )}
                    </div>
                    {pkg.description && (
                      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                        {pkg.description}
                      </p>
                    )}
                    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                      {pkg.room_type_name ? (
                        <span className="inline-flex items-center gap-1">
                          <BedDouble className="h-3 w-3" />
                          {pkg.room_type_name}
                        </span>
                      ) : (
                        <span className="italic">No room linked</span>
                      )}
                    </div>
                    {includeList.length > 0 && (
                      <p className="mt-1.5 line-clamp-1 text-xs text-muted-foreground">
                        {includeList.join(" · ")}
                      </p>
                    )}
                  </div>

                  <div className="flex shrink-0 items-start gap-1.5">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={pkg.is_featured ? "Unfeature package" : "Feature package"}
                      title={pkg.is_featured ? "Remove featured" : "Mark as featured"}
                      disabled={busy}
                      onClick={() => void togglePackageFeatured(pkg)}
                    >
                      <Sparkles
                        className={
                          pkg.is_featured
                            ? "h-3.5 w-3.5 text-primary"
                            : "h-3.5 w-3.5 text-muted-foreground"
                        }
                      />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Edit package"
                      onClick={() => openEditPackage(pkg)}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Delete package"
                      disabled={busy}
                      onClick={() => void removePackage(pkg)}
                      className="hover:text-destructive"
                    >
                      {busy ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="h-3.5 w-3.5" />
                      )}
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>

      {/* Room dialog */}
      <Dialog
        open={roomDialog.open}
        onOpenChange={(open) => setRoomDialog((prev) => ({ ...prev, open }))}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{roomDialog.room ? "Edit room" : "Add room"}</DialogTitle>
            <DialogDescription>
              What a guest gets with this room. Leave a field blank to leave it
              unset.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="room-name">Name</Label>
              <Input
                id="room-name"
                value={roomForm.name}
                onChange={(e) => setRoomForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Garden Suite"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="room-description">Description</Label>
              <Textarea
                id="room-description"
                value={roomForm.description}
                onChange={(e) =>
                  setRoomForm((f) => ({ ...f, description: e.target.value }))
                }
                rows={3}
                placeholder="A quiet suite opening onto the herb garden."
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="room-size">Size (m&sup2;)</Label>
                <Input
                  id="room-size"
                  type="number"
                  min={0}
                  value={roomForm.size_sqm}
                  onChange={(e) => setRoomForm((f) => ({ ...f, size_sqm: e.target.value }))}
                  placeholder="48"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="room-guests">Max guests</Label>
                <Input
                  id="room-guests"
                  type="number"
                  min={0}
                  value={roomForm.max_guests}
                  onChange={(e) => setRoomForm((f) => ({ ...f, max_guests: e.target.value }))}
                  placeholder="2"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="room-bed">Beds</Label>
              <Input
                id="room-bed"
                value={roomForm.bed_configuration}
                onChange={(e) =>
                  setRoomForm((f) => ({ ...f, bed_configuration: e.target.value }))
                }
                placeholder="1 king"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="room-amenities">In-room amenities</Label>
              <Textarea
                id="room-amenities"
                value={roomForm.amenities}
                onChange={(e) => setRoomForm((f) => ({ ...f, amenities: e.target.value }))}
                rows={2}
                placeholder="Private garden, Rain shower, Outdoor daybed"
              />
              <p className="text-xs text-muted-foreground">
                Separate each with a comma.
              </p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="room-price">Price per night</Label>
              <Input
                id="room-price"
                value={roomForm.price_per_night}
                onChange={(e) =>
                  setRoomForm((f) => ({ ...f, price_per_night: e.target.value }))
                }
                placeholder="18500"
                inputMode="decimal"
              />
            </div>

            <label className="flex items-center gap-2.5">
              <input
                type="checkbox"
                checked={roomForm.is_featured}
                onChange={(e) =>
                  setRoomForm((f) => ({ ...f, is_featured: e.target.checked }))
                }
                className="h-4 w-4 rounded border-border"
              />
              <span className="text-sm">Feature this room on my site</span>
            </label>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRoomDialog({ open: false, room: null })}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button onClick={() => void saveRoom()} disabled={saving}>
              {saving && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
              {roomDialog.room ? "Save changes" : "Add room"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Package dialog */}
      <Dialog
        open={packageDialog.open}
        onOpenChange={(open) => setPackageDialog((prev) => ({ ...prev, open }))}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {packageDialog.pkg ? "Edit package" : "Add package"}
            </DialogTitle>
            <DialogDescription>
              A themed or multi-night stay. Optionally tie it to one of your
              rooms.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="pkg-name">Name</Label>
              <Input
                id="pkg-name"
                value={packageForm.name}
                onChange={(e) => setPackageForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Wellness Weekend"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="pkg-description">Description</Label>
              <Textarea
                id="pkg-description"
                value={packageForm.description}
                onChange={(e) =>
                  setPackageForm((f) => ({ ...f, description: e.target.value }))
                }
                rows={3}
                placeholder="Two nights of yoga, spa and seasonal food."
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="pkg-room">Room</Label>
              <Select
                value={packageForm.room_type_id || "none"}
                onValueChange={(value) =>
                  setPackageForm((f) => ({
                    ...f,
                    room_type_id: value && value !== "none" ? value : "",
                  }))
                }
              >
                <SelectTrigger id="pkg-room">
                  {/* Explicit label: Base UI's SelectValue falls back to the raw
                      id when no item matches at render time. */}
                  <SelectValue placeholder="No specific room">
                    {packageForm.room_type_id
                      ? (rooms.find(
                          (room) =>
                            String(room.retreat_room_type_id) ===
                            packageForm.room_type_id
                        )?.name ?? "Unknown room — pick a new one")
                      : "No specific room"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No specific room</SelectItem>
                  {rooms.map((room) => (
                    <SelectItem
                      key={room.retreat_room_type_id}
                      value={String(room.retreat_room_type_id)}
                    >
                      {room.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="pkg-nights">Nights</Label>
                <Input
                  id="pkg-nights"
                  type="number"
                  min={0}
                  value={packageForm.duration_nights}
                  onChange={(e) =>
                    setPackageForm((f) => ({ ...f, duration_nights: e.target.value }))
                  }
                  placeholder="2"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="pkg-price">Price</Label>
                <Input
                  id="pkg-price"
                  value={packageForm.price}
                  onChange={(e) => setPackageForm((f) => ({ ...f, price: e.target.value }))}
                  placeholder="32000"
                  inputMode="decimal"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="pkg-includes">What&apos;s included</Label>
              <Textarea
                id="pkg-includes"
                value={packageForm.includes}
                onChange={(e) => setPackageForm((f) => ({ ...f, includes: e.target.value }))}
                rows={3}
                placeholder="Daily yoga, 60-min massage, All meals, Herb garden tour"
              />
              <p className="text-xs text-muted-foreground">
                Separate each with a comma.
              </p>
            </div>

            <label className="flex items-center gap-2.5">
              <input
                type="checkbox"
                checked={packageForm.is_featured}
                onChange={(e) =>
                  setPackageForm((f) => ({ ...f, is_featured: e.target.checked }))
                }
                className="h-4 w-4 rounded border-border"
              />
              <span className="text-sm">Feature this package on my site</span>
            </label>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setPackageDialog({ open: false, pkg: null })}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button onClick={() => void savePackage()} disabled={saving}>
              {saving && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
              {packageDialog.pkg ? "Save changes" : "Add package"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
