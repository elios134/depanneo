import type { Diagnostic } from '@/domaine/types';
import { demarrer, etapeCourante, peutRevenir, precedente, profondeurMax, progression, repondre } from './parcours';

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
    r1: { verdict: 'vert', titre: 'R1', conseil: 'c' },
    r2: { verdict: 'orange', titre: 'R2', conseil: 'c' },
    r3: { verdict: 'rouge', titre: 'R3', conseil: 'c' },
  },
};

describe('parcours de diagnostic', () => {
  it('démarre sur l\'étape initiale', () => {
    expect(etapeCourante(demarrer(diag))).toBe('q1');
  });

  it('avance quand on répond', () => {
    expect(etapeCourante(repondre(demarrer(diag), 'q2'))).toBe('q2');
  });

  it('revient à la question précédente', () => {
    const etat = repondre(demarrer(diag), 'q2');
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
    etat = repondre(etat, 'q2');
    expect(progression(diag, etat)).toBeCloseTo(1 / 3);
    etat = repondre(etat, 'q3');
    expect(progression(diag, etat)).toBeCloseTo(2 / 3);
    etat = repondre(etat, 'r3');
    expect(progression(diag, etat)).toBe(1);
  });
});
