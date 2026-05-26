import { GeofenceZone } from './geofence';

/**
 * Geofence zones configuration.
 * In production, these should be stored in MongoDB and managed via admin UI.
 * Shown here as constants for clarity.
 * 
 */

export const OFFICE_ZONES: GeofenceZone[] = [
  { name: 'Office', lat: 21.169007723509296, lng: 72.8316816282585, radiusMeters: 150 },
  { name: 'Home 902', lat: 21.14629032147555, lng: 72.78065647999507, radiusMeters: 100 },
];

export const FACTORY_ZONES: GeofenceZone[] = [
  { name: 'Factory', lat: 21.169007723509296, lng: 72.8316816282585, radiusMeters: 200 },
];
