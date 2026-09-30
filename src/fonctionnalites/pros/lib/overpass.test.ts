import { analyserReponse, construireRequete } from './overpass';

const depuis = { lat: 43.3, lon: 5.4 };

describe('overpass', () => {
  it('construit une requête plombiers + électriciens dans le rayon (en mètres)', () => {
    const requete = construireRequete(depuis, 10);
    expect(requete).toContain('nwr["craft"="plumber"](around:10000,43.3,5.4)');
    expect(requete).toContain('nwr["craft"="electrician"](around:10000,43.3,5.4)');
    expect(requete).toContain('out center tags');
  });

  it('lit les points, les bâtiments (center) et les téléphones', () => {
    const pros = analyserReponse(
      {
        elements: [
          { type: 'node', id: 1, lat: 43.31, lon: 5.4, tags: { craft: 'plumber', name: 'Plomberie Martin', phone: '+33 4 91 00 00 00' } },
          { type: 'way', id: 2, center: { lat: 43.301, lon: 5.4 }, tags: { craft: 'electrician', name: 'Élec 13', 'contact:phone': '04 91 11 11 11;06 00 00 00 00' } },
        ],
      },
      depuis,
    );
    expect(pros.map((p) => p.id)).toEqual(['way/2', 'node/1']);
    expect(pros[0].telephone).toBe('04 91 11 11 11');
    expect(pros[0].metiers).toEqual(['electricien']);
    expect(pros[1].telephone).toBe('+33 4 91 00 00 00');
  });

  it('reconnaît plusieurs métiers (craft_1)', () => {
    const [pro] = analyserReponse(
      { elements: [{ type: 'node', id: 3, lat: 43.3, lon: 5.4, tags: { craft: 'plumber', craft_1: 'electrician', name: 'Multi' } }] },
      depuis,
    );
    expect(pro.metiers).toEqual(['plombier', 'electricien']);
  });

  it('ignore les entrées sans nom ni téléphone, ou sans métier connu', () => {
    const pros = analyserReponse(
      {
        elements: [
          { type: 'node', id: 4, lat: 43.3, lon: 5.4, tags: { craft: 'plumber' } },
          { type: 'node', id: 5, lat: 43.3, lon: 5.4, tags: { craft: 'carpenter', name: 'Menuisier' } },
          { type: 'node', id: 6, lat: 43.3, lon: 5.4, tags: { craft: 'plumber', phone: '0600000000' } },
        ],
      },
      depuis,
    );
    expect(pros.map((p) => p.id)).toEqual(['node/6']);
    expect(pros[0].nom).toBe('Plombier');
  });

  it('renvoie une liste vide si la réponse est invalide', () => {
    expect(analyserReponse(null, depuis)).toEqual([]);
    expect(analyserReponse({ elements: 'x' }, depuis)).toEqual([]);
  });
});
