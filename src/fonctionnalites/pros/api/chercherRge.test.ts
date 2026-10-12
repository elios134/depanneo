import { chercherRge } from './chercherRge';

const fetchOriginal = global.fetch;
afterEach(() => {
  jest.restoreAllMocks();
  global.fetch = fetchOriginal;
});

describe('chercherRge', () => {
  it('interroge l’annuaire et renvoie les pros analysés', async () => {
    global.fetch = jest.fn(async () => ({
      ok: true,
      status: 200,
      json: async () => ({
        results: [{
          siret: '1', nom_entreprise: 'ELEC 13', latitude: 43.3, longitude: 5.4, telephone: '04',
          nom_qualification: 'Efficacité énergétique - ECO Artisan - Électricien', organisme: 'qualibat', lien_date_fin: '2030-01-01',
        }],
      }),
    })) as unknown as typeof fetch;
    const pros = await chercherRge({ lat: 43.3, lon: 5.4 }, 10, '2026-10-09');
    expect(pros.map((p) => p.id)).toEqual(['rge/1']);
    expect((global.fetch as jest.Mock).mock.calls[0][0]).toContain('data.ademe.fr');
  });

  it('erreur HTTP : rejette avec le statut', async () => {
    global.fetch = jest.fn(async () => ({ ok: false, status: 503, text: async () => 'indisponible' })) as unknown as typeof fetch;
    await expect(chercherRge({ lat: 43.3, lon: 5.4 }, 10, '2026-10-09')).rejects.toMatchObject({ statut: 503 });
  });
});
