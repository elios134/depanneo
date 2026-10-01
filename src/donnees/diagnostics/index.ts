import type { Diagnostic } from '@/domaine/types';
import fuiteEau from './fuite-eau.json';
import wcBouche from './wc-bouche.json';
import evierBouche from './evier-bouche.json';
import pasEauChaude from './pas-eau-chaude.json';
import wcLentARemplir from './wc-lent-a-remplir.json';
import chasseCoule from './chasse-coule.json';
import chasseNeMarchePlus from './chasse-ne-marche-plus.json';
import robinetDur from './robinet-dur.json';
import robinetGoutte from './robinet-goutte.json';
import pressionFaible from './pression-faible.json';
import doucheEcouleMal from './douche-ecoule-mal.json';
import odeurEgout from './odeur-egout.json';
import groupeSecuriteGoutte from './groupe-securite-goutte.json';
import fuitePiedWc from './fuite-pied-wc.json';
import flexibleDoucheFuit from './flexible-douche-fuit.json';
import bruitTuyaux from './bruit-tuyaux.json';
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
  robinetDur as Diagnostic,
  robinetGoutte as Diagnostic,
  pressionFaible as Diagnostic,
  doucheEcouleMal as Diagnostic,
  odeurEgout as Diagnostic,
  groupeSecuriteGoutte as Diagnostic,
  fuitePiedWc as Diagnostic,
  flexibleDoucheFuit as Diagnostic,
  bruitTuyaux as Diagnostic,
  disjoncteurSaute as Diagnostic,
  plusDeCourant as Diagnostic,
];
