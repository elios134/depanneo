// Schémas du tuto « Changer le mécanisme de chasse » (maquette 9, classes s17 à s22).
import type { Dessin, Forme } from '../dessin';
import { reservoirOuvert } from './communs';

const EAU = { remplir: 'eau', opacite: 0.75 } as const;

/** Invisible, monte entre `montee` et `haut1`, redescend entre `haut2` et `descente`. */
const apparait = (montee: number, haut1: number, haut2: number, descente: number) =>
  [[0, 0], [montee, 0], [haut1, 1], [haut2, 1], [descente, 0], [1, 0]] as const;

/** Flèche et texte visibles au début du tour (keyframes s18f). */
const DEBUT_32 = apparait(0.04, 0.08, 0.32, 0.36);

export const reservoirVidange: Dessin = {
  dureeMs: 4000,
  instantFige: 0.5,
  description: 'Schéma : le bouton de chasse s\'enfonce et le réservoir se vide.',
  formes: [
    {
      type: 'groupe', decoupe: 'M31 15 H189 V95 H31 Z',
      formes: [{
        type: 'rect', x: 31, y: 26, l: 158, h: 80, peinture: EAU,
        anim: { y: [[0, 0], [0.15, 0], [0.7, 62], [0.9, 62], [1, 0]], doux: true },
      }],
    },
    { type: 'rect', x: 30, y: 14, l: 160, h: 82, peinture: 'trait' },
    { type: 'rect', x: 26, y: 8, l: 168, h: 8, rx: 2, peinture: 'objet' },
    {
      type: 'rect', x: 100, y: 2, l: 20, h: 7, rx: 3, peinture: 'piece',
      anim: { y: [[0, 0], [0.08, 0], [0.12, 3], [0.22, 3], [0.26, 0], [1, 0]], doux: true },
    },
    { type: 'rect', x: 100, y: 96, l: 20, h: 24, peinture: 'objet' },
    {
      type: 'rect', x: 104, y: 96, l: 12, h: 24, peinture: EAU,
      anim: { opacite: apparait(0.16, 0.2, 0.68, 0.74) },
    },
    { type: 'fleche', d: 'M110 50 V80', anim: { opacite: apparait(0.16, 0.2, 0.68, 0.74) } },
  ],
};

export const mecanismeQuartTour: Dessin = {
  dureeMs: 4000,
  instantFige: 0.2,
  description: 'Schéma : la colonne du mécanisme tourne d\'un quart de tour puis sort avec son joint.',
  formes: [
    ...reservoirOuvert(),
    { type: 'rect', x: 102, y: 96, l: 16, h: 22, peinture: 'objet' },
    {
      // Colonne : sort de 40 px une fois tournée (keyframes s18c).
      type: 'groupe',
      anim: { y: [[0, 0], [0.38, 0], [0.62, -40], [0.9, -40], [1, 0]], doux: true },
      formes: [
        { type: 'rect', x: 100, y: 24, l: 20, h: 68, peinture: 'piece' },
        { type: 'rect', x: 96, y: 18, l: 28, h: 8, rx: 3, peinture: 'piece' },
        {
          type: 'ellipse', cx: 110, cy: 93, rx: 16, ry: 4,
          peinture: { remplir: 'trait', contour: 'trait', epaisseur: 1 },
        },
      ],
    },
    { type: 'fleche', d: 'M90 60 A20 6 0 0 0 130 60', anim: { opacite: DEBUT_32 } },
    { type: 'texte', x: 134, y: 48, texte: '¼ de tour', anim: { opacite: DEBUT_32 } },
    { type: 'texte', x: 134, y: 80, texte: 'joint en dessous', anim: { opacite: apparait(0.6, 0.66, 0.9, 0.96) } },
  ],
};

export const tuyauAlimentation: Dessin = {
  dureeMs: 4000,
  instantFige: 0.2,
  description: 'Schéma : l\'écrou du tuyau sous le réservoir se dévisse et le tuyau se détache.',
  formes: [
    { type: 'rect', x: 40, y: 0, l: 150, h: 40, peinture: 'objet' },
    { type: 'rect', x: 60, y: 40, l: 10, h: 8, peinture: 'piece' },
    { type: 'chemin', d: 'M8 0 V120', peinture: 'trait' },
    { type: 'rect', x: 8, y: 86, l: 16, h: 12, peinture: 'piece' },
    { type: 'rect', x: 12, y: 78, l: 4, h: 8, peinture: { remplir: 'outil' } },
    {
      // Tuyau : descend de 14 px quand l'écrou est dévissé (keyframes s19h).
      type: 'groupe',
      anim: { y: [[0, 0], [0.35, 0], [0.55, 14], [0.9, 14], [1, 0]], doux: true },
      formes: [
        { type: 'chemin', d: 'M24 92 Q65 98 65 60 V54', peinture: { contour: 'flexible', epaisseur: 5 } },
        { type: 'rect', x: 58, y: 46, l: 14, h: 10, rx: 2, peinture: 'piece' },
      ],
    },
    { type: 'fleche', d: 'M50 54 A15 5 0 0 0 80 54', anim: { opacite: apparait(0.04, 0.08, 0.3, 0.34) } },
    { type: 'texte', x: 88, y: 62, texte: 'écrou du tuyau', anim: { opacite: apparait(0.04, 0.08, 0.3, 0.34) } },
  ],
};

