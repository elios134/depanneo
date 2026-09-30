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
}

export const LIBELLES_METIER: Record<Metier, string> = {
  plombier: 'Plombier',
  electricien: 'Électricien',
};

export function metierDeCategorie(categorie: Categorie): Metier {
  return categorie === 'plomberie' ? 'plombier' : 'electricien';
}
