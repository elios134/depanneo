import { LIBELLES_METIER, type Pro } from './pro';

// Recherche web « nom + ville + avis », ouverte dans le navigateur.
export function lienAvis(pro: Pro): string {
  const ville = pro.ville?.trim();
  const codePostal = pro.adresse?.match(/\b\d{5}\b/)?.[0];
  const lieu = ville || codePostal || LIBELLES_METIER[pro.metiers[0]].toLowerCase();
  const recherche = `${pro.nom} ${lieu} avis`.replace(/\s+/g, ' ').trim();
  return `https://www.google.com/search?q=${encodeURIComponent(recherche)}`;
}
