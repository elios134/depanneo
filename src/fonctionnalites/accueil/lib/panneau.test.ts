import { decisionGlissement, libelleReplie, SEUIL_GLISSEMENT } from './panneau';

describe('decisionGlissement', () => {
  it('replie quand on glisse vers le bas', () => {
    expect(decisionGlissement(SEUIL_GLISSEMENT)).toBe('replier');
    expect(decisionGlissement(120)).toBe('replier');
  });
  it('déplie quand on glisse vers le haut', () => {
    expect(decisionGlissement(-SEUIL_GLISSEMENT)).toBe('deplier');
  });
  it('ne fait rien pour un petit mouvement', () => {
    expect(decisionGlissement(10)).toBeNull();
    expect(decisionGlissement(-10)).toBeNull();
  });
});

describe('libelleReplie', () => {
  it('compte les pros', () => {
    expect(libelleReplie(2)).toBe('2 pros près de toi');
    expect(libelleReplie(1)).toBe('1 pro près de toi');
  });
  it('sans pro connu : propose de les afficher', () => {
    expect(libelleReplie(0)).toBe('Afficher les pros');
  });
});
