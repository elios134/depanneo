import { libelleLieu } from './lieux';
import { estJoignable, metierDeCategorie, sousTitrePro, texteRge, type Pro } from './pro';

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

const base: Pro = { id: 'x', nom: 'X', metiers: ['plombier'], telephone: null, lat: 43.3, lon: 5.4, distanceKm: 1 };

describe('estJoignable', () => {
  it('vrai avec un téléphone', () => {
    expect(estJoignable({ ...base, telephone: '04 91 00 00 00' })).toBe(true);
  });
  it('faux sans téléphone ou avec un téléphone vide', () => {
    expect(estJoignable(base)).toBe(false);
    expect(estJoignable({ ...base, telephone: '' })).toBe(false);
  });
});

describe('texteRge', () => {
  it('phrase avec organisme en majuscule et date française', () => {
    expect(
      texteRge({ qualification: 'Installation de plomberie sanitaire', organisme: 'qualibat', finValidite: '2030-07-11' }),
    ).toBe('Qualification « Installation de plomberie sanitaire » vérifiée par Qualibat, valable jusqu’au 11/07/2030.');
  });
});
