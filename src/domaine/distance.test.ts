import { distanceKm, formaterDistance } from './distance';

describe('distance', () => {
  it('vaut 0 pour le même point', () => {
    expect(distanceKm({ lat: 43.3, lon: 5.4 }, { lat: 43.3, lon: 5.4 })).toBe(0);
  });

  it('calcule Paris–Marseille (environ 661 km)', () => {
    const km = distanceKm({ lat: 48.8566, lon: 2.3522 }, { lat: 43.2965, lon: 5.3698 });
    expect(Math.abs(km - 661)).toBeLessThan(5);
  });

  it('affiche les distances courtes en mètres arrondis à 10 m', () => {
    expect(formaterDistance(0.8)).toBe('800 m');
    expect(formaterDistance(0.834)).toBe('830 m');
  });

  it("passe en km quand l'arrondi atteint 1000 m", () => {
    expect(formaterDistance(0.996)).toBe('1 km');
  });

  it('affiche les distances longues en km avec une virgule', () => {
    expect(formaterDistance(1.23)).toBe('1,2 km');
    expect(formaterDistance(12)).toBe('12 km');
  });
});
