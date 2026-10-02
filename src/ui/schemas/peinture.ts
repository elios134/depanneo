// Traduit la peinture d'une forme (rôle de couleur) en vraies couleurs du thème.
import type { Couleurs } from '@/theme/tokens';
import type { Peinture, Teinte } from './dessin';

export interface StylePeinture {
  fill: string;
  fillOpacity?: number;
  stroke?: string;
  strokeWidth?: number;
  strokeOpacity?: number;
  strokeDasharray?: string;
  strokeLinecap?: 'round';
  strokeLinejoin?: 'round';
  opacity?: number;
}

export function couleurTeinte(teinte: Teinte, c: Couleurs): string {
  switch (teinte) {
    case 'trait': return c.texteDiscret;
    case 'piece': return c.schemaPiece;
    case 'fond': return c.fond;
    case 'eau': return c.accent;
    case 'outil': return c.verdictOrange;
    case 'succes': return c.verdictVert;
    case 'danger': return c.danger;
    case 'sale': return c.schemaSale;
    case 'tartre': return c.schemaTartre;
    case 'joint': return c.schemaJoint;
    case 'flexible': return c.schemaFlexible;
    case 'eponge': return c.schemaEponge;
    case 'chiffon': return c.schemaChiffon;
    case 'vinaigre': return c.schemaVinaigre;
  }
}

export function stylePeinture(peinture: Peinture, c: Couleurs): StylePeinture {
  if (peinture === 'objet') return { fill: c.carte, stroke: c.texteDiscret, strokeWidth: 2 };
  if (peinture === 'trait') {
    return { fill: 'none', stroke: c.texteDiscret, strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' };
  }
  if (peinture === 'piece') return { fill: c.schemaPiece, stroke: c.texte, strokeWidth: 1.5, strokeOpacity: 0.8 };
  const style: StylePeinture = { fill: peinture.remplir ? couleurTeinte(peinture.remplir, c) : 'none' };
  if (peinture.contour) {
    style.stroke = couleurTeinte(peinture.contour, c);
    style.strokeWidth = peinture.epaisseur ?? 2;
  }
  if (peinture.bout === 'rond') {
    style.strokeLinecap = 'round';
    style.strokeLinejoin = 'round';
  }
  if (peinture.tirets) style.strokeDasharray = peinture.tirets;
  if (peinture.opacite !== undefined) style.opacity = peinture.opacite;
  return style;
}
