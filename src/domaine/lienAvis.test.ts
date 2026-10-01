import { lienAvis } from './lienAvis';
import type { Pro } from './pro';

const base: Pro = { id: 'node/1', nom: 'Sodexal', metiers: ['plombier'], telephone: null, lat: 0, lon: 0, distanceKm: 1 };
const url = (q: string) => `https://www.google.com/search?q=${encodeURIComponent(q)}`;

describe('lienAvis', () => {
  it('utilise nom + ville + avis', () => {
    expect(lienAvis({ ...base, ville: 'Marseille' })).toBe(url('Sodexal Marseille avis'));
  });

  it("se rabat sur le code postal de l'adresse", () => {
    expect(lienAvis({ ...base, adresse: '12 rue de la Rose, 13013' })).toBe(url('Sodexal 13013 avis'));
  });

  it('sans ville ni code postal : nom + métier + avis, sans double espace', () => {
    expect(lienAvis(base)).toBe(url('Sodexal plombier avis'));
    expect(lienAvis({ ...base, nom: '  Sodexal  ', ville: '  ' })).toBe(url('Sodexal plombier avis'));
  });
});
