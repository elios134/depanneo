// Réponse HTTP en erreur : on garde le statut et le texte (utile pour reconnaître un code refusé).
export class ErreurHttp extends Error {
  statut: number;
  corps: string;

  constructor(statut: number, corps: string) {
    super(`Le service a répondu ${statut}`);
    this.name = 'ErreurHttp';
    this.statut = statut;
    this.corps = corps;
    Object.setPrototypeOf(this, ErreurHttp.prototype);
  }
}

/** GET d'une adresse avec un délai maximal ; rejette avec ErreurHttp si le statut n'est pas 2xx. */
export async function lireJson(url: string, delaiMs: number): Promise<unknown> {
  const controleur = new AbortController();
  const minuterie = setTimeout(() => controleur.abort(), delaiMs);
  try {
    const reponse = await fetch(url, { signal: controleur.signal });
    if (!reponse.ok) throw new ErreurHttp(reponse.status, await reponse.text().catch(() => ''));
    return await reponse.json();
  } finally {
    clearTimeout(minuterie);
  }
}
