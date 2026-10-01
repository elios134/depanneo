import { distanceKm } from '@/domaine/distance';
import type { Position } from '@/domaine/lieux';
import type { Metier, Pro } from '@/domaine/pro';
import { adresseDe, emailDe, horairesDe, siteWebDe, villeDe } from './detailsOsm';

// Le serveur public principal est souvent surchargé : on essaie les suivants à la suite.
export const SERVEURS_OVERPASS = [
  'https://overpass-api.de/api/interpreter',
  'https://maps.mail.ru/osm/tools/overpass/api/interpreter',
  'https://overpass.private.coffee/api/interpreter',
];

const METIERS: Record<string, Metier> = { plumber: 'plombier', electrician: 'electricien' };

interface ElementOverpass {
  type: string;
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
}

export function construireRequete(p: Position, rayonKm: number): string {
  const autour = `(around:${Math.round(rayonKm * 1000)},${p.lat},${p.lon})`;
  return `[out:json][timeout:25];(nwr["craft"="plumber"]${autour};nwr["craft"="electrician"]${autour};);out center tags;`;
}

function metiersDe(tags: Record<string, string>): Metier[] {
  const valeurs = Object.entries(tags)
    .filter(([cle]) => cle === 'craft' || cle.startsWith('craft_'))
    .flatMap(([, valeur]) => valeur.split(';'))
    .map((v) => METIERS[v.trim()])
    .filter((m): m is Metier => Boolean(m));
  return [...new Set(valeurs)];
}

export function analyserReponse(donnees: unknown, depuis: Position): Pro[] {
  const elements = (donnees as { elements?: unknown } | null)?.elements;
  if (!Array.isArray(elements)) return [];
  const pros: Pro[] = [];
  for (const el of elements as (ElementOverpass | null)[]) {
    if (!el || typeof el !== 'object') continue;
    if (typeof el.type !== 'string' || (typeof el.id !== 'number' && typeof el.id !== 'string')) continue;
    const lat = el.lat ?? el.center?.lat;
    const lon = el.lon ?? el.center?.lon;
    if (typeof lat !== 'number' || typeof lon !== 'number' || !Number.isFinite(lat) || !Number.isFinite(lon)) continue;
    const tags = el.tags ?? {};
    const metiers = metiersDe(tags);
    if (metiers.length === 0) continue;
    const brut = tags.phone ?? tags['contact:phone'] ?? tags['contact:mobile'] ?? null;
    const telephone = (typeof brut === 'string' ? brut.split(';')[0].trim() : '') || null;
    if (!tags.name && !telephone) continue;
    pros.push({
      id: `${el.type}/${el.id}`,
      nom: tags.name ?? (metiers[0] === 'plombier' ? 'Plombier' : 'Électricien'),
      metiers,
      telephone,
      lat,
      lon,
      distanceKm: distanceKm(depuis, { lat, lon }),
      adresse: adresseDe(tags),
      siteWeb: siteWebDe(tags),
      email: emailDe(tags),
      horaires: horairesDe(tags),
      ville: villeDe(tags),
    });
  }
  return pros.sort((a, b) => a.distanceKm - b.distanceKm);
}
