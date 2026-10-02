// Schémas du tuto « Déboucher un évier » (maquette 9, classes s1 à s5).
import type { Dessin, Forme } from '../dessin';
import { fondEvier, seau, SEAU, zigzag } from './communs';

const EAU = { remplir: 'eau', opacite: 0.75 } as const;
const OUTIL = { remplir: 'outil' } as const;

/** Clignotement de début de schéma pour la flèche et son texte (keyframes s1fl). */
const CLIGNE_DEBUT = [[0, 0], [0.05, 0], [0.1, 1], [0.32, 1], [0.38, 0], [1, 0]] as const;

/** Une goutte qui tombe du siphon ouvert dans le seau (keyframes s1g), décalée de `retardS` secondes. */
function goutte(retardS: number): Forme {
  return {
    type: 'cercle', cx: 107, cy: 72, r: 2.5, peinture: EAU,
    anim: {
      y: [[0, 0], [0.45, 0], [0.62, 30], [1, 30]],
      opacite: [[0, 0], [0.45, 0], [0.47, 1], [0.62, 1], [0.63, 0], [1, 0]],
      retard: retardS / 4,
    },
  };
}

export const evierDevisserSiphon: Dessin = {
  dureeMs: 4000,
  instantFige: 0.7,
  description: 'Schéma : le bouchon du siphon se dévisse et tombe dans le seau, l\'eau coule dans le seau.',
  formes: [
    ...fondEvier(),
    { type: 'rect', x: 88, y: 30, l: 38, h: 40, rx: 6, peinture: 'objet' },
    {
      type: 'groupe', decoupe: SEAU,
      formes: [{
        type: 'rect', x: 60, y: 100, l: 100, h: 24, peinture: EAU,
        anim: { y: [[0, 14], [0.45, 14], [0.85, 4], [1, 4]], doux: true },
      }],
    },
    ...seau(),
    goutte(0), goutte(0.35), goutte(0.7),
    {
      type: 'rect', x: 90, y: 70, l: 34, h: 11, rx: 3, peinture: 'piece',
      anim: {
        y: [[0, 0], [0.35, 0], [0.55, 26], [1, 26]],
        opacite: [[0, 1], [0.85, 1], [0.95, 0], [1, 0]],
        doux: true,
      },
    },
    { type: 'fleche', d: 'M84 77 A24 8 0 0 0 132 77', anim: { opacite: CLIGNE_DEBUT } },
    { type: 'texte', x: 152, y: 80, texte: 'dévisse', anim: { opacite: CLIGNE_DEBUT } },
  ],
};

/** Une saleté qui tombe du siphon dans le seau (keyframes s2d), décalée de `retardS` secondes. */
function salete(cx: number, r: number, retardS: number): Forme {
  return {
    type: 'cercle', cx, cy: 74, r, peinture: { remplir: 'sale' },
    anim: {
      y: [[0, 0], [0.3, 32], [1, 32]],
      opacite: [[0, 0], [0.05, 1], [0.3, 1], [0.35, 0], [1, 0]],
      retard: retardS / 4,
    },
  };
}

export const evierNettoyer: Dessin = {
  dureeMs: 4000,
  instantFige: 0.5,
  description: 'Schéma : une baguette racle l\'intérieur du siphon ouvert, les saletés tombent dans le seau.',
  formes: [
    ...fondEvier(),
    { type: 'rect', x: 88, y: 30, l: 38, h: 40, rx: 6, peinture: 'objet' },
    {
      type: 'rect', x: 92, y: 56, l: 30, h: 12, rx: 4, peinture: { remplir: 'sale' },
      anim: { opacite: [[0, 1], [0.9, 0.15], [1, 1]] },
    },
    { type: 'groupe', decoupe: SEAU, formes: [{ type: 'rect', x: 60, y: 112, l: 100, h: 24, peinture: EAU }] },
    ...seau(),
    { type: 'rect', x: 18, y: 108, l: 30, h: 10, rx: 3, peinture: 'piece' },
    salete(104, 3.5, 0), salete(110, 3, 1.3), salete(100, 4, 2.6),
    {
      type: 'chemin', d: 'M56 118 L104 60', peinture: { contour: 'outil', epaisseur: 4, bout: 'rond' },
      anim: { x: [[0, 0], [0.5, -6], [1, 0]], y: [[0, 0], [0.5, 8], [1, 0]], doux: true, repetitions: 5 },
    },
    { type: 'texte', x: 150, y: 72, texte: 'racle' },
  ],
};

/** Arrivée de l'éponge et de son texte (keyframes s3e). */
const ARRIVEE_EPONGE = {
  x: [[0, -26], [0.22, 0], [1, 0]],
  opacite: [[0, 0], [0.12, 1], [1, 1]],
  doux: true,
} as const;

