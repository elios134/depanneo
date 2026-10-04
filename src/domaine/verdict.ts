import type { Verdict } from './types';

/** Libellés des verdicts, partagés entre le badge et le message « Envoyer au plombier ». */
export const LIBELLES_VERDICT: Record<Verdict, string> = {
  vert: 'Tu peux réparer',
  orange: 'Sécurise en attendant',
  rouge: 'Appelle un pro tout de suite',
};
