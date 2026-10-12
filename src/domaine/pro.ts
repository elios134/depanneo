import { formaterDistance } from './distance';
import type { Categorie } from './types';

export type Metier = 'plombier' | 'electricien';

export type SourcePro = 'osm' | 'rge' | 'registre';

/** Label RGE (annuaire de l'ADEME). finValidite : AAAA-MM-JJ. */
export interface LabelRge {
  qualification: string;
  organisme: string;
  finValidite: string;
}

export interface Pro {
  id: string;
  nom: string;
  metiers: Metier[];
  telephone: string | null;
  lat: number;
  lon: number;
  distanceKm: number;
  // Facultatifs : absents des listes déjà enregistrées sur le téléphone.
  adresse?: string | null;
  siteWeb?: string | null;
  email?: string | null;
  horaires?: string | null;
  ville?: string | null;
  // Absent = OpenStreetMap (listes enregistrées avant le chantier « Pros enrichis »).
  source?: SourcePro;
  siret?: string | null;
  rge?: LabelRge | null;
  anneeCreation?: number | null;
}

export const LIBELLES_METIER: Record<Metier, string> = {
  plombier: 'Plombier',
  electricien: 'Électricien',
};

export function metierDeCategorie(categorie: Categorie): Metier {
  return categorie === 'plomberie' ? 'plombier' : 'electricien';
}

/** Sous-titre d'un pro : tous ses métiers puis la distance. */
export function sousTitrePro(pro: Pro): string {
  return [...pro.metiers.map((m) => LIBELLES_METIER[m]), formaterDistance(pro.distanceKm)].join(' · ');
}

/** Un pro qu'on peut appeler tout de suite. */
export function estJoignable(pro: Pro): boolean {
  return Boolean(pro.telephone);
}

/** Phrase de l'encadré RGE de la fiche. */
export function texteRge(rge: LabelRge): string {
  const organisme = rge.organisme.charAt(0).toUpperCase() + rge.organisme.slice(1);
  const [annee, mois, jour] = rge.finValidite.split('-');
  return `Qualification « ${rge.qualification} » vérifiée par ${organisme}, valable jusqu’au ${jour}/${mois}/${annee}.`;
}
