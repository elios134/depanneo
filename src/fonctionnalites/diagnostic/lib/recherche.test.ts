import type { Diagnostic } from '@/domaine/types';
import { filtrerPannes, normaliser } from './recherche';

const panne = (id: string, titre: string, categorie: Diagnostic['categorie'], motsCles: string[]): Diagnostic => ({
  id, titre, categorie, motsCles, icone: 'droplets', etapeInitiale: 'r', etapes: {},
  resultats: { r: { verdict: 'vert', titre: 't', conseil: 'c', quiPaie: { qui: 'autre', phrase: 'p' } } },
});

const pannes = [
  panne('evier', 'Évier bouché', 'plomberie', ['lavabo']),
  panne('wc', 'WC bouché', 'plomberie', ['toilettes']),
  panne('disj', 'Disjoncteur qui saute', 'electricite', ['tableau']),
];

describe('recherche des pannes', () => {
  it('normalise accents et majuscules', () => {
    expect(normaliser('  Évier ')).toBe('evier');
  });

  it('filtre par catégorie sans recherche', () => {
    expect(filtrerPannes(pannes, 'electricite', '').map((p) => p.id)).toEqual(['disj']);
  });

  it('cherche sans tenir compte des accents', () => {
    expect(filtrerPannes(pannes, 'plomberie', 'evier').map((p) => p.id)).toEqual(['evier']);
  });

  it('cherche dans les mots-clés', () => {
    expect(filtrerPannes(pannes, 'plomberie', 'toilettes').map((p) => p.id)).toEqual(['wc']);
  });

  it('cherche dans toutes les catégories quand on tape un mot', () => {
    expect(filtrerPannes(pannes, 'plomberie', 'tableau').map((p) => p.id)).toEqual(['disj']);
  });

  it('renvoie une liste vide si rien ne correspond', () => {
    expect(filtrerPannes(pannes, 'plomberie', 'piscine')).toEqual([]);
  });
});
