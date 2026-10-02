// Schémas du tuto « Changer un joint » (maquette 9, classes s9 à s13).
import type { Dessin, Forme } from '../dessin';

const OUTIL = { remplir: 'outil' } as const;
const FILETS = { contour: 'trait', epaisseur: 1, bout: 'rond' } as const;

/** Écrou du raccord : un rectangle et ses deux filets. */
function ecrou(x: number, largeur: number, filet1: number, filet2: number): Forme[] {
  return [
    { type: 'rect', x, y: 48, l: largeur, h: 26, rx: 2, peinture: 'piece' },
    { type: 'chemin', d: `M${filet1} 48 V74 M${filet2} 48 V74`, peinture: FILETS },
  ];
}

/** Apparition d'un texte ou d'une flèche : invisible, monte entre `montee` et `haut1`, redescend entre `haut2` et `descente`. */
const apparait = (montee: number, haut1: number, haut2: number, descente: number) =>
  [[0, 0], [montee, 0], [haut1, 1], [haut2, 1], [descente, 0], [1, 0]] as const;

/** Anneau de joint neuf (contour `joint`, épaisseur 5). */
const anneau = (cx: number, r: number): Forme => ({
  type: 'cercle', cx, cy: 60, r, peinture: { contour: 'joint', epaisseur: 5 },
});

export const couperEau: Dessin = {
  dureeMs: 4000,
  instantFige: 0.6,
  description: 'Schéma : la manette du robinet d\'arrêt tourne d\'un quart de tour et l\'eau s\'arrête.',
  formes: [
    { type: 'rect', x: 6, y: 56, l: 208, h: 14, peinture: 'objet' },
    {
      // Écoulement en amont (keyframes s9a, 0,6 s) : 7 fois par tour de 4 s.
      type: 'chemin', d: 'M8 63 H92', peinture: { contour: 'eau', epaisseur: 4, tirets: '6 6' },
      anim: { tiret: [[0, 24], [1, 0]], repetitions: 7 },
    },
    {
      // Écoulement en aval : le groupe porte l'opacité (s9b), le chemin les tirets (s9a).
      type: 'groupe',
      anim: { opacite: [[0, 1], [0.4, 1], [0.5, 0], [0.88, 0], [1, 1]] },
      formes: [{
        type: 'chemin', d: 'M128 63 H212', peinture: { contour: 'eau', epaisseur: 4, tirets: '6 6' },
        anim: { tiret: [[0, 24], [1, 0]], repetitions: 7 },
      }],
    },
    { type: 'rect', x: 94, y: 50, l: 32, h: 26, rx: 4, peinture: 'piece' },
    {
      type: 'groupe',
      anim: { rotation: [[0, 0], [0.22, 0], [0.42, -90], [0.88, -90], [1, 0]], pivot: [112, 44], doux: true },
      formes: [{ type: 'rect', x: 108, y: 40, l: 38, h: 7, rx: 3, peinture: OUTIL }],
    },
    { type: 'cercle', cx: 112, cy: 44, r: 4, peinture: 'piece' },
    { type: 'texte', x: 150, y: 30, texte: '¼ de tour', anim: { opacite: apparait(0.42, 0.48, 0.86, 0.92) } },
    { type: 'texte', x: 140, y: 96, texte: 'l’eau s’arrête', anim: { opacite: apparait(0.42, 0.48, 0.86, 0.92) } },
  ],
};

export const raccordResserrer: Dessin = {
  dureeMs: 4000,
  instantFige: 0.8,
  description: 'Schéma : la clé resserre doucement l\'écrou et la fuite s\'arrête.',
  formes: [
    { type: 'rect', x: 6, y: 54, l: 96, h: 14, peinture: 'objet' },
    { type: 'rect', x: 126, y: 56, l: 88, h: 10, peinture: 'objet' },
    ...ecrou(102, 24, 110, 118),
    {
      type: 'cercle', cx: 114, cy: 78, r: 3, peinture: { remplir: 'eau' },
      anim: { opacite: [[0, 0], [0.06, 1], [0.3, 1], [0.31, 0], [1, 0]], y: [[0, 0], [0.3, 30]], doux: true },
    },
    {
      type: 'groupe',
      anim: { rotation: [[0, 0], [0.35, 0], [0.55, 14], [0.92, 14], [1, 0]], pivot: [114, 61], doux: true },
      formes: [
        { type: 'rect', x: 98, y: 36, l: 32, h: 12, rx: 3, peinture: OUTIL },
        { type: 'chemin', d: 'M126 40 L192 18', peinture: { contour: 'outil', epaisseur: 7, bout: 'rond' } },
      ],
    },
    { type: 'coche', x: 180, y: 96, anim: { opacite: [[0, 0], [0.58, 0], [0.66, 1], [0.94, 1], [1, 0]] } },
    { type: 'texte', x: 14, y: 96, texte: 'doucement' },
  ],
};

