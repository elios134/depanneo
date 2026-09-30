import type { Diagnostic, Verdict } from './types';

const aClePropre = (obj: object, cle: string): boolean =>
  Object.prototype.hasOwnProperty.call(obj, cle);

const VERDICTS_VALIDES: Verdict[] = ['vert', 'orange', 'rouge'];

export function validerDiagnostic(diag: Diagnostic): string[] {
  const erreurs: string[] = [];

  const etapeInitialeExiste =
    aClePropre(diag.etapes, diag.etapeInitiale) || aClePropre(diag.resultats, diag.etapeInitiale);
  if (!etapeInitialeExiste) {
    erreurs.push(`etapeInitiale "${diag.etapeInitiale}" introuvable dans "${diag.id}"`);
  }

  for (const [etapeId, etape] of Object.entries(diag.etapes)) {
    for (const reponse of etape.reponses) {
      const cible = reponse.suite;
      const cibleExiste = aClePropre(diag.etapes, cible) || aClePropre(diag.resultats, cible);
      if (!cibleExiste) {
        erreurs.push(
          `Diagnostic "${diag.id}", étape "${etapeId}": la réponse "${reponse.texte}" pointe vers "${cible}" qui n'existe pas`
        );
      }
    }
  }

  for (const [resultatId, resultat] of Object.entries(diag.resultats)) {
    if (!VERDICTS_VALIDES.includes(resultat.verdict)) {
      erreurs.push(
        `Diagnostic "${diag.id}", résultat "${resultatId}": verdict "${resultat.verdict}" invalide`
      );
    }
    if (typeof resultat.titre !== 'string' || resultat.titre.length === 0) {
      erreurs.push(`Diagnostic "${diag.id}", résultat "${resultatId}": titre manquant`);
    }
    if (typeof resultat.conseil !== 'string' || resultat.conseil.length === 0) {
      erreurs.push(`Diagnostic "${diag.id}", résultat "${resultatId}": conseil manquant`);
    }
  }

  return erreurs;
}
