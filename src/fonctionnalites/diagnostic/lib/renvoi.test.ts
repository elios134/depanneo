import type { Diagnostic, GesteUrgence, Resultat } from '@/domaine/types';
import { decrireRenvoi, prosVisibles } from './renvoi';

const piece: Diagnostic = {
  id: 'courant-une-piece',
  titre: 'Plus de courant dans une seule pièce',
  categorie: 'electricite',
  icone: 'door-open',
  motsCles: ['pièce'],
  etapeInitiale: 'r',
  etapes: {},
  resultats: { r: { verdict: 'vert', titre: 't', conseil: 'c' } },
};
const gaz: GesteUrgence = { id: 'couper-gaz', titre: 'Odeur de gaz ?', icone: 'flame', numeroUtile: '0800 47 33 33', etapes: ['Sors.'] };
const eau: GesteUrgence = { id: 'couper-eau', titre: 'Couper l\'eau', icone: 'droplets', etapes: ['Ferme.'] };

describe('decrireRenvoi', () => {
  it('décrit un renvoi vers un diagnostic (bleu, stéthoscope)', () => {
    expect(decrireRenvoi({ type: 'diagnostic', id: 'courant-une-piece' }, [piece], [gaz])).toEqual({
      icone: 'stethoscope',
      ton: 'accent',
      titre: 'Plus de courant dans une seule pièce',
      sousTitre: 'Continuer avec ce diagnostic',
    });
  });

  it('décrit le renvoi vers « Odeur de gaz ? » (rouge, flamme)', () => {
    expect(decrireRenvoi({ type: 'urgence', id: 'couper-gaz' }, [piece], [gaz])).toEqual({
      icone: 'flame',
      ton: 'danger',
      titre: 'Odeur de gaz ?',
      sousTitre: 'Consignes et numéro d\'urgence',
    });
  });

  it('un geste sans numéro annonce seulement des consignes', () => {
    expect(decrireRenvoi({ type: 'urgence', id: 'couper-eau' }, [], [eau])?.sousTitre).toBe('Consignes de sécurité');
  });

  it('ne décrit rien si la cible n\'existe pas', () => {
    expect(decrireRenvoi({ type: 'diagnostic', id: 'fantome' }, [piece], [gaz])).toBeNull();
    expect(decrireRenvoi({ type: 'urgence', id: 'fantome' }, [piece], [gaz])).toBeNull();
  });
});

describe('prosVisibles', () => {
  const resultat = (r: Partial<Resultat>): Resultat => ({ verdict: 'orange', titre: 't', conseil: 'c', ...r });

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
