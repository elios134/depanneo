import type { Diagnostic } from '../../lib/types';
import fuiteEau from './fuite-eau.json';
import wcBouche from './wc-bouche.json';
import evierBouche from './evier-bouche.json';
import pasEauChaude from './pas-eau-chaude.json';
import disjoncteurSaute from './disjoncteur-saute.json';
import plusDeCourant from './plus-de-courant.json';
import odeurGaz from './odeur-gaz.json';
import chaudiereEnPanne from './chaudiere-en-panne.json';

export const diagnostics: Diagnostic[] = [
  fuiteEau as Diagnostic,
  wcBouche as Diagnostic,
  evierBouche as Diagnostic,
  pasEauChaude as Diagnostic,
  disjoncteurSaute as Diagnostic,
  plusDeCourant as Diagnostic,
  odeurGaz as Diagnostic,
  chaudiereEnPanne as Diagnostic,
];
