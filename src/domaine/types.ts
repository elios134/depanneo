import type { EtapeTuto } from './etapes';
import type { NomIcone } from './icones';

export type Verdict = 'vert' | 'orange' | 'rouge';

export type Categorie = 'plomberie' | 'electricite';

export const CATEGORIES: Categorie[] = ['plomberie', 'electricite'];

export interface Reponse {
  texte: string;
  suite: string;
  inconnu?: boolean;
}

export interface Etape {
  question: string;
  reponses: Reponse[];
}

/** Bouton sur un résultat : ouvre un autre diagnostic (depuis le début) ou un geste de l'onglet Urgences. */
export type Renvoi = { type: 'diagnostic'; id: string } | { type: 'urgence'; id: string };

export interface Resultat {
  verdict: Verdict;
  titre: string;
  conseil: string;
  tutoId?: string;
  gesteUrgenceId?: string;
  numeroUtile?: string;
  renvoi?: Renvoi;
}

export interface Diagnostic {
  id: string;
  titre: string;
  categorie: Categorie;
  icone: NomIcone;
  motsCles: string[];
  etapeInitiale: string;
  etapes: Record<string, Etape>;
  resultats: Record<string, Resultat>;
}

export interface GesteUrgence {
  id: string;
  titre: string;
  icone: NomIcone;
  etapes: string[];
  numeroUtile?: string;
}

export interface Tuto {
  id: string;
  titre: string;
  categorie: Categorie;
  icone: NomIcone;
  duree: string;
  outil: string;
  etapes: EtapeTuto[];
}
