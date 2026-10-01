import type { Diagnostic } from '@/domaine/types';
import fuiteEau from './fuite-eau.json';
import wcBouche from './wc-bouche.json';
import evierBouche from './evier-bouche.json';
import pasEauChaude from './pas-eau-chaude.json';
import wcLentARemplir from './wc-lent-a-remplir.json';
import chasseCoule from './chasse-coule.json';
import chasseNeMarchePlus from './chasse-ne-marche-plus.json';
import fuitePiedWc from './fuite-pied-wc.json';
import disjoncteurSaute from './disjoncteur-saute.json';
import plusDeCourant from './plus-de-courant.json';

// Ordre d'affichage = numéro de la panne dans docs/contenu/pannes-v2.md.
export const diagnostics: Diagnostic[] = [
  fuiteEau as Diagnostic,
  wcBouche as Diagnostic,
  evierBouche as Diagnostic,
  pasEauChaude as Diagnostic,
  wcLentARemplir as Diagnostic,
  chasseCoule as Diagnostic,
  chasseNeMarchePlus as Diagnostic,
  fuitePiedWc as Diagnostic,
  disjoncteurSaute as Diagnostic,
  plusDeCourant as Diagnostic,
];
