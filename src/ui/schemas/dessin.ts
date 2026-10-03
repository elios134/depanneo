// Moteur des schémas dessinés : un schéma = une liste de formes SVG (viewBox 220 × 120),
// chacune pouvant bouger selon des clés, comme les @keyframes CSS de la maquette 9.
// Tout ici est pur : pour un instant t (0 à 1), on calcule où est chaque forme.
import { interpoler, type Cle } from './animation';

/** Rôle d'une couleur ; traduit en vraie couleur du thème par `peinture.ts`. */
export type Teinte =
  | 'trait' | 'piece' | 'fond' | 'eau' | 'outil' | 'sale' | 'tartre' | 'joint'
  | 'flexible' | 'eponge' | 'chiffon' | 'vinaigre' | 'succes' | 'danger';

/** Comment une forme est peinte. */
export type Peinture =
  | 'objet' // fond très léger + contour (tuyau, réservoir…)
  | 'trait' // contour seul
  | 'piece' // pièce qu'on manipule : fond plus marqué + contour fin
  | { remplir?: Teinte; contour?: Teinte; epaisseur?: number; opacite?: number; tirets?: string; bout?: 'rond' };

export interface Anim {
  x?: readonly Cle[];
  y?: readonly Cle[];
  /** Degrés, autour de `pivot`. */
  rotation?: readonly Cle[];
  /** Autour de `pivot`. */
  echelle?: readonly Cle[];
  /** Autour de `pivot`. */
  echelleX?: readonly Cle[];
  opacite?: readonly Cle[];
  /** Décalage des tirets (strokeDashoffset). */
  tiret?: readonly Cle[];
  /** Mouvement adouci entre les clés (comme ease-in-out). */
  doux?: boolean;
  /** L'animation tourne N fois pendant un tour du schéma. */
  repetitions?: number;
  /** Retard, en fraction de tour (0 à 1). */
  retard?: number;
  pivot?: readonly [number, number];
}

interface Base {
  anim?: Anim;
}

export type Forme =
  | (Base & { type: 'rect'; x: number; y: number; l: number; h: number; rx?: number; peinture: Peinture })
  | (Base & { type: 'chemin'; d: string; peinture: Peinture })
  | (Base & { type: 'cercle'; cx: number; cy: number; r: number; peinture: Peinture })
  | (Base & { type: 'ellipse'; cx: number; cy: number; rx: number; ry: number; peinture: Peinture })
  | (Base & { type: 'texte'; x: number; y: number; texte: string; teinte?: Teinte })
  /** Flèche verte avec une pointe au bout du chemin. */
  | (Base & { type: 'fleche'; d: string })
  /** Coche verte dans un rond, centrée en (x, y). */
  | (Base & { type: 'coche'; x: number; y: number })
  /** `decoupe` : chemin SVG qui limite ce qu'on voit du groupe (ex. l'eau dans un seau). */
  | (Base & { type: 'groupe'; formes: Forme[]; decoupe?: string });

export interface Dessin {
  dureeMs: number;
  /** Lue par le lecteur d'écran. */
  description: string;
  /** Instant (0 à 1) affiché quand le téléphone demande de réduire les animations. */
  instantFige: number;
  formes: Forme[];
}

export interface EtatAnim {
  transform: string | undefined;
  opacite: number;
  tiret: number | undefined;
}

export function tempsLocal(t: number, anim: Anim): number {
  const v = (t - (anim.retard ?? 0)) * (anim.repetitions ?? 1);
  // Fin de tour (v = 1, 2…) : on reste à 1 plutôt que de retomber à 0.
  if (v > 0 && v % 1 === 0) return 1;
  return ((v % 1) + 1) % 1;
}

const arrondi = (v: number) => Math.round(v * 1000) / 1000;

export function etatAnim(anim: Anim | undefined, t: number): EtatAnim {
  if (!anim) return { transform: undefined, opacite: 1, tiret: undefined };
  const u = tempsLocal(t, anim);
  const val = (cles: readonly Cle[] | undefined, repos: number) =>
    cles ? arrondi(interpoler(u, cles, anim.doux)) : repos;
  const [px, py] = anim.pivot ?? [0, 0];
  const morceaux: string[] = [];
  const x = val(anim.x, 0);
  const y = val(anim.y, 0);
  if (x !== 0 || y !== 0) morceaux.push(`translate(${x} ${y})`);
  const r = val(anim.rotation, 0);
  if (r !== 0) morceaux.push(`rotate(${r} ${px} ${py})`);
  const e = val(anim.echelle, 1);
  const sx = arrondi(e * val(anim.echelleX, 1));
  if (sx !== 1 || e !== 1) morceaux.push(`translate(${px} ${py}) scale(${sx} ${e}) translate(${-px} ${-py})`);
  return {
    transform: morceaux.length ? morceaux.join(' ') : undefined,
    opacite: val(anim.opacite, 1),
    tiret: anim.tiret ? val(anim.tiret, 0) : undefined,
  };
}

const PROPRIETES = ['x', 'y', 'rotation', 'echelle', 'echelleX', 'opacite', 'tiret'] as const;

function erreursForme(forme: Forme): string[] {
  const erreurs: string[] = [];
  const anim = forme.anim;
  if (anim) {
    for (const p of PROPRIETES) {
      const cles = anim[p];
      if (!cles) continue;
      const ok = cles.length > 0 && cles.every(([i], n) => i >= 0 && i <= 1 && (n === 0 || i >= cles[n - 1][0]));
      if (!ok) erreurs.push(`clés mal rangées (${p})`);
    }
    if ((anim.rotation || anim.echelle || anim.echelleX) && !anim.pivot) erreurs.push('pivot manquant');
  }
  if (forme.type === 'groupe') erreurs.push(...forme.formes.flatMap(erreursForme));
  return erreurs;
}

/** Liste des problèmes d'un dessin (vide si tout va bien). */
export function validerDessin(dessin: Dessin): string[] {
  const erreurs: string[] = [];
  if (dessin.formes.length === 0) erreurs.push('dessin vide');
  if (!(dessin.dureeMs > 0)) erreurs.push('durée nulle');
  if (dessin.instantFige < 0 || dessin.instantFige > 1) erreurs.push('instant figé hors de [0, 1]');
  return [...erreurs, ...dessin.formes.flatMap(erreursForme)];
}
