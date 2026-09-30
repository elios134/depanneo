import type { Categorie } from '@/domaine/types';
import type { Couleurs } from './tokens';

export function couleurCategorie(c: Couleurs, categorie: Categorie): string {
  return categorie === 'plomberie' ? c.plomberie : c.electricite;
}
