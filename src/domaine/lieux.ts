export interface Position {
  lat: number;
  lon: number;
}

export interface Lieu {
  nom: string;
  codePostal: string;
  position: Position;
}

export function libelleLieu(lieu: Lieu): string {
  return lieu.codePostal ? `${lieu.nom} (${lieu.codePostal})` : lieu.nom;
}