export const evierVentouse: Dessin = {
  dureeMs: 4000,
  instantFige: 0.32,
  description: 'Schéma : une éponge bouche le trop-plein, la ventouse pousse sur la bonde.',
  formes: [
    { type: 'rect', x: 30, y: 60, l: 160, h: 18, peinture: EAU },
    { type: 'rect', x: 97, y: 78, l: 14, h: 42, peinture: { remplir: 'eau', opacite: 0.35 } },
    {
      type: 'chemin', peinture: 'trait',
      d: 'M28 14 V20 M28 36 V64 Q28 78 42 78 H96 V120 M112 120 V78 H178 Q192 78 192 64 V14',
    },
    { type: 'rect', x: 22, y: 18, l: 14, h: 20, rx: 3, peinture: { remplir: 'eponge' }, anim: ARRIVEE_EPONGE },
    { type: 'texte', x: 40, y: 26, texte: 'éponge', anim: ARRIVEE_EPONGE },
    {
      type: 'groupe',
      anim: {
        y: [[0, -4], [0.25, -4], [0.32, 4], [0.4, -4], [0.48, 4], [0.56, -4], [0.64, 4], [0.72, -4], [1, -4]],
        doux: true,
      },
      formes: [
        { type: 'rect', x: 101, y: 8, l: 6, h: 54, peinture: OUTIL },
        { type: 'chemin', d: 'M84 79 Q84 60 104 60 Q124 60 124 79 Z', peinture: OUTIL },
      ],
    },
    {
      type: 'fleche', d: 'M104 86 V112',
      anim: { opacite: [[0, 0], [0.28, 0], [0.32, 1], [0.38, 0], [0.48, 1], [0.54, 0], [0.64, 1], [0.7, 0], [1, 0]] },
    },
  ],
};

export const evierDemonterSiphon: Dessin = {
  dureeMs: 4000,
  instantFige: 0.7,
  description: 'Schéma : le siphon entier se détache, les joints sont rangés à côté.',
  formes: [
    { type: 'rect', x: 30, y: 0, l: 160, h: 7, peinture: 'objet' },
    { type: 'rect', x: 100, y: 7, l: 14, h: 18, peinture: 'objet' },
    { type: 'rect', x: 152, y: 38, l: 48, h: 11, peinture: 'objet' },
    ...seau(),
    {
      type: 'groupe',
      anim: {
        x: [[0, 0], [0.15, 0], [0.45, -4], [1, -4]],
        y: [[0, 0], [0.15, 0], [0.45, 24], [1, 24]],
        opacite: [[0, 1], [0.85, 1], [0.95, 0], [1, 0]],
        doux: true,
      },
      formes: [
        { type: 'rect', x: 88, y: 28, l: 38, h: 42, rx: 6, peinture: 'objet' },
        { type: 'rect', x: 90, y: 70, l: 34, h: 10, rx: 3, peinture: 'piece' },
        { type: 'rect', x: 126, y: 38, l: 24, h: 11, peinture: 'objet' },
        { type: 'rect', x: 97, y: 22, l: 20, h: 7, rx: 2, peinture: 'piece' },
        { type: 'rect', x: 144, y: 35, l: 7, h: 17, rx: 2, peinture: 'piece' },
      ],
    },
    {
      type: 'groupe',
      anim: { opacite: [[0, 0], [0.5, 0], [0.6, 1], [0.92, 1], [1, 0]] },
      formes: [
        { type: 'ellipse', cx: 172, cy: 98, rx: 10, ry: 4, peinture: { contour: 'joint', epaisseur: 3 } },
        { type: 'ellipse', cx: 198, cy: 98, rx: 8, ry: 3.5, peinture: { contour: 'joint', epaisseur: 3 } },
        { type: 'texte', x: 166, y: 114, texte: 'joints rangés' },
      ],
    },
  ],
};

/** Clignotement de la flèche et du texte « bloque et tourne » (keyframes s5r), deux fois par tour. */
const CLIGNE_TOURNE = [
  [0, 0], [0.17, 0], [0.2, 1], [0.32, 1], [0.35, 0], [0.52, 0], [0.55, 1], [0.67, 1], [0.7, 0], [1, 0],
] as const;

export const evierFuret: Dessin = {
  dureeMs: 6000,
  instantFige: 0.6,
  description: 'Schéma : le furet avance de 5 cm, tourne, puis avance encore jusqu\'au bouchon.',
  formes: [
    { type: 'rect', x: 10, y: 48, l: 200, h: 24, peinture: { remplir: 'trait', opacite: 0.08 } },
    { type: 'chemin', d: 'M10 48 H210 M10 72 H210', peinture: 'trait' },
    {
      type: 'ellipse', cx: 166, cy: 60, rx: 14, ry: 11, peinture: { remplir: 'sale' },
      anim: {
        opacite: [[0, 1], [0.7, 1], [0.85, 0], [1, 0]],
        x: [[0, 0], [0.7, 0], [0.85, 20], [1, 20]],
        echelle: [[0, 1], [0.7, 1], [0.85, 0.4], [1, 0.4]],
        pivot: [166, 60],
        doux: true,
      },
    },
    {
      type: 'groupe',
      anim: { x: [[0, 0], [0.15, 22], [0.35, 22], [0.5, 44], [0.9, 44], [1, 0]], doux: true },
      formes: [
        { type: 'chemin', d: zigzag(-40, 110, 60), peinture: { contour: 'outil', epaisseur: 2.5 } },
        { type: 'cercle', cx: 112, cy: 60, r: 4, peinture: OUTIL },
      ],
    },
    { type: 'fleche', d: 'M24 46 A6 16 0 1 0 36 46', anim: { opacite: CLIGNE_TOURNE } },
    { type: 'texte', x: 42, y: 40, texte: 'bloque et tourne', anim: { opacite: CLIGNE_TOURNE } },
    { type: 'chemin', d: 'M40 82 V88 H62 V82', peinture: { contour: 'trait', epaisseur: 1.2 } },
    { type: 'texte', x: 42, y: 100, texte: '5 cm' },
  ],
};
