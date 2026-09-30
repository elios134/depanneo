import { estResultat, getEtape, getResultat } from '@/domaine/diagnosticEngine';
import type { Diagnostic } from '@/domaine/types';

const diagTest: Diagnostic = {
  id: 'test',
  titre: 'Test',
  categorie: 'plomberie',
  icone: 'droplets',
  motsCles: ['fuite'],
  etapeInitiale: 'q1',
  etapes: {
    q1: {
      question: 'Ça fuit où ?',
      reponses: [{ texte: 'Ici', suite: 'r1' }],
    },
  },
  resultats: {
    r1: { verdict: 'vert', titre: 'OK', conseil: 'Répare ça toi-même.' },
  },
};

describe('diagnosticEngine', () => {
  it('reconnaît un id de résultat', () => {
    expect(estResultat(diagTest, 'r1')).toBe(true);
    expect(estResultat(diagTest, 'q1')).toBe(false);
  });

  it('récupère une étape existante', () => {
    expect(getEtape(diagTest, 'q1').question).toBe('Ça fuit où ?');
  });

  it("jette une erreur si l'étape n'existe pas", () => {
    expect(() => getEtape(diagTest, 'inconnue')).toThrow();
  });

  it('récupère un résultat existant', () => {
    expect(getResultat(diagTest, 'r1').verdict).toBe('vert');
  });

  it("jette une erreur si le résultat n'existe pas", () => {
    expect(() => getResultat(diagTest, 'inconnu')).toThrow();
  });
});
