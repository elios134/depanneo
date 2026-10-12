import { distanceKm } from '@/domaine/distance';
import type { Position } from '@/domaine/lieux';
import type { Metier, Pro } from '@/domaine/pro';
import { casseTitre } from './nomPro';

// API Recherche d'entreprises de l'État (données INSEE Sirene), 7 requêtes par seconde au maximum.
export const URL_REGISTRE = 'https://recherche-entreprises.api.gouv.fr/near_point';
export const CODES_NAF = ['43.22A', '43.21A'] as const;
// Codes de la nomenclature NAF 2025 (en vigueur au 01/01/2027) : refusés par l'API au 09/10/2026.
export const CODES_NAF_2025 = ['43.22G', '43.21G'] as const;
export const PAR_PAGE = 25;
const RAYONS = [1, 2, 5, 10, 20, 50];

export function construireUrlRegistre(p: Position, rayonKm: number, codes: readonly string[], page: number): string {
  return (
    `${URL_REGISTRE}?lat=${p.lat}&long=${p.lon}&radius=${rayonKm}` +
    `&activite_principale=${encodeURIComponent(codes.join(','))}&per_page=${PAR_PAGE}&page=${page}`
  );
}

/** Rayons essayés l'un après l'autre : d'abord tout près, jusqu'au rayon des réglages. */
export function rayonsEssai(rayonKm: number): number[] {
  return [...RAYONS.filter((r) => r < rayonKm), Math.min(rayonKm, 50)];
}

export function metierNaf(code: unknown): Metier | null {
  if (code === '43.22A' || code === '43.22G') return 'plombier';
  if (code === '43.21A' || code === '43.21G') return 'electricien';
  return null;
}

interface Etablissement {
  siret?: unknown;
  activite_principale?: unknown;
  etat_administratif?: unknown;
  latitude?: unknown;
  longitude?: unknown;
  code_postal?: unknown;
  adresse?: unknown;
  libelle_commune?: unknown;
  liste_enseignes?: unknown;
  nom_commercial?: unknown;
  date_creation?: unknown;
}

interface Entreprise {
  nom_complet?: unknown;
  activite_principale?: unknown;
  matching_etablissements?: unknown;
}

const texte = (valeur: unknown): string | null => (typeof valeur === 'string' && valeur.trim() ? valeur.trim() : null);

function nomAffiche(entreprise: Entreprise, etab: Etablissement): string {
  const enseigne = Array.isArray(etab.liste_enseignes) ? texte(etab.liste_enseignes[0]) : null;
  const complet = texte(entreprise.nom_complet)?.replace(/\s*\(.*\)\s*$/, '').trim();
  return casseTitre(enseigne ?? texte(etab.nom_commercial) ?? (complet || 'Artisan'));
}

/** Établissements ouverts, en France, dans le rayon ; total = nombre d'entreprises annoncé par l'API. */
export function analyserRegistre(donnees: unknown, depuis: Position, rayonKm: number): { pros: Pro[]; total: number } {
  const brut = donnees as { results?: unknown; total_results?: unknown } | null;
  const total = typeof brut?.total_results === 'number' ? brut.total_results : 0;
  if (!Array.isArray(brut?.results)) return { pros: [], total };
  const pros: Pro[] = [];
  for (const entreprise of brut.results as (Entreprise | null)[]) {
    if (!entreprise || typeof entreprise !== 'object' || !Array.isArray(entreprise.matching_etablissements)) continue;
    for (const etab of entreprise.matching_etablissements as (Etablissement | null)[]) {
      if (!etab || typeof etab !== 'object' || etab.etat_administratif !== 'A') continue;
      const siret = texte(etab.siret);
      const lat = Number(etab.latitude);
      const lon = Number(etab.longitude);
      const codePostal = texte(etab.code_postal);
      const metier = metierNaf(etab.activite_principale ?? entreprise.activite_principale);
      if (!siret || !metier || etab.latitude == null || etab.longitude == null) continue;
      if (!Number.isFinite(lat) || !Number.isFinite(lon) || !codePostal || !/^\d{5}$/.test(codePostal)) continue;
      const distance = distanceKm(depuis, { lat, lon });
      if (distance > rayonKm) continue;
      const annee = Number(texte(etab.date_creation)?.slice(0, 4));
      const adresse = texte(etab.adresse);
      const ville = texte(etab.libelle_commune);
      pros.push({
        id: `registre/${siret}`,
        source: 'registre',
        siret,
        nom: nomAffiche(entreprise, etab),
        metiers: [metier],
        telephone: null,
        lat,
        lon,
        distanceKm: distance,
        adresse: adresse ? casseTitre(adresse) : null,
        ville: ville ? casseTitre(ville) : null,
        anneeCreation: Number.isInteger(annee) && annee > 1800 ? annee : null,
      });
    }
  }
  return { pros, total };
}
