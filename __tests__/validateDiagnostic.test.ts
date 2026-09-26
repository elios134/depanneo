import { validerDiagnostic } from '../lib/validateDiagnostic';
import type { Diagnostic } from '../lib/types';

describe('validerDiagnostic', () => {
  it('ne trouve aucune erreur sur un arbre valide', () => {
    const diag: Diagnostic = {
      id: 'test',
      titre: 'Test',
      icone: '🔧',
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
      icone: '🔧',
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
      icone: '🔧',
      etapeInitiale: 'q1',
      etapes: { q1: { question: 'Q1', reponses: [{ texte: 'A', suite: 'nulle_part' }] } },
      resultats: {},
    };
    const erreurs = validerDiagnostic(diag);
    expect(erreurs.length).toBeGreaterThan(0);
  });
});
