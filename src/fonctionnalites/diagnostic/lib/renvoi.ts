import type { Resultat } from '@/domaine/types';

/** Sur un verdict rouge qui renvoie vers Urgences (gaz), on ne propose pas de plombier ni d'électricien. */
export function prosVisibles(resultat: Resultat): boolean {
  return !(resultat.verdict === 'rouge' && resultat.renvoi?.type === 'urgence');
}
