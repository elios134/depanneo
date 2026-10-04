import { titreQuiPaie } from './quiPaie';

describe('titreQuiPaie', () => {
  const cas = [
    ['locataire', 'locataire', 'À ta charge', 'vert'],
    ['locataire', 'proprietaire', 'À ta charge', 'vert'],
    ['locataire', 'non-precise', 'Locataire : entretien courant', 'neutre'],
    ['proprietaire', 'locataire', 'À la charge du propriétaire : préviens-le', 'orange'],
    ['proprietaire', 'proprietaire', 'À ta charge', 'vert'],
    ['proprietaire', 'non-precise', 'Propriétaire', 'neutre'],
    ['depend', 'locataire', 'Ça dépend de la cause', 'neutre'],
    ['depend', 'proprietaire', 'À ta charge', 'vert'],
    ['depend', 'non-precise', 'Ça dépend de la cause', 'neutre'],
    ['autre', 'locataire', "Un autre organisme s'en occupe", 'neutre'],
    ['autre', 'proprietaire', "Un autre organisme s'en occupe", 'neutre'],
    ['autre', 'non-precise', "Un autre organisme s'en occupe", 'neutre'],
  ] as const;

  it.each(cas)('%s + %s → « %s » (%s)', (qui, statut, titre, ton) => {
    expect(titreQuiPaie(qui, statut)).toEqual({ titre, ton });
  });

  it('traite un statut null comme non précisé', () => {
    expect(titreQuiPaie('locataire', null)).toEqual(titreQuiPaie('locataire', 'non-precise'));
    expect(titreQuiPaie('proprietaire', null)).toEqual({ titre: 'Propriétaire', ton: 'neutre' });
  });
});
