import { formaterDistance } from './distance';
import type { Categorie } from './types';

export type Metier = 'plombier' | 'electricien';

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
