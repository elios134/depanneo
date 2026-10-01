import { libelleLieu } from './lieux';
import { metierDeCategorie, sousTitrePro, type Pro } from './pro';

describe('pro et lieux', () => {
  it('déduit le métier de la catégorie de panne', () => {
    expect(metierDeCategorie('plomberie')).toBe('plombier');
    expect(metierDeCategorie('electricite')).toBe('electricien');
  });

  it('affiche un lieu avec son code postal', () => {
    expect(libelleLieu({ nom: 'Marseille', codePostal: '13013', position: { lat: 0, lon: 0 } })).toBe('Marseille (13013)');
    expect(libelleLieu({ nom: 'Lyon', codePostal: '', position: { lat: 0, lon: 0 } })).toBe('Lyon');
  });

  it('liste tous les métiers du pro dans le sous-titre', () => {
    const pro: Pro = { id: '1', nom: 'Dupont', metiers: ['plombier', 'electricien'], telephone: null, lat: 0, lon: 0, distanceKm: 2 };
    const texte = sousTitrePro(pro);
    expect(texte).toContain('Plombier · Électricien · ');
    expect(sousTitrePro({ ...pro, metiers: ['electricien'] })).toMatch(/^Électricien · /);
  });
});
