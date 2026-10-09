import { lienChercherNumero, lienFicheOfficielle, lienGoogleMaps } from './liensPro';
import type { Pro } from './pro';

const pro: Pro = {
  id: 'registre/1', nom: 'VM Plomberie', metiers: ['plombier'], telephone: null, lat: 43.3, lon: 5.4, distanceKm: 1, ville: 'Marseille',
};

describe('liens des pros', () => {
  it('fiche officielle sur annuaire-entreprises', () => {
    expect(lienFicheOfficielle('40215610300036')).toBe('https://annuaire-entreprises.data.gouv.fr/etablissement/40215610300036');
  });
  it('recherche du numéro : nom + ville + téléphone', () => {
    expect(lienChercherNumero(pro)).toBe('https://www.google.com/search?q=VM%20Plomberie%20Marseille%20t%C3%A9l%C3%A9phone');
  });
  it('Google Maps suit le filtre', () => {
    const ici = { lat: 43.2965, lon: 5.3698 };
    expect(lienGoogleMaps(ici, 'plombier')).toBe('https://www.google.com/maps/search/plombier/@43.2965,5.3698,14z');
    expect(lienGoogleMaps(ici, 'electricien')).toBe('https://www.google.com/maps/search/%C3%A9lectricien/@43.2965,5.3698,14z');
    expect(lienGoogleMaps(ici, 'tous')).toBe('https://www.google.com/maps/search/plombier%20%C3%A9lectricien/@43.2965,5.3698,14z');
  });
});
