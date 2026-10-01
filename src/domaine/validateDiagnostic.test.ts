import { validerDiagnostic, validerRenvois } from '@/domaine/validateDiagnostic';
import type { Diagnostic, Resultat } from '@/domaine/types';

describe('validerDiagnostic', () => {
  it('ne trouve aucune erreur sur un arbre valide', () => {
    const diag: Diagnostic = {
      id: 'test',
      titre: 'Test',
      categorie: 'plomberie',
      icone: 'droplets',
      motsCles: ['fuite'],
      etapeInitiale: 'q1',
      etapes: { q1: { question: 'Q1', reponses: [{ texte: 'A', suite: 'r1' }] } },
      resultats: { r1: { verdict: 'vert', titre: 'OK', conseil: 'ok' } },
    };
    expect(validerDiagnostic(diag)).toEqual([]);
  });

  it('détecte une étape initiale manquante', () => {
    const diag: Diagnostic = {
      id: 'test',
      titre: 'Test',
      categorie: 'plomberie',
      icone: 'droplets',
      motsCles: ['fuite'],
      etapeInitiale: 'introuvable',
      etapes: {},
      resultats: {},
    };
    const erreurs = validerDiagnostic(diag);
    expect(erreurs.length).toBeGreaterThan(0);
  });

  it('détecte une branche orpheline (suite vers un id inexistant)', () => {
    const diag: Diagnostic = {
      id: 'test',
      titre: 'Test',
      categorie: 'plomberie',
      icone: 'droplets',
      motsCles: ['fuite'],
      etapeInitiale: 'q1',
      etapes: { q1: { question: 'Q1', reponses: [{ texte: 'A', suite: 'nulle_part' }] } },
      resultats: {},
    };
    const erreurs = validerDiagnostic(diag);
    expect(erreurs.length).toBeGreaterThan(0);
  });

  it('accepte une étape initiale qui pointe directement vers un résultat', () => {
    const diag: Diagnostic = {
      id: 'test',
      titre: 'Test',
      categorie: 'plomberie',
      icone: 'droplets',
      motsCles: ['fuite'],
      etapeInitiale: 'r1',
      etapes: {},
      resultats: { r1: { verdict: 'rouge', titre: 'OK', conseil: 'ok' } },
    };
    expect(validerDiagnostic(diag)).toEqual([]);
  });

  it('détecte un verdict invalide', () => {
    const diag: Diagnostic = {
      id: 'test',
      titre: 'Test',
      categorie: 'plomberie',
      icone: 'droplets',
      motsCles: ['fuite'],
      etapeInitiale: 'q1',
      etapes: { q1: { question: 'Q1', reponses: [{ texte: 'A', suite: 'r1' }] } },
      resultats: { r1: { verdict: 'Rouge', titre: 'OK', conseil: 'ok' } as unknown as Resultat },
    };
    const erreurs = validerDiagnostic(diag);
    expect(erreurs.length).toBeGreaterThan(0);
  });

  it('détecte un conseil vide', () => {
    const diag: Diagnostic = {
      id: 'test',
      titre: 'Test',
      categorie: 'plomberie',
      icone: 'droplets',
      motsCles: ['fuite'],
      etapeInitiale: 'q1',
      etapes: { q1: { question: 'Q1', reponses: [{ texte: 'A', suite: 'r1' }] } },
      resultats: { r1: { verdict: 'rouge', titre: 'OK', conseil: '' } },
    };
    const erreurs = validerDiagnostic(diag);
    expect(erreurs.length).toBeGreaterThan(0);
  });

  it('détecte une suite qui pointe vers une clé héritée de Object.prototype (constructor)', () => {
    const diag: Diagnostic = {
      id: 'test',
      titre: 'Test',
      categorie: 'plomberie',
      icone: 'droplets',
      motsCles: ['fuite'],
      etapeInitiale: 'q1',
      etapes: { q1: { question: 'Q1', reponses: [{ texte: 'A', suite: 'constructor' }] } },
      resultats: {},
    };
    const erreurs = validerDiagnostic(diag);
    expect(erreurs.length).toBeGreaterThan(0);
  });

  const base = (): Diagnostic => ({
    id: 'test',
    titre: 'Test',
    categorie: 'plomberie',
    icone: 'droplets',
    motsCles: ['fuite'],
    etapeInitiale: 'q1',
    etapes: { q1: { question: 'Q1', reponses: [{ texte: 'A', suite: 'r1' }] } },
    resultats: { r1: { verdict: 'vert', titre: 'OK', conseil: 'ok' } },
  });

  it('refuse une catégorie inconnue', () => {
    const diag = { ...base(), categorie: 'gaz' as unknown as Diagnostic['categorie'] };
    expect(validerDiagnostic(diag).join(' ')).toContain('catégorie');
  });

  it('refuse une icône inconnue', () => {
    const diag = { ...base(), icone: '💧' as unknown as Diagnostic['icone'] };
    expect(validerDiagnostic(diag).join(' ')).toContain('icône');
  });

  it('refuse une liste de mots-clés vide', () => {
    const diag = { ...base(), motsCles: [] };
    expect(validerDiagnostic(diag).join(' ')).toContain('mots-clés');
  });

  it('refuse un verdict rouge qui propose un tuto', () => {
    const diag = base();
    diag.resultats = { r1: { verdict: 'rouge', titre: 'Danger', conseil: 'Appelle un pro', tutoId: 'un-tuto' } };
    const erreurs = validerDiagnostic(diag).join(' ');
    expect(erreurs).toContain('tuto');
    expect(erreurs).toContain('rouge');
  });

  it('accepte un diagnostic complet', () => {
    expect(validerDiagnostic(base())).toEqual([]);
  });
  it('accepte un renvoi vers un autre diagnostic', () => {
    const diag = base();
    diag.resultats = { r1: { verdict: 'vert', titre: 'OK', conseil: 'ok', renvoi: { type: 'diagnostic', id: 'autre' } } };
    expect(validerDiagnostic(diag)).toEqual([]);
  });

  it('refuse un renvoi de type inconnu', () => {
    const diag = base();
    diag.resultats = {
      r1: { verdict: 'vert', titre: 'OK', conseil: 'ok', renvoi: { type: 'tuto', id: 'x' } as unknown as Resultat['renvoi'] },
    };
    expect(validerDiagnostic(diag).join(' ')).toContain('renvoi');
  });

  it('refuse un renvoi sans identifiant', () => {
    const diag = base();
    diag.resultats = { r1: { verdict: 'vert', titre: 'OK', conseil: 'ok', renvoi: { type: 'urgence', id: '' } } };
    expect(validerDiagnostic(diag).join(' ')).toContain('renvoi');
  });

  it('refuse un renvoi d\'un diagnostic vers lui-même', () => {
    const diag = base();
    diag.resultats = { r1: { verdict: 'vert', titre: 'OK', conseil: 'ok', renvoi: { type: 'diagnostic', id: 'test' } } };
    expect(validerDiagnostic(diag).join(' ')).toContain('lui-même');
  });
});

