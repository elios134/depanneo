import { analyserGeocodage, construireUrlGeocodage } from './geocodage';

describe('géocodage', () => {
  it("construit l'URL de recherche des communes", () => {
    expect(construireUrlGeocodage(' Marseille 13e ')).toBe(
      'https://data.geopf.fr/geocodage/search?q=Marseille%2013e&type=municipality&limit=5',
    );
  });

  it("lit les communes (coordonnées dans l'ordre longitude, latitude)", () => {
    const lieux = analyserGeocodage({
      features: [
        {
          geometry: { type: 'Point', coordinates: [5.429033, 43.340303] },
          properties: { label: 'Marseille 13e Arrondissement', city: 'Marseille 13e Arrondissement', postcode: '13013' },
        },
        { geometry: { type: 'Point', coordinates: ['x', 1] }, properties: { city: 'Invalide' } },
      ],
    });
    expect(lieux).toEqual([
      { nom: 'Marseille 13e Arrondissement', codePostal: '13013', position: { lat: 43.340303, lon: 5.429033 } },
    ]);
  });

  it('renvoie une liste vide si la réponse est invalide', () => {
    expect(analyserGeocodage(null)).toEqual([]);
  });
});
