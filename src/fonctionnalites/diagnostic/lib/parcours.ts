import { estResultat } from '@/domaine/diagnosticEngine';
import type { Diagnostic } from '@/domaine/types';

export interface EtatParcours {
  historique: string[];
  /** choix[i] = indice de la réponse choisie à la question historique[i]. */
  choix: number[];
}

export function demarrer(diag: Diagnostic): EtatParcours {
  return { historique: [diag.etapeInitiale], choix: [] };
}

export function repondre(etat: EtatParcours, indice: number, suite: string): EtatParcours {
  return { historique: [...etat.historique, suite], choix: [...etat.choix, indice] };
}

export function peutRevenir(etat: EtatParcours): boolean {
  return etat.historique.length > 1;
}

export function precedente(etat: EtatParcours): EtatParcours {
  return peutRevenir(etat) ? { historique: etat.historique.slice(0, -1), choix: etat.choix.slice(0, -1) } : etat;
}

export function etapeCourante(etat: EtatParcours): string {
  return etat.historique[etat.historique.length - 1];
}

export function profondeurMax(diag: Diagnostic, id: string, dejaVus: Set<string> = new Set()): number {
  if (estResultat(diag, id) || dejaVus.has(id)) return 0;
  const etape = diag.etapes[id];
  if (!etape) return 0;
  const vus = new Set(dejaVus).add(id);
  return 1 + Math.max(0, ...etape.reponses.map((r) => profondeurMax(diag, r.suite, vus)));
}

export function progression(diag: Diagnostic, etat: EtatParcours): number {
  const courant = etapeCourante(etat);
  if (estResultat(diag, courant)) return 1;
  const repondues = etat.historique.length - 1;
  return repondues / (repondues + profondeurMax(diag, courant));
}

/** Textes des réponses choisies, dans l'ordre. S'arrête à la première étape ou réponse invalide. */
export function reponsesChoisies(diag: Diagnostic, etat: EtatParcours): string[] {
  const textes: string[] = [];
  for (let i = 0; i < etat.choix.length; i++) {
    const texte = diag.etapes[etat.historique[i]]?.reponses[etat.choix[i]]?.texte;
    if (texte === undefined) break;
    textes.push(texte);
  }
  return textes;
}

/**
 * Rejoue une suite d'indices de réponses depuis le début (ex. paramètre de route « 0,2,1 »).
 * S'arrête proprement à la première valeur invalide ou quand un résultat est atteint.
 */
export function rejouer(diag: Diagnostic, choix: string | undefined): EtatParcours {
  let etat = demarrer(diag);
  for (const brut of (choix ?? '').split(',')) {
    const courant = etapeCourante(etat);
    if (estResultat(diag, courant) || !/^\d+$/.test(brut.trim())) break;
    const indice = Number(brut);
    const reponse = diag.etapes[courant]?.reponses[indice];
    if (!reponse) break;
    etat = repondre(etat, indice, reponse.suite);
  }
  return etat;
}
