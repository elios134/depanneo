import type { Diagnostic, Etape, Resultat } from './types';

export function estResultat(diag: Diagnostic, id: string): boolean {
  return id in diag.resultats;
}

export function getEtape(diag: Diagnostic, id: string): Etape {
  const etape = diag.etapes[id];
  if (!etape) {
    throw new Error(`Étape inconnue: ${id}`);
  }
  return etape;
}

export function getResultat(diag: Diagnostic, id: string): Resultat {
  const resultat = diag.resultats[id];
  if (!resultat) {
    throw new Error(`Résultat inconnu: ${id}`);
  }
  return resultat;
}
