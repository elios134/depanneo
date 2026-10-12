import { chercherRegistre } from './chercherRegistre';

const ici = { lat: 43.2965, lon: 5.3698 };
const etab = (siret: string) => ({
  siret, activite_principale: '43.22A', etat_administratif: 'A', latitude: '43.2966', longitude: '5.3699',
  code_postal: '13001', adresse: 'RUE', libelle_commune: 'MARSEILLE', date_creation: '2000-01-01',
});
const corps = (total: number, sirets: string[]) => ({
  total_results: total,
  results: sirets.map((s) => ({ nom_complet: `ARTISAN ${s}`, activite_principale: '43.22A', matching_etablissements: [etab(s)] })),
});
const reponseOk = (json: unknown) => ({ ok: true, status: 200, json: async () => json, text: async () => JSON.stringify(json) });
const reponse400 = (message: string) => ({ ok: false, status: 400, json: async () => ({ erreur: message }), text: async () => JSON.stringify({ erreur: message }) });

let appels: string[];
const fetchOriginal = global.fetch;
beforeEach(() => {
  appels = [];
  jest.useFakeTimers({ doNotFake: ['nextTick', 'setImmediate'] });
});
afterEach(() => {
  jest.useRealTimers();
  jest.restoreAllMocks();
  global.fetch = fetchOriginal;
});

function simuler(reponses: ((url: string) => unknown)[]) {
  global.fetch = jest.fn(async (url: string) => {
    appels.push(url);
    const suivante = reponses.shift();
    if (!suivante) throw new Error('appel inattendu');
    return suivante(url);
  }) as unknown as typeof fetch;
}

// Lecture d'un paramètre d'adresse sans dépendre de URL (incomplet dans l'environnement React Native de Jest).
const param = (url: string, cle: string) => decodeURIComponent(new RegExp(`[?&]${cle}=([^&]*)`).exec(url)?.[1] ?? '');

async function lancer<T>(promesse: Promise<T>): Promise<T> {
  promesse.catch(() => undefined); // évite un avertissement de rejet non géré pendant l'avance des minuteurs
  // Fait avancer les pauses entre requêtes.
  for (let i = 0; i < 20; i++) await jest.advanceTimersByTimeAsync(200);
  return promesse;
}

describe('chercherRegistre', () => {
  it('élargit le rayon tant qu’il y a moins de 30 entreprises', async () => {
    simuler([() => reponseOk(corps(3, ['1'])), () => reponseOk(corps(12, ['1', '2'])), () => reponseOk(corps(20, ['1', '2', '3']))]);
    const pros = await lancer(chercherRegistre(ici, 5));
    expect(appels.map((u) => param(u, 'radius'))).toEqual(['1', '2', '5']);
    expect(pros.map((p) => p.id).sort()).toEqual(['registre/1', 'registre/2', 'registre/3']);
  });

  it('s’arrête dès 30 entreprises et lit une deuxième page', async () => {
    simuler([() => reponseOk(corps(472, ['1', '2'])), () => reponseOk(corps(472, ['2', '3']))]);
    const pros = await lancer(chercherRegistre(ici, 10));
    expect(appels.map((u) => [param(u, 'radius'), param(u, 'page')])).toEqual([['1', '1'], ['1', '2']]);
    expect(pros.map((p) => p.id).sort()).toEqual(['registre/1', 'registre/2', 'registre/3']);
  });

  it('bascule sur les codes NAF 2025 si l’API refuse les anciens', async () => {
    simuler([
      () => reponse400('Au moins un paramètre `activite_principale` est non valide.'),
      () => reponseOk(corps(40, ['1'])),
      () => reponseOk(corps(40, ['2'])),
    ]);
    await lancer(chercherRegistre(ici, 5));
    expect(param(appels[0], 'activite_principale')).toBe('43.22A,43.21A');
    expect(param(appels[1], 'activite_principale')).toBe('43.22G,43.21G');
    expect(param(appels[2], 'activite_principale')).toBe('43.22G,43.21G');
  });

  it('une autre erreur 400 n’entraîne pas de bascule', async () => {
    simuler([() => reponse400('rayon non valide')]);
    await expect(lancer(chercherRegistre(ici, 5))).rejects.toMatchObject({ statut: 400 });
    expect(appels).toHaveLength(1);
  });

  it('un rayon élargi qui échoue : renvoie les résultats du rayon précédent', async () => {
    simuler([
      () => reponseOk(corps(3, ['1'])),
      () => {
        throw new TypeError('Network request failed');
      },
    ]);
    const pros = await lancer(chercherRegistre(ici, 5));
    expect(appels).toHaveLength(2);
    expect(pros.map((p) => p.id)).toEqual(['registre/1']);
  });

  it('budget de 15 s épuisé : plus aucune requête, résultats précédents renvoyés', async () => {
    simuler([
      () => {
        jest.setSystemTime(Date.now() + 16000);
        return reponseOk(corps(3, ['1']));
      },
      () => reponseOk(corps(12, ['1', '2'])),
    ]);
    const pros = await lancer(chercherRegistre(ici, 5));
    expect(appels).toHaveLength(1);
    expect(pros.map((p) => p.id)).toEqual(['registre/1']);
  });
});