/** Écrou papillon centré en `x` : il se retourne en descendant, puis tombe en disparaissant (keyframes s20p). */
function papillon(x: number): Forme {
  return {
    type: 'groupe',
    anim: {
      echelleX: [[0, 1], [0.08, -1], [0.16, 1], [0.24, -1], [0.32, 1], [0.4, 1]],
      y: [[0, 0], [0.08, 2], [0.16, 4], [0.24, 6], [0.32, 8], [0.4, 8], [0.6, 40], [0.95, 40], [1, 0]],
      opacite: [[0, 1], [0.4, 1], [0.6, 0], [0.95, 0], [1, 0]],
      pivot: [x, 73],
      doux: true,
    },
    formes: [
      { type: 'rect', x: x - 6, y: 68, l: 12, h: 10, peinture: 'piece' },
      {
        type: 'chemin',
        d: `M${x - 6} 70 L${x - 18} 62 L${x - 14} 78 Z M${x + 6} 70 L${x + 18} 62 L${x + 14} 78 Z`,
        peinture: 'piece',
      },
    ],
  };
}

export const papillons: Dessin = {
  dureeMs: 4000,
  instantFige: 0.2,
  description: 'Schéma : sous le réservoir, les deux écrous papillons se dévissent et tombent.',
  formes: [
    { type: 'rect', x: 30, y: 8, l: 160, h: 34, peinture: 'objet' },
    { type: 'rect', x: 40, y: 46, l: 140, h: 18, peinture: 'objet' },
    { type: 'chemin', d: 'M62 14 V90 M158 14 V90', peinture: { contour: 'trait', epaisseur: 3 } },
    papillon(62),
    papillon(158),
    { type: 'texte', x: 80, y: 100, texte: 'les 2 papillons, dessous' },
  ],
};

export const reservoirRetirer: Dessin = {
  dureeMs: 4000,
  instantFige: 0.7,
  description: 'Schéma : le réservoir se soulève et se décale de la cuvette, le joint apparaît.',
  formes: [
    {
      type: 'chemin', peinture: 'objet',
      d: 'M30 64 H150 V74 Q146 104 110 106 H90 L86 118 H60 L62 104 Q36 96 30 74 Z',
    },
    { type: 'ellipse', cx: 128, cy: 63, rx: 16, ry: 3, peinture: { remplir: 'joint' } },
    {
      // Réservoir : se soulève de 8 px, puis glisse de 52 px vers la droite (keyframes s21t).
      type: 'groupe',
      anim: {
        x: [[0, 0], [0.4, 0], [0.65, 52], [0.9, 52], [1, 0]],
        y: [[0, 0], [0.15, 0], [0.4, -8], [0.9, -8], [1, 0]],
        doux: true,
      },
      formes: [
        { type: 'rect', x: 100, y: 12, l: 56, h: 50, rx: 4, peinture: 'objet' },
        { type: 'rect', x: 96, y: 6, l: 64, h: 7, rx: 2, peinture: 'objet' },
      ],
    },
    { type: 'texte', x: 14, y: 30, texte: 'lourd et fragile', teinte: 'danger' },
    { type: 'texte', x: 96, y: 86, texte: 'joint', anim: { opacite: apparait(0.6, 0.66, 0.9, 0.96) } },
  ],
};

export const mecanismeEcrou: Dessin = {
  dureeMs: 4000,
  instantFige: 0.15,
  description: 'Schéma : le gros écrou sous le réservoir se dévisse, puis le mécanisme sort par le haut.',
  formes: [
    { type: 'chemin', d: 'M50 8 V90 H170 V8', peinture: 'objet' },
    {
      // Mécanisme : sort de 50 px une fois l'écrou retiré (keyframes s22c).
      type: 'groupe',
      anim: { y: [[0, 0], [0.48, 0], [0.72, -50], [0.92, -50], [1, 0]], doux: true },
      formes: [
        { type: 'rect', x: 100, y: 26, l: 20, h: 64, peinture: 'piece' },
        { type: 'rect', x: 96, y: 20, l: 28, h: 8, rx: 3, peinture: 'piece' },
        { type: 'rect', x: 103, y: 90, l: 14, h: 14, peinture: 'piece' },
      ],
    },
    {
      // Gros écrou : tombe de 16 px en disparaissant (keyframes s22n).
      type: 'rect', x: 94, y: 96, l: 32, h: 8, rx: 2, peinture: 'piece',
      anim: {
        y: [[0, 0], [0.3, 0], [0.44, 16], [1, 16]],
        opacite: [[0, 1], [0.3, 1], [0.44, 0], [1, 0]],
        doux: true,
      },
    },
    { type: 'fleche', d: 'M88 108 A22 6 0 0 0 132 108', anim: { opacite: apparait(0.04, 0.08, 0.28, 0.32) } },
    { type: 'texte', x: 136, y: 104, texte: 'gros écrou', anim: { opacite: apparait(0.04, 0.08, 0.28, 0.32) } },
  ],
};
