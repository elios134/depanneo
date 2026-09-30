import type { Position } from './lieux';

const RAYON_TERRE_KM = 6371;
const radians = (degres: number) => (degres * Math.PI) / 180;

export function distanceKm(a: Position, b: Position): number {
  const dLat = radians(b.lat - a.lat);
  const dLon = radians(b.lon - a.lon);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(radians(a.lat)) * Math.cos(radians(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 2 * RAYON_TERRE_KM * Math.asin(Math.sqrt(h));
}

export function formaterDistance(km: number): string {
  if (km < 1) return `${Math.round((km * 1000) / 10) * 10} m`;
  return `${String(Math.round(km * 10) / 10).replace('.', ',')} km`;
}
