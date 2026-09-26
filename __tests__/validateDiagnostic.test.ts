import { validerDiagnostic } from '../lib/validateDiagnostic';
import type { Diagnostic, Resultat } from '../lib/types';

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

  it('accepte une étape initiale qui pointe directement vers un résultat', () => {
    const diag: Diagnostic = {
      id: 'test',
      titre: 'Test',
      icone: '🔧',
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
      icone: '🔧',
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
      icone: '🔧',
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
      icone: '🔧',
      etapeInitiale: 'q1',
      etapes: { q1: { question: 'Q1', reponses: [{ texte: 'A', suite: 'constructor' }] } },
      resultats: {},
    };
    const erreurs = validerDiagnostic(diag);
    expect(erreurs.length).toBeGreaterThan(0);
  });
});
