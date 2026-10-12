import { ageTexte, doitRafraichir, ecrireCache, lireCache, type CachePros } from './cachePros';

const HEURE = 60 * 60 * 1000;
const cache: CachePros = {
  pros: [{ id: 'node/1', nom: 'A', metiers: ['plombier'], telephone: null, lat: 43.3, lon: 5.4, distanceKm: 0.2 }],
  centre: { lat: 43.3, lon: 5.4 },
  rayonKm: 10,
  date: 0,
  version: 2,
};

describe('cache des pros', () => {
  it('rafraîchit sans cache', () => {
    expect(doitRafraichir(null, cache.centre, 10, 0)).toBe(true);
  });
  it('garde le cache récent, au même endroit et au même rayon', () => {
    expect(doitRafraichir(cache, { lat: 43.301, lon: 5.4 }, 10, 2 * HEURE)).toBe(false);
  });
  it('rafraîchit si on a bougé de plus de 1 km', () => {
    expect(doitRafraichir(cache, { lat: 43.32, lon: 5.4 }, 10, HEURE)).toBe(true);
  });
  it('rafraîchit si le rayon change', () => {
    expect(doitRafraichir(cache, cache.centre, 20, HEURE)).toBe(true);
  });
  it('rafraîchit après 24 h', () => {
    expect(doitRafraichir(cache, cache.centre, 10, 25 * HEURE)).toBe(true);
  });
  it('relit ce qui a été écrit et refuse un texte illisible', () => {
    expect(lireCache(ecrireCache(cache))).toEqual(cache);
    expect(lireCache('{oups')).toBeNull();
    expect(lireCache(JSON.stringify({ pros: 'x' }))).toBeNull();
    expect(lireCache(null)).toBeNull();
  });
  it('dit depuis quand la liste est enregistrée', () => {
    expect(ageTexte(0, 30 * 1000)).toBe("à l'instant");
    expect(ageTexte(0, 5 * 60 * 1000)).toBe('il y a 5 min');
    expect(ageTexte(0, 3 * HEURE)).toBe('il y a 3 h');
    expect(ageTexte(0, 24 * HEURE)).toBe('il y a 1 jour');
    expect(ageTexte(0, 50 * HEURE)).toBe('il y a 2 jours');
  });
});

describe('version du cache', () => {
  const centre = { lat: 43.3, lon: 5.4 };
  const maintenant = 1_000_000_000;
  it('un cache sans version (ancienne appli) doit être rafraîchi', () => {
    expect(doitRafraichir({ pros: [], centre, rayonKm: 10, date: maintenant }, centre, 10, maintenant)).toBe(true);
  });
  it('un cache partiel de 10 min reste valable', () => {
    expect(doitRafraichir({ pros: [], centre, rayonKm: 10, date: maintenant - 10 * 60 * 1000, version: 2, partiel: true }, centre, 10, maintenant)).toBe(false);
  });
  it('un cache partiel de 16 min est rafraîchi', () => {
    expect(doitRafraichir({ pros: [], centre, rayonKm: 10, date: maintenant - 16 * 60 * 1000, version: 2, partiel: true }, centre, 10, maintenant)).toBe(true);
  });
  it('un cache complet de 16 min reste valable', () => {
    expect(doitRafraichir({ pros: [], centre, rayonKm: 10, date: maintenant - 16 * 60 * 1000, version: 2, partiel: false }, centre, 10, maintenant)).toBe(false);
  });
  it('un cache en version 2 récent et proche reste valable', () => {
    expect(doitRafraichir({ pros: [], centre, rayonKm: 10, date: maintenant, version: 2 }, centre, 10, maintenant)).toBe(false);
  });
});