describe('validerRenvois', () => {
  const avecRenvoi = (id: string, renvoi: Resultat['renvoi']): Diagnostic => ({
    id,
    titre: id,
    categorie: 'plomberie',
    icone: 'droplets',
    motsCles: ['x'],
    etapeInitiale: 'r1',
    etapes: {},
    resultats: { r1: { verdict: 'vert', titre: 'OK', conseil: 'ok', renvoi } },
  });

  it('accepte des renvois vers un diagnostic et une urgence qui existent', () => {
    const diags = [avecRenvoi('a', { type: 'diagnostic', id: 'b' }), avecRenvoi('b', { type: 'urgence', id: 'couper-gaz' })];
    expect(validerRenvois(diags, ['couper-gaz'])).toEqual([]);
  });

  it('détecte un renvoi vers un diagnostic qui n\'existe pas', () => {
    const erreurs = validerRenvois([avecRenvoi('a', { type: 'diagnostic', id: 'fantome' })], []);
    expect(erreurs.join(' ')).toContain('fantome');
  });

  it('détecte un renvoi vers une urgence qui n\'existe pas', () => {
    const erreurs = validerRenvois([avecRenvoi('a', { type: 'urgence', id: 'couper-tout' })], ['couper-gaz']);
    expect(erreurs.join(' ')).toContain('couper-tout');
  });

  it('ignore les résultats sans renvoi', () => {
    expect(validerRenvois([avecRenvoi('a', undefined)], [])).toEqual([]);
  });
});
