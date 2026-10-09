import { distanceKm } from '@/domaine/distance';
import type { Position } from '@/domaine/lieux';
import type { LabelRge, Metier, Pro } from '@/domaine/pro';
import { casseTitre } from './nomPro';

// Annuaire des entreprises RGE de l'ADEME (Licence Ouverte, mis à jour chaque jour).
export const URL_RGE = 'https://data.ademe.fr/data-fair/api/v1/datasets/eo1n335dwa-ul7glxa7lm1ho/lines';

const CHAMPS = [
  'siret', 'nom_entreprise', 'adresse', 'code_postal', 'commune', 'latitude', 'longitude',
  'telephone', 'email', 'site_internet', 'nom_qualification', 'organisme', 'lien_date_fin',
].join(',');
// Premier tri côté serveur (mots en « OU ») ; le tri précis est fait par metiersRge.
const MOTS_METIERS = 'plomberie plombier chauffe-eau électricien radiateurs';

export function construireUrlRge(p: Position, rayonKm: number): string {
  const parametres: [string, string][] = [
    ['geo_distance', `${p.lon},${p.lat},${rayonKm}km`],
    ['sort', `_geo_distance:${p.lon}:${p.lat}`],
    ['qs', 'particulier:true'],
    ['q', MOTS_METIERS],
    ['q_fields', 'nom_qualification'],
    ['select', CHAMPS],
    ['size', '1000'],
  ];
  return `${URL_RGE}?${parametres.map(([cle, valeur]) => `${cle}=${encodeURIComponent(valeur)}`).join('&')}`;
}

export function metiersRge(qualification: string): Metier[] {
  const metiers: Metier[] = [];
  if (/plomberie|plombier|chauffe-eau/i.test(qualification)) metiers.push('plombier');
  if (/électricien|electricien|radiateurs électriques/i.test(qualification)) metiers.push('electricien');
  return metiers;
}

interface LigneRge {
  siret?: unknown;
  nom_entreprise?: unknown;
  adresse?: unknown;
  code_postal?: unknown;
  commune?: unknown;
  latitude?: unknown;
  longitude?: unknown;
  telephone?: unknown;
  email?: unknown;
  site_internet?: unknown;
  nom_qualification?: unknown;
  organisme?: unknown;
  lien_date_fin?: unknown;
}

const texte = (valeur: unknown): string | null => (typeof valeur === 'string' && valeur.trim() ? valeur.trim() : null);
const nombre = (valeur: unknown): number | null => (typeof valeur === 'number' && Number.isFinite(valeur) ? valeur : null);

/** Une entreprise par SIRET ; seulement les labels valides de plomberie ou d'électricité. */
export function analyserRge(donnees: unknown, depuis: Position, aujourdhui: string): Pro[] {
  const lignes = (donnees as { results?: unknown } | null)?.results;
  if (!Array.isArray(lignes)) return [];
  const parSiret = new Map<string, Pro>();
  for (const ligne of lignes as (LigneRge | null)[]) {
    if (!ligne || typeof ligne !== 'object') continue;
    const siret = texte(ligne.siret);
    const lat = nombre(ligne.latitude);
    const lon = nombre(ligne.longitude);
    const qualification = texte(ligne.nom_qualification);
    const fin = texte(ligne.lien_date_fin);
    if (!siret || lat === null || lon === null || !qualification || !fin || fin < aujourdhui) continue;
    const metiers = metiersRge(qualification);
    if (metiers.length === 0) continue;
    const label: LabelRge = { qualification, organisme: texte(ligne.organisme) ?? 'organisme inconnu', finValidite: fin };
    const deja = parSiret.get(siret);
    if (deja) {
      deja.metiers = [...new Set([...deja.metiers, ...metiers])];
      if (!deja.rge || deja.rge.finValidite < fin) deja.rge = label;
      continue;
    }
    const ville = texte(ligne.commune);
    const rue = texte(ligne.adresse);
    const codePostal = texte(ligne.code_postal);
    const adresse = [rue && casseTitre(rue), [codePostal, ville && casseTitre(ville)].filter(Boolean).join(' ')]
      .filter(Boolean)
      .join(', ');
    parSiret.set(siret, {
      id: `rge/${siret}`,
      source: 'rge',
      siret,
      nom: casseTitre(texte(ligne.nom_entreprise) ?? 'Entreprise RGE'),
      metiers,
      telephone: texte(ligne.telephone),
      lat,
      lon,
      distanceKm: distanceKm(depuis, { lat, lon }),
      adresse: adresse || null,
      ville: ville ? casseTitre(ville) : null,
      email: texte(ligne.email),
      siteWeb: texte(ligne.site_internet),
      rge: label,
    });
  }
  return [...parSiret.values()].sort((a, b) => a.distanceKm - b.distanceKm);
}
