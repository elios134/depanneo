import { useState } from 'react';
import { estResultat, getEtape, getResultat } from '@/domaine/diagnosticEngine';
import type { Diagnostic, Etape, Resultat } from '@/domaine/types';
import { demarrer, etapeCourante, peutRevenir, precedente, progression, repondre } from '../lib/parcours';

export function useParcoursDiagnostic(diag: Diagnostic) {
  const [etat, setEtat] = useState(() => demarrer(diag));
  const courant = etapeCourante(etat);
  const fini = estResultat(diag, courant);
  const etape: Etape | null = fini ? null : getEtape(diag, courant);
  const resultat: Resultat | null = fini ? getResultat(diag, courant) : null;
  return {
    etape,
    resultat,
    numeroQuestion: etat.historique.length,
    progression: progression(diag, etat),
    peutRevenir: peutRevenir(etat),
    repondre: (suite: string) => setEtat((e) => repondre(e, suite)),
    precedente: () => setEtat((e) => precedente(e)),
    recommencer: () => setEtat(demarrer(diag)),
  };
}
