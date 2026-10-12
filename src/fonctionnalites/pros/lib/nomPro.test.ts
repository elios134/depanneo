import { casseTitre, normaliserNom } from './nomPro';

describe('casseTitre', () => {
  it('met en casse de titre un nom tout en majuscules', () => {
    expect(casseTitre('ETABLISSEMENTS SOUCHON')).toBe('Etablissements Souchon');
    expect(casseTitre('PLOMBERIE DE LA GARE')).toBe('Plomberie de la Gare');
    expect(casseTitre("L'ATELIER D'ELEC")).toBe("L'Atelier d'Elec");
    expect(casseTitre('JEAN-PIERRE MARTIN')).toBe('Jean-Pierre Martin');
  });
  it('garde les sigles juridiques en majuscules', () => {
    expect(casseTitre('SARL PH DEUX')).toBe('SARL Ph Deux');
  });
  it('laisse un nom déjà en casse mixte', () => {
    expect(casseTitre('Élec 13')).toBe('Élec 13');
  });
});

describe('normaliserNom', () => {
  it('minuscules, sans accents, sans ponctuation ni forme juridique', () => {
    expect(normaliserNom('SARL Plomberie Durand-Frères')).toBe('plomberie durand freres');
    expect(normaliserNom('Élec 13 (SAS)')).toBe('elec 13');
    expect(normaliserNom('Ets. Souchon')).toBe('souchon');
  });
});
