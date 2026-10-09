// Sigles gardés en majuscules ; petits mots en minuscules (sauf en premier).
const SIGLES = new Set(['SARL', 'SAS', 'SASU', 'EURL', 'SA', 'SCI', 'SNC', 'EI', 'EIRL']);
const PETITS_MOTS = new Set(['de', 'du', 'des', 'la', 'le', 'les', 'et', 'en', 'à', 'au', 'aux', 'sur']);
const FORMES_JURIDIQUES = new Set(['sarl', 'sas', 'sasu', 'eurl', 'sa', 'ets', 'etablissements', 'eirl', 'ei']);

const majuscule = (mot: string) => mot.charAt(0).toUpperCase() + mot.slice(1);

/** « ETABLISSEMENTS SOUCHON » → « Etablissements Souchon ». Un nom déjà en casse mixte est gardé. */
export function casseTitre(nom: string): string {
  if (nom !== nom.toUpperCase()) return nom;
  return nom
    .split(' ')
    .filter(Boolean)
    .map((mot, i) => {
      if (SIGLES.has(mot)) return mot;
      const bas = mot.toLowerCase();
      if (i > 0 && PETITS_MOTS.has(bas)) return bas;
      // « D'ELEC » → « d'Elec » ; « JEAN-PIERRE » → « Jean-Pierre ».
      const apostrophe = bas.match(/^([dl])'(.+)$/);
      if (apostrophe) return `${i === 0 ? apostrophe[1].toUpperCase() : apostrophe[1]}'${majuscule(apostrophe[2])}`;
      return bas.split('-').map(majuscule).join('-');
    })
    .join(' ');
}

/** Forme comparable d'un nom : minuscules, sans accents, ponctuation ni forme juridique. */
export function normaliserNom(nom: string): string {
  return nom
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .split(' ')
    .filter((mot) => mot && !FORMES_JURIDIQUES.has(mot))
    .join(' ');
}
