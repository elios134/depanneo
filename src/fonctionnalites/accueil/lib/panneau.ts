// Logique pure du panneau repliable de l'accueil (maquette 10).

/** Distance minimale (en points) d'un glissement vertical pour replier ou déplier. */
export const SEUIL_GLISSEMENT = 30;

/** Glissement vers le bas → replier ; vers le haut → déplier ; trop court → rien. */
export function decisionGlissement(dy: number): 'replier' | 'deplier' | null {
  if (dy >= SEUIL_GLISSEMENT) return 'replier';
  if (dy <= -SEUIL_GLISSEMENT) return 'deplier';
  return null;
}

/** Texte affiché sous le bouton quand le panneau est replié. */
export function libelleReplie(nombrePros: number): string {
  if (nombrePros <= 0) return 'Afficher les pros';
  return nombrePros === 1 ? '1 pro près de toi' : `${nombrePros} pros près de toi`;
}
