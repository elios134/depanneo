import { etatAnim, tempsLocal, validerDessin, type Dessin } from './dessin';

describe('tempsLocal', () => {
  it('vaut t sans répétition ni retard', () => {
    expect(tempsLocal(0.3, {})).toBeCloseTo(0.3);
  });
  it('tourne N fois par tour', () => {
    expect(tempsLocal(0.3, { repetitions: 5 })).toBeCloseTo(0.5);
  });
  it('décale avec le retard et reste entre 0 et 1', () => {
    expect(tempsLocal(0.1, { retard: 0.25 })).toBeCloseTo(0.85);
  });
});

describe('etatAnim', () => {
  it('sans animation : rien ne bouge', () => {
    expect(etatAnim(undefined, 0.5)).toEqual({ transform: undefined, opacite: 1, tiret: undefined });
  });
  it('déplace selon les clés', () => {
    const e = etatAnim({ y: [[0, 0], [0.5, 20], [1, 20]] }, 0.25);
    expect(e.transform).toBe('translate(0 10)');
  });
  it('tourne autour du pivot', () => {
    const e = etatAnim({ rotation: [[0, 0], [1, -90]], pivot: [112, 44] }, 1);
    expect(e.transform).toBe('rotate(-90 112 44)');
  });
  it('enchaîne déplacement puis rotation', () => {
    const e = etatAnim({ x: [[0, 10], [1, 10]], rotation: [[0, 30], [1, 30]], pivot: [5, 6] }, 0.5);
    expect(e.transform).toBe('translate(10 0) rotate(30 5 6)');
  });
  it('met à l\'échelle autour du pivot', () => {
    const e = etatAnim({ echelle: [[0, 0.5], [1, 0.5]], pivot: [100, 60] }, 0.2);
    expect(e.transform).toBe('translate(100 60) scale(0.5 0.5) translate(-100 -60)');
  });
  it('échelle horizontale seule', () => {
    const e = etatAnim({ echelleX: [[0, -1], [1, -1]], pivot: [62, 73] }, 0.2);
    expect(e.transform).toBe('translate(62 73) scale(-1 1) translate(-62 -73)');
  });
  it('calcule opacité et tirets', () => {
    const e = etatAnim({ opacite: [[0, 0], [1, 1]], tiret: [[0, 24], [1, 0]] }, 0.5);
    expect(e.opacite).toBeCloseTo(0.5);
    expect(e.tiret).toBeCloseTo(12);
  });
});

describe('validerDessin', () => {
  const base: Dessin = { dureeMs: 4000, instantFige: 0.5, description: 'Schéma : test.', formes: [] };
  it('accepte un dessin correct', () => {
    expect(validerDessin({ ...base, formes: [{ type: 'rect', x: 0, y: 0, l: 1, h: 1, peinture: 'objet' }] })).toEqual([]);
  });
  it('refuse un dessin vide, une durée nulle ou un instant figé hors de [0, 1]', () => {
    expect(validerDessin({ ...base, dureeMs: 0, instantFige: 2 }).length).toBe(3);
  });
  it('refuse des clés mal rangées ou hors de [0, 1]', () => {
    const d: Dessin = { ...base, formes: [{ type: 'coche', x: 0, y: 0, anim: { opacite: [[0.5, 0], [0.2, 1], [1.2, 1]] } }] };
    expect(validerDessin(d)).toContain('clés mal rangées (opacite)');
  });
  it('exige un pivot pour une rotation, même dans un groupe', () => {
    const d: Dessin = { ...base, formes: [{ type: 'groupe', formes: [{ type: 'coche', x: 0, y: 0, anim: { rotation: [[0, 0], [1, 90]] } }] }] };
    expect(validerDessin(d)).toContain('pivot manquant');
  });
});
