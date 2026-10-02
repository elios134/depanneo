// Registre des schémas dessinés, par nom (voir NOMS_SCHEMAS).
import type { NomDessine } from '@/domaine/etapes';
import type { Dessin } from '../dessin';
import { evierDemonterSiphon, evierDevisserSiphon, evierFuret, evierNettoyer, evierVentouse } from './evier';

export const DESSINS: Record<NomDessine, Dessin> = {
  'evier-devisser-siphon': evierDevisserSiphon,
  'evier-nettoyer': evierNettoyer,
  'evier-ventouse': evierVentouse,
  'evier-demonter-siphon': evierDemonterSiphon,
  'evier-furet': evierFuret,
};
