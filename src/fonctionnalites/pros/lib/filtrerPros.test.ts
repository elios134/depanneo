import type { Pro } from '@/domaine/pro';
import { filtrerPros } from './filtrerPros';

const pro = (id: string, metiers: Pro['metiers']): Pro => ({ id, nom: id, metiers, telephone: null, lat: 0, lon: 0, distanceKm: 0 });
const liste = [pro('a', ['plombier']), pro('b', ['electricien']), pro('c', ['plombier', 'electricien'])];

describe('filtrerPros', () => {
  it('garde tout pour « tous »', () => {
    expect(filtrerPros(liste, 'tous').map((p) => p.id)).toEqual(['a', 'b', 'c']);
  });
  it('filtre par métier', () => {
    expect(filtrerPros(liste, 'plombier').map((p) => p.id)).toEqual(['a', 'c']);
    expect(filtrerPros(liste, 'electricien').map((p) => p.id)).toEqual(['b', 'c']);
  });
});
