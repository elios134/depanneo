import { nettoyerFilAriane } from './filtre';

describe('nettoyerFilAriane', () => {
  it('supprime les appels réseau vers la recherche de pros et de villes (contiennent la position)', () => {
    expect(nettoyerFilAriane({ category: 'fetch', data: { url: 'https://overpass-api.de/api/interpreter?data=...' } })).toBeNull();
    expect(nettoyerFilAriane({ category: 'xhr', data: { url: 'https://overpass.private.coffee/api/interpreter' } })).toBeNull();
    expect(nettoyerFilAriane({ category: 'xhr', data: { url: 'https://maps.mail.ru/osm/tools/overpass/api/interpreter' } })).toBeNull();
    expect(nettoyerFilAriane({ category: 'fetch', data: { url: 'https://data.geopf.fr/geocodage/search?q=Aubagne' } })).toBeNull();
  });
  it('supprime les appels de tuiles de carte (l’adresse contient la position)', () => {
    expect(nettoyerFilAriane({ category: 'fetch', data: { url: 'https://tiles.openfreemap.org/planet/20260101/5/16/11.pbf' } })).toBeNull();
  });
  it('garde les autres miettes', () => {
    const miette = { category: 'navigation', data: { to: '/tutos' } };
    expect(nettoyerFilAriane(miette)).toBe(miette);
  });
  it('garde un appel réseau sans rapport avec la position', () => {
    const miette = { category: 'fetch', data: { url: 'https://exemple.org/autre' } };
    expect(nettoyerFilAriane(miette)).toBe(miette);
  });
});
