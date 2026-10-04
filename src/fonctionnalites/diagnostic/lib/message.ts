import { LIBELLES_VERDICT } from '@/domaine/verdict';
import type { Diagnostic, Resultat } from '@/domaine/types';

/** Première phrase du conseil : jusqu'au premier point inclus, ou tout le conseil s'il n'y en a pas. */
function premierePhrase(conseil: string): string {
  const fin = conseil.indexOf('.');
  return (fin === -1 ? conseil : conseil.slice(0, fin + 1)).trim();
}

/** Message à envoyer au plombier. Jamais de position dedans. */
export function messagePlombier(diag: Diagnostic, reponses: string[], resultat: Resultat): string {
  return [
    diag.titre,
    ...reponses.map((r) => `• ${r}`),
    `Verdict : ${LIBELLES_VERDICT[resultat.verdict]} (${premierePhrase(resultat.conseil)})`,
    'Envoyé depuis Dépannéo',
  ].join('\n');
}
