import { libelleLieu } from './lieux';
import { metierDeCategorie } from './pro';

describe('pro et lieux', () => {
  it('déduit le métier de la catégorie de panne', () => {
    expect(metierDeCategorie('plomberie')).toBe('plombier');
    expect(metierDeCategorie('electricite')).toBe('electricien');
  });

  it('affiche un lieu avec son code postal', () => {
    expect(libelleLieu({ nom: 'Marseille', codePostal: '13013', position: { lat: 0, lon: 0 } })).toBe('Marseille (13013)');
    expect(libelleLieu({ nom: 'Lyon', codePostal: '', position: { lat: 0, lon: 0 } })).toBe('Lyon');
  });
});
