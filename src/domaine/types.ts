export type Verdict = 'vert' | 'orange' | 'rouge';

export interface Reponse {
  texte: string;
  suite: string;
}

export interface Etape {
  question: string;
  reponses: Reponse[];
}

export interface Resultat {
  verdict: Verdict;
  titre: string;
  conseil: string;
  tutoId?: string;
  gesteUrgenceId?: string;
  numeroUtile?: string;
}

export interface Diagnostic {
  id: string;
  titre: string;
  icone: string;
  etapeInitiale: string;
  etapes: Record<string, Etape>;
  resultats: Record<string, Resultat>;
}

export interface GesteUrgence {
  id: string;
  titre: string;
  etapes: string[];
  numeroUtile?: string;
}

export interface Tuto {
  id: string;
  titre: string;
  etapes: string[];
}
