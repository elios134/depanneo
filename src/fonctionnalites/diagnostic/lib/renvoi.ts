import type { NomIcone } from '@/domaine/icones';
import type { Diagnostic, GesteUrgence, Renvoi, Resultat } from '@/domaine/types';

export interface DescriptionRenvoi {
  icone: NomIcone;
  ton: 'accent' | 'danger';
  titre: string;
  sousTitre: string;
}

/** Ce qu'affiche la carte de renvoi (maquette 8), ou null si la cible n'existe pas. */
export function decrireRenvoi(renvoi: Renvoi, diags: Diagnostic[], gestes: GesteUrgence[]): DescriptionRenvoi | null {
  if (renvoi.type === 'diagnostic') {
    const cible = diags.find((d) => d.id === renvoi.id);
    return cible
      ? { icone: 'stethoscope', ton: 'accent', titre: cible.titre, sousTitre: 'Continuer avec ce diagnostic' }
      : null;
  }
  const geste = gestes.find((g) => g.id === renvoi.id);
  if (!geste) return null;
  return {
    icone: geste.icone,
    ton: 'danger',
    titre: geste.titre,
    sousTitre: geste.numeroUtile ? 'Consignes et numéro d\'urgence' : 'Consignes de sécurité',
  };
}

/** Sur un verdict rouge qui renvoie vers Urgences (gaz), on ne propose pas de plombier ni d'électricien. */
export function prosVisibles(resultat: Resultat): boolean {
  return !(resultat.verdict === 'rouge' && resultat.renvoi?.type === 'urgence');
}
