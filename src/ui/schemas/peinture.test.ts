import { COULEURS } from '@/theme/tokens';
import { couleurTeinte, stylePeinture } from './peinture';

const c = COULEURS.sombre;

describe('peinture des schémas', () => {
  it('traduit chaque teinte en couleur du thème', () => {
    expect(couleurTeinte('eau', c)).toBe(c.accent);
    expect(couleurTeinte('outil', c)).toBe(c.verdictOrange);
    expect(couleurTeinte('succes', c)).toBe(c.verdictVert);
    expect(couleurTeinte('trait', c)).toBe(c.texteDiscret);
    expect(couleurTeinte('sale', c)).toBe(c.schemaSale);
  });
  it('« objet » : fond léger et contour', () => {
    expect(stylePeinture('objet', c)).toEqual({ fill: c.carte, stroke: c.texteDiscret, strokeWidth: 2 });
  });
  it('« trait » : contour seul, bouts arrondis', () => {
    expect(stylePeinture('trait', c)).toEqual({
      fill: 'none', stroke: c.texteDiscret, strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round',
    });
  });
  it('« piece » : fond marqué, contour fin', () => {
    expect(stylePeinture('piece', c)).toEqual({ fill: c.schemaPiece, stroke: c.texte, strokeWidth: 1.5, strokeOpacity: 0.8 });
  });
  it('peinture libre : remplissage seul avec opacité', () => {
    expect(stylePeinture({ remplir: 'eau', opacite: 0.75 }, c)).toEqual({ fill: c.accent, opacity: 0.75 });
  });
  it('peinture libre : contour d\'outil arrondi', () => {
    expect(stylePeinture({ contour: 'outil', epaisseur: 4, bout: 'rond' }, c)).toEqual({
      fill: 'none', stroke: c.verdictOrange, strokeWidth: 4, strokeLinecap: 'round', strokeLinejoin: 'round',
    });
  });
});
