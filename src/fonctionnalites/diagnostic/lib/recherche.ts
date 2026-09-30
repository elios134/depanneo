import type { Categorie, Diagnostic } from '@/domaine/types';

export function normaliser(texte: string): string {
  return texte.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
}

export function filtrerPannes(pannes: Diagnostic[], categorie: Categorie, recherche: string): Diagnostic[] {
  const q = normaliser(recherche);
  if (!q) return pannes.filter((p) => p.categorie === categorie);
  return pannes.filter((p) => [p.titre, ...p.motsCles].some((t) => normaliser(t).includes(q)));
}
