/** Un schéma (de `haut` à `bas`) est visible s'il chevauche la vue (de `debutVue` à `finVue`). Coordonnées de la fenêtre (measureInWindow : de 0 à la hauteur de l'écran). */
export function estVisible(haut: number, bas: number, debutVue: number, finVue: number): boolean {
  return bas > debutVue && haut < finVue;
}
