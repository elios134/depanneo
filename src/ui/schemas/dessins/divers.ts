// Schémas du mousseur, du flexible de douche et de l'ampoule (maquette 9, classes s23 à s26).
import type { Dessin, Forme } from '../dessin';
import { OUTIL } from './communs';


/** Flèche « à la main » et son texte : visibles au début du tour (keyframes s23f, s25f, s26f). */
const CLIGNE_DEBUT = [[0, 0], [0.04, 0], [0.08, 1], [0.3, 1], [0.34, 0], [1, 0]] as const;

/** Pièce qui descend de 22 px quand on la dévisse, puis revient (keyframes s23m, s25h). */
const DESCEND_22 = { y: [[0, 0], [0.32, 0], [0.55, 22], [0.9, 22], [1, 0]], doux: true } as const;

export const mousseurDevisser: Dessin = {
  dureeMs: 4000,
  instantFige: 0.2,
  description: 'Schéma : le petit embout au bout du robinet se dévisse à la main.',
  formes: [
    { type: 'chemin', d: 'M10 30 H100 Q128 30 128 56 V66', peinture: { contour: 'piece', epaisseur: 14 } },
    {
      type: 'groupe', anim: DESCEND_22,
      formes: [
        { type: 'rect', x: 119, y: 66, l: 18, h: 10, rx: 2, peinture: 'piece' },
        { type: 'chemin', d: 'M124 66 V76 M132 66 V76', peinture: { contour: 'trait', epaisseur: 1, bout: 'rond' } },
      ],
    },
    { type: 'fleche', d: 'M112 76 A16 5 0 0 0 144 76', anim: { opacite: CLIGNE_DEBUT } },
    { type: 'texte', x: 150, y: 66, texte: 'à la main', anim: { opacite: CLIGNE_DEBUT } },
    { type: 'chemin', d: 'M40 112 H200', peinture: 'trait' },
    { type: 'rect', x: 120, y: 106, l: 16, h: 6, rx: 2, peinture: OUTIL },
    { type: 'texte', x: 142, y: 108, texte: 'bouchon mis' },
  ],
};

/** Durée (en secondes) du tour du schéma de trempage ; sert aussi à décaler les bulles. */
const DUREE_TREMPAGE_S = 5;

/** Bulle de vinaigre qui monte (keyframes s24b, 1,5 s) : 3 fois par tour de 5 s, décalée de 0,5 s. */
function bulle(cx: number, retardS: number): Forme {
  return {
    type: 'cercle', cx, cy: 72, r: 2, peinture: { contour: 'trait', epaisseur: 1 },
    anim: {
      opacite: [[0, 0], [0.2, 1], [1, 0]],
      y: [[0, 0], [1, -26]],
      doux: true,
      repetitions: 3,
      retard: retardS / DUREE_TREMPAGE_S,
    },
  };
}

/** Grain de tartre qui disparaît pendant le trempage (keyframes s24t). */
function tartre(cx: number, cy: number): Forme {
  return {
    type: 'cercle', cx, cy, r: 2.5, peinture: { remplir: 'tartre' },
    anim: { opacite: [[0, 1], [0.25, 1], [0.8, 0], [0.92, 0], [1, 1]] },
  };
}

export const mousseurTremper: Dessin = {
  dureeMs: DUREE_TREMPAGE_S * 1000,
  instantFige: 0.85,
  description: 'Schéma : le mousseur trempe dans le vinaigre blanc et le tartre disparaît.',
  formes: [
    {
      type: 'groupe', decoupe: 'M60 40 H160 L150 110 H70 Z',
      formes: [{ type: 'rect', x: 50, y: 56, l: 120, h: 60, peinture: { remplir: 'vinaigre', opacite: 0.35 } }],
    },
    { type: 'chemin', d: 'M60 40 L70 110 H150 L160 40', peinture: 'trait' },
    {
      type: 'groupe',
      anim: { y: [[0, -66], [0.18, 0], [0.92, 0], [1, -66]], doux: true },
      formes: [
        { type: 'rect', x: 100, y: 74, l: 20, h: 12, rx: 2, peinture: 'piece' },
        tartre(105, 78), tartre(114, 82),
      ],
    },
    bulle(104, 0), bulle(110, 0.5), bulle(116, 1),
    { type: 'cercle', cx: 190, cy: 30, r: 14, peinture: 'trait' },
    {
      type: 'chemin', d: 'M190 30 V20', peinture: 'trait',
      anim: { rotation: [[0, 0], [1, 360]], pivot: [190, 30] },
    },
    { type: 'texte', x: 176, y: 58, texte: '30 min' },
    { type: 'texte', x: 74, y: 30, texte: 'vinaigre blanc' },
  ],
};

export const flexibleDevisser: Dessin = {
  dureeMs: 4000,
  instantFige: 0.2,
  description: 'Schéma : l\'écrou du flexible se dévisse à la main sous le robinet.',
  formes: [
    { type: 'rect', x: 40, y: 8, l: 140, h: 22, rx: 8, peinture: 'objet' },
    { type: 'rect', x: 104, y: 30, l: 12, h: 10, peinture: 'piece' },
    { type: 'rect', x: 102, y: 38, l: 16, h: 3, peinture: { remplir: 'joint' } },
    {
      type: 'groupe', anim: DESCEND_22,
      formes: [
        { type: 'rect', x: 98, y: 40, l: 24, h: 12, rx: 2, peinture: 'piece' },
        { type: 'chemin', d: 'M110 52 Q110 104 170 112', peinture: { contour: 'flexible', epaisseur: 6 } },
      ],
    },
    { type: 'fleche', d: 'M92 48 A18 5 0 0 0 128 48', anim: { opacite: CLIGNE_DEBUT } },
    { type: 'texte', x: 134, y: 46, texte: 'à la main', anim: { opacite: CLIGNE_DEBUT } },
  ],
};

export const ampouleDevisser: Dessin = {
  dureeMs: 4000,
  instantFige: 0.2,
  description: 'Schéma : le disjoncteur est coupé, l\'ampoule se dévisse et sort de la douille.',
  formes: [
    { type: 'chemin', d: 'M0 6 H220', peinture: 'trait' },
    { type: 'rect', x: 96, y: 6, l: 28, h: 20, rx: 3, peinture: 'objet' },
    {
      type: 'groupe',
      anim: { y: [[0, 0], [0.32, 0], [0.55, 26], [0.9, 26], [1, 0]], doux: true },
      formes: [
        { type: 'rect', x: 101, y: 26, l: 18, h: 12, peinture: 'piece' },
        { type: 'chemin', d: 'M101 30 H119 M101 34 H119', peinture: { contour: 'trait', epaisseur: 1, bout: 'rond' } },
        { type: 'cercle', cx: 110, cy: 58, r: 20, peinture: 'objet' },
      ],
    },
    { type: 'fleche', d: 'M128 34 A18 5 0 0 1 92 34', anim: { opacite: CLIGNE_DEBUT } },
    { type: 'texte', x: 134, y: 30, texte: 'dévisse', anim: { opacite: CLIGNE_DEBUT } },
    { type: 'rect', x: 14, y: 70, l: 26, h: 40, rx: 4, peinture: 'objet' },
    { type: 'rect', x: 22, y: 92, l: 10, h: 12, rx: 2, peinture: { remplir: 'danger' } },
    { type: 'texte', x: 10, y: 64, texte: 'coupé', teinte: 'danger' },
  ],
};
