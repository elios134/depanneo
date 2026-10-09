import type { Pro } from '@/domaine/pro';
import { fusionnerPros, MAX_SANS_TELEPHONE } from './fusion';

const pro = (extra: Partial<Pro>): Pro => ({
  id: 'x', nom: 'X', metiers: ['plombier'], telephone: null, lat: 43.3, lon: 5.4, distanceKm: 1, ...extra,
});

describe('fusionnerPros', () => {
  it('registre + RGE de même SIRET : un seul pro, celui du RGE', () => {
    const rge = pro({ id: 'rge/1', source: 'rge', siret: '1', nom: 'Souchon', telephone: '04', metiers: ['plombier'], rge: { qualification: 'q', organisme: 'qualibat', finValidite: '2030-01-01' } });
    const registre = pro({ id: 'registre/1', source: 'registre', siret: '1', nom: 'Gerard Souchon', metiers: ['electricien'], anneeCreation: 1990 });
    const fusion = fusionnerPros({ osm: [], rge: [rge], registre: [registre] });
    expect(fusion).toHaveLength(1);
    expect(fusion[0]).toMatchObject({ id: 'rge/1', source: 'rge', telephone: '04', metiers: ['plombier', 'electricien'], anneeCreation: 1990 });
  });

  it('OSM + autre source, même nom à moins de 150 m : un seul pro enrichi', () => {
    const osm = pro({ id: 'node/9', nom: 'Plomberie Durand', telephone: null, horaires: 'Mo-Fr 08:00-18:00', lat: 43.3, lon: 5.4 });
    const registre = pro({ id: 'registre/2', source: 'registre', siret: '2', nom: 'SARL PLOMBERIE DURAND', lat: 43.3005, lon: 5.4, anneeCreation: 2001 });
    const fusion = fusionnerPros({ osm: [osm], rge: [], registre: [registre] });
    expect(fusion).toHaveLength(1);
    expect(fusion[0]).toMatchObject({ id: 'node/9', source: 'osm', siret: '2', horaires: 'Mo-Fr 08:00-18:00', anneeCreation: 2001, nom: 'Plomberie Durand' });
  });

  it('OSM + RGE : téléphone OSM prioritaire, source RGE gardée', () => {
    const osm = pro({ id: 'node/1', nom: 'Élec 13', telephone: '06', metiers: ['electricien'] });
    const rge = pro({ id: 'rge/3', source: 'rge', siret: '3', nom: 'ELEC 13', telephone: '04', metiers: ['electricien'], rge: { qualification: 'q', organisme: 'qualifelec', finValidite: '2030-01-01' } });
    const [seul] = fusionnerPros({ osm: [osm], rge: [rge], registre: [] });
    expect(seul).toMatchObject({ source: 'rge', telephone: '06', siret: '3' });
    expect(seul.rge).not.toBeNull();
  });

  it('même nom mais trop loin : deux pros', () => {
    const osm = pro({ id: 'node/1', nom: 'Durand', lat: 43.3, lon: 5.4 });
    const registre = pro({ id: 'registre/4', source: 'registre', siret: '4', nom: 'DURAND', lat: 43.31, lon: 5.4 });
    expect(fusionnerPros({ osm: [osm], rge: [], registre: [registre] })).toHaveLength(2);
  });

  it('joignables d’abord, puis 30 sans téléphone au plus, chacun par distance', () => {
    const loinAppelable = pro({ id: 'node/1', nom: 'A', telephone: '04', distanceKm: 4 });
    const presAppelable = pro({ id: 'rge/1', source: 'rge', nom: 'B', telephone: '04', distanceKm: 2 });
    const registre = Array.from({ length: 35 }, (_, i) =>
      pro({ id: `registre/${i}`, source: 'registre', siret: String(i), nom: `R${i}`, distanceKm: 35 - i, lat: 43 + i / 10 }),
    );
    const fusion = fusionnerPros({ osm: [loinAppelable], rge: [presAppelable], registre });
    expect(fusion.slice(0, 2).map((p) => p.id)).toEqual(['rge/1', 'node/1']);
    const sans = fusion.slice(2);
    expect(sans).toHaveLength(MAX_SANS_TELEPHONE);
    expect(sans[0].distanceKm).toBe(1);
    expect(sans.every((p, i) => i === 0 || sans[i - 1].distanceKm <= p.distanceKm)).toBe(true);
  });
});
