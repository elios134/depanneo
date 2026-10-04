import type { Diagnostic, Resultat } from '@/domaine/types';
import { messagePlombier } from './message';

const diag = { titre: "Chasse d'eau qui coule en continu" } as Diagnostic;
const resultat = (r: Partial<Resultat>): Resultat => ({
  verdict: 'vert',
  titre: 't',
  conseil: 'Le joint du clapet, au fond du réservoir, est usé ou entartré. Change-le.',
  quiPaie: { qui: 'autre', phrase: 'p' },
  ...r,
});

describe('messagePlombier', () => {
  it('suit le format de la spec', () => {
    expect(messagePlombier(diag, ['Non, elle coule au fond vers la cuvette'], resultat({}))).toBe(
      [
        "Chasse d'eau qui coule en continu",
        '• Non, elle coule au fond vers la cuvette',
        'Verdict : Tu peux réparer (Le joint du clapet, au fond du réservoir, est usé ou entartré.)',
        'Envoyé depuis Dépannéo',
      ].join('\n'),
    );
  });

  it('utilise les libellés des verdicts orange et rouge', () => {
    expect(messagePlombier(diag, [], resultat({ verdict: 'orange' }))).toContain('Verdict : Sécurise en attendant');
    expect(messagePlombier(diag, [], resultat({ verdict: 'rouge' }))).toContain('Verdict : Appelle un pro tout de suite');
  });

  it('garde tout le conseil quand il n\'a pas de point', () => {
    expect(messagePlombier(diag, [], resultat({ conseil: 'Coupe le courant' }))).toContain('(Coupe le courant)');
  });

  it('fonctionne sans réponse', () => {
    expect(messagePlombier(diag, [], resultat({})).split('\n')).toHaveLength(3);
  });
});
