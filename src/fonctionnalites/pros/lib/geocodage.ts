import type { Lieu } from '@/domaine/lieux';

interface Entite {
  geometry?: { coordinates?: unknown[] };
  properties?: { city?: string; name?: string; label?: string; postcode?: string };
}

export function construireUrlGeocodage(recherche: string): string {
  return `https://data.geopf.fr/geocodage/search?q=${encodeURIComponent(recherche.trim())}&type=municipality&limit=5`;
}

export function analyserGeocodage(donnees: unknown): Lieu[] {
  const entites = (donnees as { features?: unknown } | null)?.features;
  if (!Array.isArray(entites)) return [];
  return (entites as Entite[]).flatMap((e) => {
    const [lon, lat] = e.geometry?.coordinates ?? [];
    const nom = e.properties?.city ?? e.properties?.name ?? e.properties?.label;
    if (typeof lat !== 'number' || typeof lon !== 'number' || !nom) return [];
    return [{ nom, codePostal: e.properties?.postcode ?? '', position: { lat, lon } }];
  });
}
