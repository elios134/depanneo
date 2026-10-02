// Schémas du tuto « Déboucher des WC » (maquette 9, classes s6 à s8).
import type { Dessin } from '../dessin';
import { CUVETTE, cuvette } from './communs';

const EAU = { remplir: 'eau', opacite: 0.75 } as const;
const OUTIL = { remplir: 'outil' } as const;
const SALE = { remplir: 'sale' } as const;

export const wcEcoulementLent: Dessin = {
  dureeMs: 5000,
  instantFige: 0.5,
  description: 'Schéma : l\'eau de la cuvette descend lentement à cause d\'un bouchon dans le tuyau.',
  formes: [
    ...cuvette(),
    {
      type: 'groupe', decoupe: CUVETTE,
      formes: [{
        type: 'rect', x: 20, y: 34, l: 170, h: 50, peinture: EAU,
        anim: { y: [[0, 0], [0.9, 20], [1, 0]] },
      }],
    },
    { type: 'rect', x: 88, y: 78, l: 24, h: 14, peinture: EAU },
    { type: 'rect', x: 88, y: 92, l: 24, h: 12, rx: 4, peinture: SALE },
    {
      // Une goutte toutes les 1,6 s (keyframes s6g) : 3 fois par tour de 5 s.
      type: 'cercle', cx: 100, cy: 106, r: 2, peinture: { remplir: 'eau' },
      anim: {
        y: [[0, 0], [0.6, 12]],
        opacite: [[0, 1], [0.6, 1], [0.61, 0], [1, 0]],
        repetitions: 3,
      },
    },
    { type: 'texte', x: 124, y: 100, texte: 's’écoule lentement' },
  ],
};

export const wcVentouse: Dessin = {
  dureeMs: 4000,
  instantFige: 0.85,
  description: 'Schéma : la ventouse pousse au fond de la cuvette et le bouchon part.',
  formes: [
    ...cuvette(),
    { type: 'groupe', decoupe: CUVETTE, formes: [{ type: 'rect', x: 20, y: 44, l: 170, h: 40, peinture: EAU }] },
    { type: 'rect', x: 88, y: 78, l: 24, h: 14, peinture: EAU },
    {
      type: 'rect', x: 88, y: 94, l: 24, h: 12, rx: 4, peinture: SALE,
      anim: { y: [[0, 0], [0.58, 0], [0.78, 16], [1, 16]], opacite: [[0, 1], [0.58, 1], [0.78, 0], [1, 0]], doux: true },
    },
    {
      type: 'groupe',
      anim: {
        y: [[0, -4], [0.08, 4], [0.16, -4], [0.24, 4], [0.32, -4], [0.4, 4], [0.48, -4], [0.56, 4], [0.64, -4], [1, -4]],
        doux: true,
      },
      formes: [
        { type: 'rect', x: 97, y: 4, l: 6, h: 60, peinture: OUTIL },
        { type: 'chemin', d: 'M80 79 Q80 62 100 62 Q120 62 120 79 Z', peinture: OUTIL },
      ],
    },
    {
      type: 'fleche', d: 'M100 82 V94',
      anim: {
        opacite: [
          [0, 0], [0.06, 0], [0.08, 1], [0.13, 0], [0.22, 0], [0.24, 1], [0.29, 0],
          [0.38, 0], [0.4, 1], [0.45, 0], [0.54, 0], [0.56, 1], [0.61, 0], [1, 0],
        ],
      },
    },
    { type: 'coche', x: 160, y: 98, anim: { opacite: [[0, 0], [0.74, 0], [0.82, 1], [0.96, 1], [1, 0]] } },
  ],
};

export const wcAcide: Dessin = {
  dureeMs: 5000,
  instantFige: 0.5,
  description: 'Schéma : le flacon se vide dans la cuvette et le bouchon se dissout, sans ventouse.',
  formes: [
    ...cuvette(),
    { type: 'groupe', decoupe: CUVETTE, formes: [{ type: 'rect', x: 20, y: 44, l: 170, h: 40, peinture: EAU }] },
    { type: 'rect', x: 88, y: 78, l: 24, h: 14, peinture: EAU },
    {
      type: 'rect', x: 88, y: 92, l: 24, h: 12, rx: 4, peinture: SALE,
      anim: {
        echelle: [[0, 1], [0.4, 1], [0.85, 0.3], [1, 0.3]],
        opacite: [[0, 1], [0.4, 1], [0.85, 0], [1, 0]],
        pivot: [100, 98],
        doux: true,
      },
    },
    {
      // Bulle d'acide qui descend vers le bouchon (keyframes s8p, ease-in).
      type: 'cercle', cx: 100, cy: 50, r: 5, peinture: OUTIL,
      anim: {
        opacite: [[0, 0], [0.2, 0], [0.25, 0.7], [0.5, 0], [1, 0]],
        y: [[0, 0], [0.2, 0], [0.5, 44], [1, 44]],
        doux: true,
      },
    },
    {
      type: 'chemin', d: 'M150 22 Q132 30 118 48', peinture: { contour: 'outil', epaisseur: 3, tirets: '4 4' },
      anim: {
        opacite: [[0, 0], [0.16, 0], [0.18, 1], [0.62, 1], [0.64, 0], [1, 0]],
        tiret: [[0, 40], [0.16, 40], [0.64, 0], [1, 0]],
      },
    },
    {
      type: 'groupe',
      anim: { rotation: [[0, 0], [0.15, -60], [0.65, -60], [0.8, 0], [1, 0]], pivot: [163, 26], doux: true },
      formes: [
        { type: 'rect', x: 150, y: 6, l: 26, h: 40, rx: 5, peinture: { contour: 'outil', epaisseur: 2 } },
        { type: 'rect', x: 155, y: 18, l: 16, h: 12, peinture: OUTIL },
        { type: 'rect', x: 158, y: 0, l: 10, h: 7, peinture: { contour: 'outil', epaisseur: 2 } },
      ],
    },
    { type: 'texte', x: 14, y: 112, texte: 'sans ventouse !', teinte: 'danger' },
  ],
};
