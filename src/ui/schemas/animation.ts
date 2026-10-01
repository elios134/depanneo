// Calculs purs des schémas animés : pour un instant t (entre 0 et 1, un tour de boucle),
// on calcule où sont l'eau, les gouttes, le levier… Les composants n'ont plus qu'à dessiner.

/** [instant entre 0 et 1, valeur à cet instant] */
export type Cle = readonly [number, number];

export const DUREE_SIPHON_MS = 4000;
export const DUREE_DISJONCTEUR_MS = 3000;

/** Accélère au début et ralentit à la fin (comme « ease-in-out »). */
export function adoucir(x: number): number {
  return x * x * (3 - 2 * x);
}

export function interpoler(t: number, cles: readonly Cle[], doux = false): number {
  if (t <= cles[0][0]) return cles[0][1];
  for (let i = 1; i < cles.length; i++) {
    const [t1, v1] = cles[i];
    if (t <= t1) {
      const [t0, v0] = cles[i - 1];
      const x = t1 === t0 ? 1 : (t - t0) / (t1 - t0);
      return v0 + (v1 - v0) * (doux ? adoucir(x) : x);
    }
  }
  return cles[cles.length - 1][1];
}

export function phaseBoucle(ecouleMs: number, dureeMs: number): number {
  return (ecouleMs % dureeMs) / dureeMs;
}

export interface ImageSiphon {
  decalageEau: number;
  gouttes: { decalage: number; opacite: number }[];
}

const CLES_EAU: readonly Cle[] = [[0, 60], [0.7, 0], [1, 0]];
const CLES_GOUTTE: readonly Cle[] = [[0, 1], [0.8, 1], [1, 0]];

export function imageSiphon(t: number, immobile: boolean): ImageSiphon {
  if (immobile) return { decalageEau: 0, gouttes: [] };
  // Une goutte tombe en 1 s : 4 chutes par tour de 4 s ; la 2e goutte part une demi-seconde après.
  const goutte = (p: number) => ({ decalage: 60 * p, opacite: interpoler(p, CLES_GOUTTE) });
  return {
    decalageEau: interpoler(t, CLES_EAU, true),
    gouttes: [goutte((t * 4) % 1), goutte((t * 4 + 0.5) % 1)],
  };
}

export interface ImageDisjoncteur {
  decalageLevier: number;
  opaciteFleche: number;
  opaciteCoche: number;
}

const CLES_LEVIER: readonly Cle[] = [[0, 0], [0.25, 0], [0.55, -32], [1, -32]];
const CLES_FLECHE: readonly Cle[] = [[0, 0], [0.2, 0], [0.35, 1], [0.55, 1], [0.7, 0], [1, 0]];
const CLES_COCHE: readonly Cle[] = [[0, 0], [0.55, 0], [0.65, 1], [0.95, 1], [1, 0]];

export function imageDisjoncteur(t: number, immobile: boolean): ImageDisjoncteur {
  if (immobile) return { decalageLevier: -32, opaciteFleche: 0, opaciteCoche: 1 };
  return {
    decalageLevier: interpoler(t, CLES_LEVIER, true),
    opaciteFleche: interpoler(t, CLES_FLECHE),
    opaciteCoche: interpoler(t, CLES_COCHE),
  };
}
