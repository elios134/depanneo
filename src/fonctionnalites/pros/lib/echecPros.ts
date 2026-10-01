export type RaisonEchec = 'hors-ligne' | 'indisponible';

export class EchecPros extends Error {
  raison: RaisonEchec;

  constructor(raison: RaisonEchec) {
    super(raison === 'hors-ligne' ? 'Pas de réseau' : 'Service des pros indisponible');
    this.name = 'EchecPros';
    this.raison = raison;
    Object.setPrototypeOf(this, EchecPros.prototype);
  }
}

// fetch rejette avec une TypeError quand il n'y a pas de réseau.
function estErreurReseau(erreur: unknown): boolean {
  return erreur instanceof TypeError || (erreur instanceof Error && /network request failed/i.test(erreur.message));
}

// « hors-ligne » seulement si toutes les tentatives ont échoué faute de réseau ;
// sinon (erreur HTTP, réponse illisible, délai dépassé) le service est « indisponible ».
export function classerEchec(erreurs: unknown[]): RaisonEchec {
  return erreurs.length > 0 && erreurs.every(estErreurReseau) ? 'hors-ligne' : 'indisponible';
}

// Raison d'une erreur attrapée ; une erreur inconnue est traitée comme un problème de réseau (comme avant).
export function raisonDe(erreur: unknown): RaisonEchec {
  const raison = (erreur as { raison?: unknown } | null)?.raison;
  return raison === 'indisponible' ? 'indisponible' : 'hors-ligne';
}
