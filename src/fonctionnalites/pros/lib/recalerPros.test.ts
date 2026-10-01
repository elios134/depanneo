import type { Pro } from '@/domaine/pro';
import { recalerPros } from './recalerPros';

const ici = { lat: 43.3, lon: 5.4 };
const pro = (id: string, lat: number, lon: number, distanceKm = 99): Pro => ({
  id,
  nom: id,
  metiers: ['plombier'],
  telephone: null,
  lat,
  lon,
  distanceKm,
});

describe('recalerPros', () => {
  it('recalcule la distance depuis la position donnée', () => {
    const [p] = recalerPros([pro('a', 43.31, 5.4)], ici, 10);
    expect(p.distanceKm).toBeGreaterThan(1);
    expect(p.distanceKm).toBeLessThan(1.2);
  });

  it('retire les pros hors du rayon', () => {
    const r = recalerPros([pro('proche', 43.31, 5.4), pro('loin', 44.3, 5.4)], ici, 10);
    expect(r.map((p) => p.id)).toEqual(['proche']);
  });

  it('retrie du plus proche au plus loin', () => {
    const r = recalerPros([pro('b', 43.35, 5.4), pro('a', 43.31, 5.4)], ici, 10);
    expect(r.map((p) => p.id)).toEqual(['a', 'b']);
  });

  it("ne modifie pas la liste d'origine", () => {
    const origine = [pro('a', 43.31, 5.4, 42)];
    recalerPros(origine, ici, 10);
    expect(origine[0].distanceKm).toBe(42);
  });
});
