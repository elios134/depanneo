// Registre des schémas dessinés, par nom (voir NOMS_SCHEMAS).
import type { NomDessine } from '@/domaine/etapes';
import type { Dessin } from '../dessin';
import { ampouleDevisser, flexibleDevisser, mousseurDevisser, mousseurTremper } from './divers';
import { evierDemonterSiphon, evierDevisserSiphon, evierFuret, evierNettoyer, evierVentouse } from './evier';
import { couperEau, jointComparer, jointRemonter, raccordDevisser, raccordResserrer } from './raccord';
import { wcAcide, wcEcoulementLent, wcVentouse } from './wc';

export const DESSINS: Record<NomDessine, Dessin> = {
  'evier-devisser-siphon': evierDevisserSiphon,
  'evier-nettoyer': evierNettoyer,
  'evier-ventouse': evierVentouse,
  'evier-demonter-siphon': evierDemonterSiphon,
  'evier-furet': evierFuret,
  'wc-ecoulement-lent': wcEcoulementLent,
  'wc-ventouse': wcVentouse,
  'wc-acide': wcAcide,
  'couper-eau': couperEau,
  'raccord-resserrer': raccordResserrer,
  'raccord-devisser': raccordDevisser,
  'joint-comparer': jointComparer,
  'joint-remonter': jointRemonter,
  'mousseur-devisser': mousseurDevisser,
  'mousseur-tremper': mousseurTremper,
  'flexible-devisser': flexibleDevisser,
  'ampoule-devisser': ampouleDevisser,
};
