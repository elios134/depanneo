import type { Verdict } from '@/domaine/types';

export type Action = 'renvoi' | 'quiPaie' | 'tuto' | 'geste' | 'numero' | 'envoyer' | 'pros';

/**
 * Ordre des actions sous le conseil. Le renvoi passe toujours en premier (maquette 8) ;
 * en orange et en rouge, « Qui paie ? » vient après le geste de sécurité et le numéro d'urgence.
 */
export function ordreActions(verdict: Verdict): Action[] {
  switch (verdict) {
    case 'vert':
      return ['renvoi', 'quiPaie', 'tuto', 'geste', 'envoyer', 'pros'];
    case 'orange':
      return ['renvoi', 'geste', 'numero', 'quiPaie', 'envoyer', 'pros', 'tuto'];
    case 'rouge':
      return ['renvoi', 'numero', 'pros', 'geste', 'quiPaie', 'envoyer'];
  }
}
