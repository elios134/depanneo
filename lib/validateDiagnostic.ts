import type { Diagnostic } from './types';

export function validerDiagnostic(diag: Diagnostic): string[] {
  const erreurs: string[] = [];

  if (!diag.etapes[diag.etapeInitiale]) {
    erreurs.push(`etapeInitiale "${diag.etapeInitiale}" introuvable dans "${diag.id}"`);
  }

  for (const [etapeId, etape] of Object.entries(diag.etapes)) {
    for (const reponse of etape.reponses) {
      const cible = reponse.suite;
      const cibleExiste = Boolean(diag.etapes[cible]) || Boolean(diag.resultats[cible]);
      if (!cibleExiste) {
        erreurs.push(
          `Diagnostic "${diag.id}", étape "${etapeId}": la réponse "${reponse.texte}" pointe vers "${cible}" qui n'existe pas`
        );
      }
    }
  }

  return erreurs;
}
