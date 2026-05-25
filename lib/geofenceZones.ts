import { GeofenceZone } from './geofence';

/**
 * Geofence zones configuration.
 * In production, these should be stored in MongoDB and managed via admin UI.
 * Shown here as constants for clarity.
 */

export const OFFICE_ZONES: GeofenceZone[] = [
  { name: 'Head Office',   lat: 23.0225, lng: 72.5714, radiusMeters: 150 },
  { name: 'Branch Office', lat: 23.0300, lng: 72.5800, radiusMeters: 100 },
];

export const FACTORY_ZONES: GeofenceZone[] = [
  { name: 'Factory Unit A', lat: 23.0400, lng: 72.5600, radiusMeters: 200 },
  { name: 'Factory Unit B', lat: 23.0500, lng: 72.5700, radiusMeters: 200 },
];
