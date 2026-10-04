export type Emplacement = 'robinet-eau' | 'tableau' | 'robinet-gaz' | 'chauffe-eau';

export const EMPLACEMENTS: { id: Emplacement; titre: string }[] = [
  { id: 'robinet-eau', titre: "Robinet d'arrêt général" },
  { id: 'tableau', titre: 'Tableau électrique' },
  { id: 'robinet-gaz', titre: 'Robinet de gaz' },
  { id: 'chauffe-eau', titre: 'Chauffe-eau / groupe de sécurité' },
];

/** photo = nom d'un fichier du dossier « logement » (dossier documents de l'appli) ; le fournisseur le transforme en URI pour l'affichage. */
export interface InfoEmplacement {
  photo?: string;
  note?: string;
}

export type Logement = Partial<Record<Emplacement, InfoEmplacement>>;

export const CLE_LOGEMENT = 'depanneo.logement';
export const NOTE_MAX = 120;

const GESTES: Record<string, Emplacement> = {
  'couper-eau': 'robinet-eau',
  'couper-courant': 'tableau',
  'couper-gaz': 'robinet-gaz',
};

export function estEmplacement(valeur: unknown): valeur is Emplacement {
  return EMPLACEMENTS.some((e) => e.id === valeur);
}

export function estRenseigne(info: InfoEmplacement | undefined): boolean {
  return Boolean(info?.photo) || Boolean(info?.note?.trim());
}

/** Lecture tolérante : JSON cassé, emplacement inconnu ou champ invalide sont ignorés. */
export function lireLogement(brut: string | null): Logement {
  if (!brut) return {};
  let donnees: unknown;
  try {
    donnees = JSON.parse(brut);
  } catch {
    return {};
  }
  if (typeof donnees !== 'object' || donnees === null || Array.isArray(donnees)) return {};
  const resultat: Logement = {};
  for (const [cle, valeur] of Object.entries(donnees)) {
    if (!estEmplacement(cle) || typeof valeur !== 'object' || valeur === null) continue;
    const { photo, note } = valeur as { photo?: unknown; note?: unknown };
    const info: InfoEmplacement = {};
    if (typeof photo === 'string' && photo) info.photo = photo;
    if (typeof note === 'string' && note.trim()) info.note = note.slice(0, NOTE_MAX);
    if (estRenseigne(info)) resultat[cle] = info;
  }
  return resultat;
}

export function ecrireLogement(l: Logement): string {
  return JSON.stringify(l);
}

export function resumeLogement(l: Logement): string {
  const n = EMPLACEMENTS.filter((e) => estRenseigne(l[e.id])).length;
  if (n === 0) return 'Aucun emplacement enregistré';
  if (n === 1) return '1 emplacement sur 4 enregistré';
  return `${n} emplacements sur 4 enregistrés`;
}

export function emplacementDuGeste(idGeste: string): Emplacement | null {
  return GESTES[idGeste] ?? null;
}

/** Extension du fichier photo : d'abord celle de l'URI, sinon le type MIME, sinon jpg. */
export function extensionPhoto(uri: string, mimeType?: string | null): string {
  const m = /\.([a-z0-9]{2,5})(?:\?.*)?$/i.exec(uri);
  if (m) return m[1].toLowerCase();
  const sousType = mimeType?.split('/')[1]?.toLowerCase();
  if (sousType === 'jpeg' || !sousType) return 'jpg';
  return sousType.replace(/[^a-z0-9]/g, '') || 'jpg';
}
