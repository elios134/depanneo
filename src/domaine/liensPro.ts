import { lieuRecherche } from './lienAvis';
import type { Position } from './lieux';
import type { Metier, Pro } from './pro';

/** Fiche publique de l'établissement sur le site de l'État. */
export function lienFicheOfficielle(siret: string): string {
  return `https://annuaire-entreprises.data.gouv.fr/etablissement/${siret}`;
}

/** Recherche web « nom + ville + téléphone » pour un pro sans numéro. */
export function lienChercherNumero(pro: Pro): string {
  const recherche = `${pro.nom} ${lieuRecherche(pro)} téléphone`.replace(/\s+/g, ' ').trim();
  return `https://www.google.com/search?q=${encodeURIComponent(recherche)}`;
}

const TERMES: Record<Metier | 'tous', string> = {
  plombier: 'plombier',
  electricien: 'électricien',
  tous: 'plombier électricien',
};

/** Recherche Google Maps autour de la position (Android l'ouvre dans l'appli Google Maps si elle est installée). */
export function lienGoogleMaps(position: Position, filtre: Metier | 'tous'): string {
  return `https://www.google.com/maps/search/${encodeURIComponent(TERMES[filtre])}/@${position.lat},${position.lon},14z`;
}
