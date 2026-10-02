// Morceaux de dessin réutilisés par plusieurs schémas (maquette 9).
import type { Forme } from '../dessin';

/** Contour du seau, fermé : sert de découpe pour l'eau qui le remplit. */
export const SEAU = 'M66 92 L74 119 H140 L148 92Z';

/** Cuvette des WC vue en coupe (entonnoir), fermée : sert aussi de découpe pour l'eau. */
export const CUVETTE = 'M30 20 H170 L124 78 H76 Z';

/** Ressort du furet : un point tous les 5 px, alternativement 4 px au-dessus et au-dessous. */
export function zigzag(x0: number, x1: number, y: number): string {
  let d = `M${x0} ${y}`;
  let haut = true;
  for (let x = x0 + 5; x <= x1; x += 5) {
    d += ` L${x} ${y + (haut ? -4 : 4)}`;
    haut = !haut;
  }
  return d;
}

/** Fond d'évier, tuyau qui descend vers le siphon et tuyau de sortie vers le mur. */
export function fondEvier(): Forme[] {
  return [
    { type: 'rect', x: 30, y: 0, l: 160, h: 7, peinture: 'objet' },
    { type: 'rect', x: 100, y: 7, l: 14, h: 24, peinture: 'objet' },
    { type: 'rect', x: 124, y: 38, l: 76, h: 11, peinture: 'objet' },
  ];
}

/** Contour ouvert du seau (le haut n'est pas fermé). */
export function seau(): Forme[] {
  return [{ type: 'chemin', d: 'M66 92 L74 119 H140 L148 92', peinture: 'trait' }];
}

/** Cuvette des WC + tuyau d'évacuation. */
export function cuvette(): Forme[] {
  return [
    { type: 'chemin', d: CUVETTE, peinture: 'objet' },
    { type: 'rect', x: 86, y: 78, l: 28, h: 42, peinture: 'objet' },
  ];
}
