import { analyserRge, construireUrlRge, metiersRge } from './rge';

const ici = { lat: 43.2965, lon: 5.3698 };
const ligne = (extra: Record<string, unknown>) => ({
  siret: '05680647400021',
  nom_entreprise: 'ETABLISSEMENTS SOUCHON',
  adresse: '46 RUE DE LA BIBLIOTHEQUE',
  code_postal: '13001',
  commune: 'MARSEILLE',
  latitude: 43.2958,
  longitude: 5.386,
  telephone: '04 91 42 14 47',
  email: 'contact@exemple.fr',
  site_internet: null,
  nom_qualification: 'Installation de plomberie sanitaire en habitat individuel',
  organisme: 'qualibat',
  lien_date_fin: '2030-07-11',
  ...extra,
});

describe('construireUrlRge', () => {
  it('cherche autour du point, trie par distance, pros des particuliers', () => {
    const url = construireUrlRge(ici, 10);
    expect(url).toContain('https://data.ademe.fr/data-fair/api/v1/datasets/eo1n335dwa-ul7glxa7lm1ho/lines?');
    expect(url).toContain(`geo_distance=${encodeURIComponent('5.3698,43.2965,10km')}`);
    expect(url).toContain(`sort=${encodeURIComponent('_geo_distance:5.3698:43.2965')}`);
    expect(url).toContain(`qs=${encodeURIComponent('particulier:true')}`);
    expect(url).toContain('q_fields=nom_qualification');
    expect(url).toContain('size=1000');
  });
});

describe('metiersRge', () => {
  it('reconnaît plombier et électricien', () => {
    expect(metiersRge('Installation de plomberie sanitaire')).toEqual(['plombier']);
    expect(metiersRge('Efficacité énergétique - "ECO Artisan®" - Plombier')).toEqual(['plombier']);
    expect(metiersRge('QualiPAC CET - Pose de chauffe-eau thermodynamique')).toEqual(['plombier']);
    expect(metiersRge('Efficacité énergétique - "ECO Artisan®" - Électricien')).toEqual(['electricien']);
    expect(metiersRge('Radiateurs électriques, dont régulation')).toEqual(['electricien']);
  });
  it('ignore les autres qualifications', () => {
    expect(metiersRge('Couverture en plomb')).toEqual([]);
    expect(metiersRge('Isolation thermique par l’extérieur')).toEqual([]);
  });
});

describe('analyserRge', () => {
  it('regroupe les lignes par SIRET et garde le label le plus long', () => {
    const pros = analyserRge(
      {
        results: [
          ligne({ lien_date_fin: '2027-01-01' }),
          ligne({ nom_qualification: 'Radiateurs électriques, dont régulation', lien_date_fin: '2030-07-11' }),
        ],
      },
      ici,
      '2026-10-09',
    );
    expect(pros).toHaveLength(1);
    expect(pros[0]).toMatchObject({
      id: 'rge/05680647400021',
      source: 'rge',
      siret: '05680647400021',
      nom: 'Etablissements Souchon',
      metiers: ['plombier', 'electricien'],
      telephone: '04 91 42 14 47',
      adresse: '46 Rue de la Bibliotheque, 13001 Marseille',
      ville: 'Marseille',
      email: 'contact@exemple.fr',
      siteWeb: null,
      rge: { qualification: 'Radiateurs électriques, dont régulation', organisme: 'qualibat', finValidite: '2030-07-11' },
    });
    expect(pros[0].distanceKm).toBeGreaterThan(0);
  });
  it('écarte les labels expirés et les qualifications hors métier', () => {
    const pros = analyserRge(
      {
        results: [
          ligne({ lien_date_fin: '2026-10-08' }),
          ligne({ siret: '2', nom_qualification: 'Isolation thermique par l’extérieur' }),
        ],
      },
      ici,
      '2026-10-09',
    );
    expect(pros).toEqual([]);
  });
  it('écarte les lignes sans SIRET ou sans position, et un téléphone vide devient null', () => {
    const pros = analyserRge(
      { results: [ligne({ siret: null }), ligne({ siret: '3', latitude: 'x' }), ligne({ siret: '4', telephone: '  ' })] },
      ici,
      '2026-10-09',
    );
    expect(pros.map((p) => p.id)).toEqual(['rge/4']);
    expect(pros[0].telephone).toBeNull();
  });
  it('réponse illisible : liste vide', () => {
    expect(analyserRge(null, ici, '2026-10-09')).toEqual([]);
    expect(analyserRge({ results: 'non' }, ici, '2026-10-09')).toEqual([]);
  });
});
