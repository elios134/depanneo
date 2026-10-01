import { classerEchec, EchecPros, raisonDe } from './echecPros';

describe('classerEchec', () => {
  it('hors-ligne si toutes les tentatives ont échoué par erreur réseau', () => {
    expect(classerEchec([new TypeError('Network request failed'), new TypeError('Failed to fetch')])).toBe('hors-ligne');
  });

  it("indisponible si un serveur a répondu par une erreur HTTP", () => {
    expect(classerEchec([new TypeError('Network request failed'), new Error('Overpass a répondu 504')])).toBe('indisponible');
  });

  it('indisponible si le délai est dépassé', () => {
    const delai = new Error('Aborted');
    delai.name = 'AbortError';
    expect(classerEchec([delai])).toBe('indisponible');
  });

  it('indisponible si la réponse est illisible', () => {
    expect(classerEchec([new SyntaxError('JSON Parse error')])).toBe('indisponible');
  });

  it("indisponible s'il n'y a aucune tentative", () => {
    expect(classerEchec([])).toBe('indisponible');
  });
});

describe('EchecPros', () => {
  it('porte la raison, lisible avec raisonDe', () => {
    const e = new EchecPros('indisponible');
    expect(e.raison).toBe('indisponible');
    expect(raisonDe(e)).toBe('indisponible');
    expect(raisonDe(new Error('autre'))).toBe('hors-ligne');
  });
});
