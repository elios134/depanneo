import type { Resultat } from '@/domaine/types';
import { prosVisibles } from './renvoi';

describe('prosVisibles', () => {
  const resultat = (r: Partial<Resultat>): Resultat => ({ verdict: 'orange', titre: 't', conseil: 'c', quiPaie: { qui: 'autre', phrase: 'p' }, ...r });

  it('montre les pros en temps normal', () => {
    expect(prosVisibles(resultat({}))).toBe(true);
    expect(prosVisibles(resultat({ verdict: 'rouge' }))).toBe(true);
  });

  it('montre les pros sur un résultat orange qui renvoie vers Urgences (chaudière)', () => {
    expect(prosVisibles(resultat({ renvoi: { type: 'urgence', id: 'couper-gaz' } }))).toBe(true);
  });

  it('cache les pros sur un résultat rouge qui renvoie vers Urgences (gaz)', () => {
    expect(prosVisibles(resultat({ verdict: 'rouge', renvoi: { type: 'urgence', id: 'couper-gaz' } }))).toBe(false);
  });
});
