// src/donnees/numerosUtiles.ts
export interface NumeroUtile {
  libelle: string;
  numero: string;
  detail?: string;
}

export const numerosUtiles: NumeroUtile[] = [
  { libelle: 'Urgence gaz', numero: '0800 47 33 33', detail: 'gratuit 24h/24' },
  { libelle: 'Urgences', numero: '112' },
];
