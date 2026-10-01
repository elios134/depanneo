import { distanceKm } from '@/domaine/distance';
import type { Position } from '@/domaine/lieux';
import type { Pro } from '@/domaine/pro';

export interface CachePros {
  pros: Pro[];
  centre: Position;
  rayonKm: number;
  date: number;
}

export const CLE_CACHE_PROS = 'depannmaison.pros';

const MINUTE = 60 * 1000;
const HEURE = 60 * MINUTE;
const JOUR = 24 * HEURE;

export function doitRafraichir(cache: CachePros | null, position: Position, rayonKm: number, maintenant: number): boolean {
  if (!cache) return true;
  if (cache.rayonKm !== rayonKm) return true;
  if (maintenant - cache.date > JOUR) return true;
  return distanceKm(cache.centre, position) > 1;
}

export function lireCache(brut: string | null): CachePros | null {
  if (!brut) return null;
  try {
    const c = JSON.parse(brut) as Partial<CachePros>;
    const valide =
      Array.isArray(c.pros) &&
      typeof c.centre?.lat === 'number' &&
      typeof c.centre?.lon === 'number' &&
      typeof c.rayonKm === 'number' &&
      typeof c.date === 'number';
    return valide ? (c as CachePros) : null;
  } catch {
    return null;
  }
}

export function ecrireCache(cache: CachePros): string {
  return JSON.stringify(cache);
}

export function ageTexte(date: number, maintenant: number): string {
  const ecart = maintenant - date;
  if (ecart < MINUTE) return "à l'instant";
  if (ecart < HEURE) return `il y a ${Math.floor(ecart / MINUTE)} min`;
  if (ecart < JOUR) return `il y a ${Math.floor(ecart / HEURE)} h`;
  const jours = Math.floor(ecart / JOUR);
  return `il y a ${jours} jour${jours > 1 ? 's' : ''}`;
}
