import { analyserRegistre, construireUrlRegistre, metierNaf, rayonsEssai } from './registre';

const ici = { lat: 43.2965, lon: 5.3698 };
const etab = (extra: Record<string, unknown>) => ({
  siret: '40215610300036',
  activite_principale: '43.22A',
  etat_administratif: 'A',
  latitude: '43.2990',
  longitude: '5.3720',
  code_postal: '13001',
  adresse: '618 RUE SAINT PIERRE 13001 MARSEILLE',
  libelle_commune: 'MARSEILLE',
  liste_enseignes: null,
  nom_commercial: null,
  date_creation: '1997-08-20',
  ...extra,
});
const reponse = (etablissements: unknown[], extra: Record<string, unknown> = {}) => ({
  total_results: 42,
  results: [{ nom_complet: 'GERARD GUNALONS', activite_principale: '43.22A', matching_etablissements: etablissements, ...extra }],
});

describe('construireUrlRegistre', () => {
  it('cherche les codes demandés autour du point', () => {
    expect(construireUrlRegistre(ici, 2, ['43.22A', '43.21A'], 1)).toBe(
      'https://recherche-entreprises.api.gouv.fr/near_point?lat=43.2965&long=5.3698&radius=2&activite_principale=43.22A%2C43.21A&per_page=25&page=1',
    );
  });
});

describe('rayonsEssai', () => {
  it('rayons croissants jusqu’au rayon des réglages', () => {
    expect(rayonsEssai(5)).toEqual([1, 2, 5]);
    expect(rayonsEssai(10)).toEqual([1, 2, 5, 10]);
    expect(rayonsEssai(20)).toEqual([1, 2, 5, 10, 20]);
    expect(rayonsEssai(3)).toEqual([1, 2, 3]);
  });
});

describe('metierNaf', () => {
  it('codes actuels et codes 2025', () => {
    expect(metierNaf('43.22A')).toBe('plombier');
    expect(metierNaf('43.22G')).toBe('plombier');
    expect(metierNaf('43.21A')).toBe('electricien');
    expect(metierNaf('43.21G')).toBe('electricien');
    expect(metierNaf('43.22B')).toBeNull();
  });
});

describe('analyserRegistre', () => {
  it('un pro par établissement ouvert, sans téléphone', () => {
    const { pros, total } = analyserRegistre(reponse([etab({})]), ici, 5);
    expect(total).toBe(42);
    expect(pros).toHaveLength(1);
    expect(pros[0]).toMatchObject({
      id: 'registre/40215610300036',
      source: 'registre',
      siret: '40215610300036',
      nom: 'Gerard Gunalons',
      metiers: ['plombier'],
      telephone: null,
      adresse: '618 Rue Saint Pierre 13001 Marseille',
      ville: 'Marseille',
      anneeCreation: 1997,
    });
  });
  it('préfère l’enseigne, puis le nom commercial, puis le nom sans parenthèses', () => {
    expect(analyserRegistre(reponse([etab({ liste_enseignes: ['ADIBILLON ASSISTANCE 13'] })]), ici, 5).pros[0].nom).toBe('Adibillon Assistance 13');
    expect(analyserRegistre(reponse([etab({ nom_commercial: 'VM PLOMBERIE' })]), ici, 5).pros[0].nom).toBe('Vm Plomberie');
    expect(
      analyserRegistre(reponse([etab({})], { nom_complet: 'VINCENT MEOLA (VM PLOMBERIE)' }), ici, 5).pros[0].nom,
    ).toBe('Vincent Meola');
  });
  it('écarte les établissements fermés, étrangers, hors rayon ou sans position', () => {
    const { pros } = analyserRegistre(
      reponse([
        etab({ siret: '1', etat_administratif: 'F' }),
        etab({ siret: '2', code_postal: '1000-001' }),
        etab({ siret: '3', latitude: '44.5' }),
        etab({ siret: '4', latitude: null }),
        etab({ siret: '5', activite_principale: '41.20A' }),
        etab({ siret: '6' }),
      ]),
      ici,
      5,
    );
    expect(pros.map((p) => p.id)).toEqual(['registre/6']);
  });
  it('réponse illisible : rien', () => {
    expect(analyserRegistre(null, ici, 5)).toEqual({ pros: [], total: 0 });
    expect(analyserRegistre({ results: [null, { matching_etablissements: 'x' }] }, ici, 5)).toEqual({ pros: [], total: 0 });
  });
});
