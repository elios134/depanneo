import { estNomIcone } from './icones';
import type { Diagnostic, Resultat, Verdict } from './types';
import { CATEGORIES } from './types';

const aClePropre = (obj: object, cle: string): boolean =>
  Object.prototype.hasOwnProperty.call(obj, cle);

const VERDICTS_VALIDES: Verdict[] = ['vert', 'orange', 'rouge'];
const TYPES_RENVOI: string[] = ['diagnostic', 'urgence'];

function erreurRenvoi(diag: Diagnostic, resultat: Resultat): string | null {
  const renvoi = resultat.renvoi;
  if (renvoi === undefined) return null;
  if (!TYPES_RENVOI.includes(renvoi.type) || typeof renvoi.id !== 'string' || renvoi.id.length === 0) {
    return 'renvoi invalide (type "diagnostic" ou "urgence" et id obligatoires)';
  }
  if (renvoi.type === 'diagnostic' && renvoi.id === diag.id) {
    return 'renvoi vers lui-même';
  }
  return null;
}

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
    if (resultat.verdict === 'rouge' && resultat.tutoId) {
      erreurs.push(
        `Diagnostic "${diag.id}", résultat "${resultatId}": un verdict rouge ne doit pas proposer de tuto`
      );
    }
    if (typeof resultat.titre !== 'string' || resultat.titre.length === 0) {
      erreurs.push(`Diagnostic "${diag.id}", résultat "${resultatId}": titre manquant`);
    }
    if (typeof resultat.conseil !== 'string' || resultat.conseil.length === 0) {
      erreurs.push(`Diagnostic "${diag.id}", résultat "${resultatId}": conseil manquant`);
    }
    const renvoi = erreurRenvoi(diag, resultat);
    if (renvoi) {
      erreurs.push(`Diagnostic "${diag.id}", résultat "${resultatId}": ${renvoi}`);
    }
  }

  if (!CATEGORIES.includes(diag.categorie)) {
    erreurs.push(`Diagnostic "${diag.id}": catégorie "${diag.categorie}" invalide`);
  }
  if (typeof diag.icone !== 'string' || !estNomIcone(diag.icone)) {
    erreurs.push(`Diagnostic "${diag.id}": icône "${diag.icone}" inconnue`);
  }
  if (!Array.isArray(diag.motsCles) || diag.motsCles.length === 0) {
    erreurs.push(`Diagnostic "${diag.id}": mots-clés manquants`);
  }

  return erreurs;
}

/** Vérifie que chaque renvoi vise un diagnostic ou un geste d'urgence qui existe vraiment. */
export function validerRenvois(diags: Diagnostic[], idsUrgences: string[]): string[] {
  const idsDiagnostics = new Set(diags.map((d) => d.id));
  const urgences = new Set(idsUrgences);
  const erreurs: string[] = [];
  for (const diag of diags) {
    for (const [resultatId, resultat] of Object.entries(diag.resultats)) {
      const renvoi = resultat.renvoi;
      if (!renvoi) continue;
      const existe = renvoi.type === 'diagnostic' ? idsDiagnostics.has(renvoi.id) : urgences.has(renvoi.id);
      if (!existe) {
        erreurs.push(
          `Diagnostic "${diag.id}", résultat "${resultatId}": renvoi vers ${renvoi.type} "${renvoi.id}" introuvable`
        );
      }
    }
  }
  return erreurs;
}
