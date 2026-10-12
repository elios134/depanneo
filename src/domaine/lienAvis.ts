import { LIBELLES_METIER, type Pro } from './pro';

/** Ville du pro, sinon son code postal, sinon son métier : sert aux recherches web. */
export function lieuRecherche(pro: Pro): string {
  const ville = pro.ville?.trim();
  const codePostal = pro.adresse?.match(/\b\d{5}\b/)?.[0];
  return ville || codePostal || LIBELLES_METIER[pro.metiers[0]].toLowerCase();
}

// Recherche web « nom + ville + avis », ouverte dans le navigateur.
export function lienAvis(pro: Pro): string {
  const recherche = `${pro.nom} ${lieuRecherche(pro)} avis`.replace(/\s+/g, ' ').trim();
  return `https://www.google.com/search?q=${encodeURIComponent(recherche)}`;
}
