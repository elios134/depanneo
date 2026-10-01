import { ecrireReglages, lireReglages, REGLAGES_DEFAUT } from './reglages';

describe('réglages', () => {
  it('renvoie les valeurs par défaut sans données', () => {
    expect(lireReglages(null)).toEqual(REGLAGES_DEFAUT);
  });

  it('a pour défauts : thème sombre, 10 km, localisation activée, pas de ville', () => {
    expect(REGLAGES_DEFAUT).toEqual({ theme: 'sombre', rayonKm: 10, localisation: true, villeParDefaut: null });
  });

  it('renvoie les défauts si le texte stocké est illisible', () => {
    expect(lireReglages('{pas du json')).toEqual(REGLAGES_DEFAUT);
  });

  it('complète un réglage partiel avec les défauts', () => {
    expect(lireReglages(JSON.stringify({ theme: 'clair' }))).toEqual({ ...REGLAGES_DEFAUT, theme: 'clair' });
  });

  it('ignore une valeur invalide et garde le défaut de ce champ', () => {
    const lu = lireReglages(JSON.stringify({ theme: 'rose', rayonKm: 7, localisation: 'oui', villeParDefaut: 42 }));
    expect(lu).toEqual(REGLAGES_DEFAUT);
  });

  it('relit exactement ce qui a été écrit', () => {
    const r = {
      theme: 'auto' as const,
      rayonKm: 20 as const,
      localisation: false,
      villeParDefaut: { nom: 'Marseille', codePostal: '13013', position: { lat: 43.34, lon: 5.43 } },
    };
    expect(lireReglages(ecrireReglages(r))).toEqual(r);
  });

  it('ignore une ville par défaut mal formée', () => {
    const lu = lireReglages(JSON.stringify({ villeParDefaut: { nom: 'Marseille', position: { lat: 'x', lon: 5 } } }));
    expect(lu.villeParDefaut).toBeNull();
  });
});
