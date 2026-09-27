import { get, post, patch, del, postForm } from "@/lib/api/client";
import { API_BASE_URL } from "@/lib/constants";
import type {
  RoomType,
  RoomTypeInput,
  RoomTypeUpdate,
  RetreatPackage,
  PackageInput,
  PackageUpdate,
} from "@/types/retreat-offerings";

// Room types

export async function getRoomTypes(retreatId: number): Promise<RoomType[]> {
  const response = await get<RoomType[]>(`/retreats/${retreatId}/room-types/`);
  return response.data ?? [];
}

export async function createRoomType(
  retreatId: number,
  payload: RoomTypeInput
): Promise<RoomType> {
  const response = await post<RoomType>(`/retreats/${retreatId}/room-types/`, payload, {
    auth: true,
  });
  return response.data;
}

export async function updateRoomType(
  retreatId: number,
  roomTypeId: number,
  payload: RoomTypeUpdate
): Promise<RoomType> {
  // The backend takes Json<UpdateRoomTypeSerializer>, so this is a JSON PATCH.
  // Sending an explicit `null` clears a nullable column server-side; omitting
  // the key leaves it untouched.
  const response = await patch<RoomType>(
    `/retreats/${retreatId}/room-types/${roomTypeId}/`,
    payload,
    { auth: true }
  );
  return response.data;
}

export async function deleteRoomType(retreatId: number, roomTypeId: number): Promise<void> {
  await del(`/retreats/${retreatId}/room-types/${roomTypeId}/`, { auth: true });
}

export async function uploadRoomTypeImage(
  retreatId: number,
  roomTypeId: number,
  file: File
): Promise<RoomType> {
  // routes/retreat_room_types.rs uses a `Multipart` extractor, so this must be
  // form-data under the field name `image`.
  const formData = new FormData();
  formData.append("image", file);
  const response = await postForm<RoomType>(
    `/retreats/${retreatId}/room-types/${roomTypeId}/image/`,
    formData,
    { auth: true }
  );
  return response.data;
}

/** Public URL for a room type photo, or `null` when the room has no photo. */
export function roomTypeImageUrl(retreatId: number, room: RoomType): string | null {
  if (!room.image_path) return null;
  return `${API_BASE_URL}/retreats/${retreatId}/room-types/${room.retreat_room_type_id}/image/`;
}

// Packages

export async function getPackages(retreatId: number): Promise<RetreatPackage[]> {
  const response = await get<RetreatPackage[]>(`/retreats/${retreatId}/packages/`);
  return response.data ?? [];
}

export async function createPackage(
  retreatId: number,
  payload: PackageInput
): Promise<RetreatPackage> {
  const response = await post<RetreatPackage>(`/retreats/${retreatId}/packages/`, payload, {
    auth: true,
  });
  return response.data;
}

export async function updatePackage(
  retreatId: number,
  packageId: number,
  payload: PackageUpdate
): Promise<RetreatPackage> {
  const response = await patch<RetreatPackage>(
    `/retreats/${retreatId}/packages/${packageId}/`,
    payload,
    { auth: true }
  );
  return response.data;
}

export async function deletePackage(retreatId: number, packageId: number): Promise<void> {
  await del(`/retreats/${retreatId}/packages/${packageId}/`, { auth: true });
}
