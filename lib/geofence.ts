/**
 * Calculate distance in meters between two GPS coordinates.
 * Uses Haversine formula.
 */
export function haversineDistanceMeters(
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number {
  const R = 6371000; // Earth radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lng2 - lng1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) ** 2 +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export interface GeofenceZone {
  name: string;
  lat: number;
  lng: number;
  radiusMeters: number;
}

/**
 * Check if coords fall within any registered geofence zone.
 */
export function isWithinGeofence(
  userLat: number,
  userLng: number,
  zones: GeofenceZone[]
): { valid: boolean; zone: GeofenceZone | null; distanceMeters: number } {
  for (const zone of zones) {
    const distance = haversineDistanceMeters(userLat, userLng, zone.lat, zone.lng);
    if (distance <= zone.radiusMeters) {
      return { valid: true, zone, distanceMeters: distance };
    }
  }
  return { valid: false, zone: null, distanceMeters: Infinity };
}
