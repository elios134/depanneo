import type { Position } from '@/domaine/lieux';
import type { Pro } from '@/domaine/pro';

export interface PropsCartePros {
  centre: Position | null;
  pros: Pro[];
  horsLigne: boolean;
  recentrage: number;
}
