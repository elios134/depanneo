import type { Pro } from '@/domaine/pro';
import { EchecPros } from '../lib/echecPros';
import { chercherPros } from './chercherPros';
import { chercherOsm } from './chercherOsm';
import { chercherRegistre } from './chercherRegistre';
import { chercherRge } from './chercherRge';

jest.mock('./chercherOsm', () => ({ chercherOsm: jest.fn() }));
jest.mock('./chercherRge', () => ({ chercherRge: jest.fn() }));
jest.mock('./chercherRegistre', () => ({ chercherRegistre: jest.fn() }));

const osm = chercherOsm as jest.Mock;
const rge = chercherRge as jest.Mock;
const registre = chercherRegistre as jest.Mock;

const pro = (id: string, telephone: string | null, lat: number): Pro => ({
  id, nom: id, metiers: ['plombier'], telephone, lat, lon: 5.4, distanceKm: 0,
});

beforeEach(() => jest.resetAllMocks());

describe('chercherPros', () => {
  it('fusionne les trois sources', async () => {
    osm.mockResolvedValue([pro('node/1', '04', 43.301)]);
    rge.mockResolvedValue([{ ...pro('rge/1', '05', 43.302), source: 'rge', siret: '1' }]);
    registre.mockResolvedValue([{ ...pro('registre/2', null, 43.303), source: 'registre', siret: '2' }]);
    const { pros, partiel } = await chercherPros({ lat: 43.3, lon: 5.4 }, 10);
    expect(pros.map((p) => p.id)).toEqual(['node/1', 'rge/1', 'registre/2']);
    expect(partiel).toBe(false);
  });

  it('une source en panne : les autres s’affichent', async () => {
    osm.mockRejectedValue(new EchecPros('indisponible'));
    rge.mockResolvedValue([]);
    registre.mockResolvedValue([{ ...pro('registre/2', null, 43.31), source: 'registre', siret: '2' }]);
    const { pros, partiel } = await chercherPros({ lat: 43.31, lon: 5.41 }, 10);
    expect(pros.map((p) => p.id)).toEqual(['registre/2']);
    expect(partiel).toBe(true);
  });

  it('trois sources hors ligne : échec « hors-ligne »', async () => {
    osm.mockRejectedValue(new EchecPros('hors-ligne'));
    rge.mockRejectedValue(new TypeError('Network request failed'));
    registre.mockRejectedValue(new TypeError('Network request failed'));
    await expect(chercherPros({ lat: 43.32, lon: 5.42 }, 10)).rejects.toMatchObject({ raison: 'hors-ligne' });
  });

  it('trois échecs dont un serveur en erreur : échec « indisponible »', async () => {
    osm.mockRejectedValue(new EchecPros('hors-ligne'));
    rge.mockRejectedValue(new Error('Le service a répondu 503'));
    registre.mockRejectedValue(new TypeError('Network request failed'));
    await expect(chercherPros({ lat: 43.33, lon: 5.43 }, 10)).rejects.toMatchObject({ raison: 'indisponible' });
  });
});