export const raccordDevisser: Dessin = {
  dureeMs: 4000,
  instantFige: 0.7,
  description: 'Schéma : l\'écrou se dévisse et glisse, le joint apparaît.',
  formes: [
    { type: 'rect', x: 6, y: 54, l: 100, h: 14, peinture: 'objet' },
    { type: 'rect', x: 106, y: 50, l: 4, h: 22, peinture: { remplir: 'joint' } },
    {
      type: 'groupe',
      anim: { x: [[0, 0], [0.45, 0], [0.6, 12], [0.9, 12], [1, 0]], doux: true },
      formes: [{ type: 'rect', x: 114, y: 56, l: 100, h: 10, peinture: 'objet' }],
    },
    {
      type: 'groupe',
      anim: { x: [[0, 0], [0.28, 0], [0.5, 44], [0.9, 44], [1, 0]], doux: true },
      formes: ecrou(100, 28, 109, 119),
    },
    { type: 'fleche', d: 'M96 80 A18 6 0 0 0 132 80', anim: { opacite: apparait(0.04, 0.08, 0.26, 0.3) } },
    { type: 'texte', x: 86, y: 100, texte: 'le joint apparaît', anim: { opacite: apparait(0.58, 0.64, 0.9, 0.96) } },
  ],
};

export const jointComparer: Dessin = {
  dureeMs: 4000,
  instantFige: 0.75,
  description: 'Schéma : le vieux joint se pose sur le joint neuf de la même taille.',
  formes: [
    { type: 'rect', x: 92, y: 22, l: 122, h: 76, rx: 6, peinture: 'objet' },
    { type: 'texte', x: 98, y: 18, texte: 'kit de joints neufs' },
    anneau(118, 8), anneau(152, 16), anneau(192, 12),
    {
      type: 'groupe',
      anim: { x: [[0, 0], [0.15, 0], [0.5, 110], [0.9, 110], [1, 0]], doux: true },
      formes: [
        { type: 'cercle', cx: 42, cy: 60, r: 16, peinture: { contour: 'trait', epaisseur: 6, opacite: 0.9 } },
        { type: 'chemin', d: 'M53 47 l5 -5', peinture: { contour: 'fond', epaisseur: 3 } },
      ],
    },
    { type: 'texte', x: 20, y: 96, texte: 'vieux joint' },
    {
      type: 'groupe',
      anim: { opacite: apparait(0.52, 0.6, 0.9, 0.96) },
      formes: [
        { type: 'cercle', cx: 152, cy: 60, r: 20, peinture: { contour: 'succes', epaisseur: 2 } },
        { type: 'texte', x: 124, y: 112, texte: 'même taille', teinte: 'succes' },
      ],
    },
  ],
};

export const jointRemonter: Dessin = {
  dureeMs: 4000,
  instantFige: 0.85,
  description: 'Schéma : le joint neuf se place et l\'écrou se revisse.',
  formes: [
    { type: 'rect', x: 6, y: 54, l: 100, h: 14, peinture: 'objet' },
    { type: 'rect', x: 116, y: 56, l: 98, h: 10, peinture: 'objet' },
    {
      type: 'groupe',
      anim: { y: [[0, -36], [0.3, 0], [1, 0]], opacite: [[0, 0], [0.1, 1], [1, 1]], doux: true },
      formes: [{ type: 'rect', x: 108, y: 50, l: 5, h: 22, peinture: { remplir: 'joint' } }],
    },
    {
      type: 'groupe',
      anim: { x: [[0, 44], [0.35, 44], [0.58, 0], [1, 0]], doux: true },
      formes: ecrou(98, 28, 107, 117),
    },
    { type: 'fleche', d: 'M94 80 A18 6 0 0 1 130 80', anim: { opacite: apparait(0.58, 0.62, 0.78, 0.82) } },
    { type: 'coche', x: 180, y: 96, anim: { opacite: [[0, 0], [0.76, 0], [0.82, 1], [0.96, 1], [1, 0]] } },
    { type: 'texte', x: 14, y: 96, texte: 'fermement, sans forcer', anim: { opacite: apparait(0.58, 0.62, 0.78, 0.82) } },
  ],
};
