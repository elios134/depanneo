/** Un schéma (de `haut` à `bas`) est visible s'il chevauche la vue (de `debutVue` à `finVue`). Coordonnées dans le contenu défilant. */
export function estVisible(haut: number, bas: number, debutVue: number, finVue: number): boolean {
  return bas > debutVue && haut < finVue;
}
