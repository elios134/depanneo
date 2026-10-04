import type { Diagnostic } from '@/domaine/types';
import { demarrer, etapeCourante, peutRevenir, precedente, profondeurMax, progression, rejouer, repondre, reponsesChoisies } from './parcours';

const diag: Diagnostic = {
  id: 'test',
  titre: 'Test',
  categorie: 'plomberie',
  icone: 'droplets',
  motsCles: ['test'],
  etapeInitiale: 'q1',
  etapes: {
    q1: { question: 'Q1', reponses: [{ texte: 'A', suite: 'q2' }, { texte: 'B', suite: 'r1' }] },
    q2: { question: 'Q2', reponses: [{ texte: 'A', suite: 'r2' }, { texte: 'B', suite: 'q3' }] },
    q3: { question: 'Q3', reponses: [{ texte: 'A', suite: 'r3' }] },
  },
  resultats: {
    r1: { verdict: 'vert', titre: 'R1', conseil: 'c', quiPaie: { qui: 'autre', phrase: 'p' } },
    r2: { verdict: 'orange', titre: 'R2', conseil: 'c', quiPaie: { qui: 'autre', phrase: 'p' } },
    r3: { verdict: 'rouge', titre: 'R3', conseil: 'c', quiPaie: { qui: 'autre', phrase: 'p' } },
  },
};

describe('parcours de diagnostic', () => {
  it('démarre sur l\'étape initiale', () => {
    expect(etapeCourante(demarrer(diag))).toBe('q1');
  });

  it('avance quand on répond', () => {
    expect(etapeCourante(repondre(demarrer(diag), 0, 'q2'))).toBe('q2');
  });

  it('revient à la question précédente', () => {
    const etat = repondre(demarrer(diag), 0, 'q2');
    expect(etapeCourante(precedente(etat))).toBe('q1');
  });

  it('ne revient pas avant la première question', () => {
    const etat = demarrer(diag);
    expect(peutRevenir(etat)).toBe(false);
    expect(precedente(etat)).toEqual(etat);
  });

  it('calcule la profondeur maximale restante', () => {
    expect(profondeurMax(diag, 'q1')).toBe(3);
    expect(profondeurMax(diag, 'q2')).toBe(2);
    expect(profondeurMax(diag, 'q3')).toBe(1);
    expect(profondeurMax(diag, 'r1')).toBe(0);
  });

  it('calcule la progression', () => {
    let etat = demarrer(diag);
    expect(progression(diag, etat)).toBe(0);
    etat = repondre(etat, 0, 'q2');
    expect(progression(diag, etat)).toBeCloseTo(1 / 3);
    etat = repondre(etat, 1, 'q3');
    expect(progression(diag, etat)).toBeCloseTo(2 / 3);
    etat = repondre(etat, 0, 'r3');
    expect(progression(diag, etat)).toBe(1);
  });

  it("mémorise l'indice de la réponse et le retire en revenant", () => {
    const etat = repondre(demarrer(diag), 1, 'q3');
    expect(etat.choix).toEqual([1]);
    expect(demarrer(diag).choix).toEqual([]);
    expect(precedente(etat)).toEqual({ historique: ['q1'], choix: [] });
  });

  it('rend les textes réellement choisis, même si deux réponses mènent au même endroit', () => {
    const d: Diagnostic = {
      ...diag,
      etapes: {
        q1: {
          question: 'Q1',
          reponses: [{ texte: 'Oui', suite: 'r1' }, { texte: 'Je ne sais pas', suite: 'r1', inconnu: true }],
        },
      },
    };
    const etat = repondre(demarrer(d), 1, 'r1');
    expect(reponsesChoisies(d, etat)).toEqual(['Je ne sais pas']);
  });

  it('ignore les indices invalides dans reponsesChoisies', () => {
    const etat = { historique: ['q1', 'q2', 'q3'], choix: [0, 9] };
    expect(reponsesChoisies(diag, etat)).toEqual(['A']);
  });

  it('rejoue des choix donnés en paramètre', () => {
    const etat = rejouer(diag, '0,0');
    expect(etat).toEqual({ historique: ['q1', 'q2', 'r2'], choix: [0, 0] });
  });

  it("rejoue en s'arrêtant au premier choix invalide", () => {
    expect(rejouer(diag, '0,x,0').historique).toEqual(['q1', 'q2']);
    expect(rejouer(diag, '9').historique).toEqual(['q1']);
    expect(rejouer(diag, '').historique).toEqual(['q1']);
    expect(rejouer(diag, undefined).historique).toEqual(['q1']);
    expect(rejouer(diag, '0,0,0,0').historique).toEqual(['q1', 'q2', 'r2']);
  });
});
