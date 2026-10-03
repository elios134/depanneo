// Schémas du tuto « Détartrer le robinet flotteur » (maquette 9, classes s14 à s16).
import type { Dessin, Forme } from '../dessin';
import { apparait, EAU, reservoirOuvert } from './communs';


/** Invisible, monte entre `montee` et `haut1`, redescend entre `haut2` et `descente`. */
export const flotteurSortir: Dessin = {
  dureeMs: 4000,
  instantFige: 0.12,
  description: 'Schéma : la pince dévisse l\'écrou sous le réservoir, puis le robinet flotteur sort par le haut.',
  formes: [
    ...reservoirOuvert(),
    {
      // Robinet flotteur : il monte de 44 px une fois l'écrou retiré (keyframes s14v).
      type: 'groupe',
      anim: { y: [[0, 0], [0.45, 0], [0.7, -44], [0.9, -44], [1, 0]], doux: true },
      formes: [
        { type: 'rect', x: 56, y: 30, l: 10, h: 80, peinture: 'piece' },
        { type: 'rect', x: 50, y: 24, l: 22, h: 12, rx: 3, peinture: 'piece' },
        { type: 'chemin', d: 'M72 30 L110 46', peinture: 'trait' },
        { type: 'rect', x: 106, y: 40, l: 28, h: 14, rx: 7, peinture: 'piece' },
      ],
    },
    {
      // Écrou : tombe de 14 px en disparaissant (keyframes s14n).
      type: 'rect', x: 50, y: 98, l: 22, h: 7, rx: 1, peinture: 'piece',
      anim: {
        y: [[0, 0], [0.32, 0], [0.44, 14], [1, 14]],
        opacite: [[0, 1], [0.32, 1], [0.44, 0], [1, 0]],
        doux: true,
      },
    },
    {
      // Pince : deux petits coups à gauche (keyframes s14p), puis disparaît.
      type: 'groupe',
      anim: {
        rotation: [[0, 0], [0.06, 0], [0.12, -12], [0.18, 0], [0.24, -12], [0.3, 0]],
        opacite: [[0, 1], [0.3, 1], [0.36, 0], [1, 0]],
        pivot: [61, 101],
        doux: true,
      },
      formes: [{
        type: 'chemin', d: 'M52 104 L16 118 M70 104 L32 120',
        peinture: { contour: 'outil', epaisseur: 4, bout: 'rond' },
      }],
    },
    // L'étiquette ne tourne pas : opacité seule (keyframes s14l).
    {
      type: 'texte', x: 78, y: 114, texte: 'écrou sous le réservoir',
      anim: { opacite: [[0, 1], [0.3, 1], [0.36, 0], [1, 0]] },
    },
  ],
};

/** Grain de tartre qui disparaît sous le chiffon (keyframes s15t). */
function grain(cx: number, cy: number, r: number): Forme {
  return {
    type: 'cercle', cx, cy, r, peinture: { remplir: 'tartre' },
    anim: { opacite: [[0, 1], [0.1, 1], [0.8, 0], [0.92, 0], [1, 1]] },
  };
}

export const flotteurNettoyer: Dessin = {
  dureeMs: 4000,
  instantFige: 0.85,
  description: 'Schéma : un chiffon frotte le robinet flotteur et le tartre disparaît.',
  formes: [
    { type: 'rect', x: 100, y: 86, l: 20, h: 30, peinture: 'piece' },
    { type: 'rect', x: 60, y: 30, l: 100, h: 56, rx: 10, peinture: 'piece' },
    grain(80, 45, 6), grain(105, 62, 8), grain(132, 44, 5), grain(142, 70, 6), grain(88, 74, 5),
    {
      // Chiffon : va-et-vient de 1,2 s (keyframes s15c), soit 3 fois par tour de 4 s.
      type: 'rect', x: 40, y: 36, l: 44, h: 40, rx: 8, peinture: { remplir: 'chiffon', opacite: 0.85 },
      anim: { x: [[0, 10], [0.5, 90], [1, 10]], doux: true, repetitions: 3 },
    },
    { type: 'texte', x: 60, y: 110, texte: 'chiffon + eau claire' },
  ],
};

export const reservoirRemplissage: Dessin = {
  dureeMs: 5000,
  instantFige: 0.8,
  description: 'Schéma : le réservoir se remplit, le flotteur monte et l\'eau s\'arrête toute seule.',
  formes: [
    {
      type: 'groupe', decoupe: 'M31 8 H189 V95 H31 Z',
      formes: [{
        type: 'rect', x: 31, y: 60, l: 158, h: 60, peinture: EAU,
        anim: { y: [[0, 30], [0.6, -6], [0.95, -6], [1, 30]], doux: true },
      }],
    },
    ...reservoirOuvert('trait'),
    {
      // Filet d'eau de l'arrivée : s'arrête quand le flotteur a fermé le robinet (keyframes s16s).
      type: 'chemin', d: 'M72 26 Q80 28 80 40 V92', peinture: { contour: 'eau', epaisseur: 3 },
      anim: { opacite: [[0, 1], [0.56, 1], [0.62, 0], [1, 0]] },
    },
    { type: 'rect', x: 56, y: 26, l: 10, h: 70, peinture: 'piece' },
    { type: 'rect', x: 50, y: 20, l: 22, h: 10, rx: 3, peinture: 'piece' },
    {
      type: 'groupe',
      anim: { y: [[0, 0], [0.6, -36], [0.95, -36], [1, 0]], doux: true },
      formes: [{ type: 'rect', x: 48, y: 76, l: 26, h: 14, rx: 3, peinture: 'piece' }],
    },
    { type: 'coche', x: 160, y: 30, anim: { opacite: apparait(0.64, 0.7, 0.95, 1) } },
    { type: 'texte', x: 60, y: 112, texte: 's’arrête tout seul', anim: { opacite: apparait(0.64, 0.7, 0.95, 1) } },
  ],
};
