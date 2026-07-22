const NOMINATIM_BASE = "https://nominatim.openstreetmap.org";

interface NominatimResult {
  lat: string;
  lon: string;
  display_name: string;
}

interface ReverseResult {
  lat: string;
  lon: string;
  display_name: string;
}

export async function forwardGeocode(query: string): Promise<NominatimResult[]> {
  const res = await fetch(
    `${NOMINATIM_BASE}/search?q=${encodeURIComponent(query)}&format=json&limit=3&addressdetails=1`,
    { headers: { "Accept-Language": "en" } }
  );
  if (!res.ok) throw new Error("Forward geocoding failed");
  return res.json();
}

export async function reverseGeocode(
  lat: number,
  lon: number
): Promise<ReverseResult> {
  const res = await fetch(
    `${NOMINATIM_BASE}/reverse?lat=${lat}&lon=${lon}&format=json&addressdetails=1`,
    { headers: { "Accept-Language": "en" } }
  );
  if (!res.ok) throw new Error("Reverse geocoding failed");
  return res.json();
}
