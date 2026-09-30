import { estResultat } from '@/domaine/diagnosticEngine';
import type { Diagnostic } from '@/domaine/types';

export interface EtatParcours {
  historique: string[];
}

export function demarrer(diag: Diagnostic): EtatParcours {
  return { historique: [diag.etapeInitiale] };
}

export function repondre(etat: EtatParcours, suite: string): EtatParcours {
  return { historique: [...etat.historique, suite] };
}

export function peutRevenir(etat: EtatParcours): boolean {
  return etat.historique.length > 1;
}

export function precedente(etat: EtatParcours): EtatParcours {
  return peutRevenir(etat) ? { historique: etat.historique.slice(0, -1) } : etat;
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
