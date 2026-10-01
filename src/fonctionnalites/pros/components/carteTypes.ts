import type { Position } from '@/domaine/lieux';
import type { Pro } from '@/domaine/pro';

export interface PropsCartePros {
  centre: Position | null;
  pros: Pro[];
  horsLigne: boolean;
  recentrage: number;
  interactive?: boolean;
  // Signale que le fond de carte n'a pas pu se charger (ex. mode avion), puis qu'il s'est chargé.
  // Change pour remonter la carte et retenter le chargement du fond.
  rechargement?: number;
  onEchecCarte?: (echec: boolean) => void;
}
