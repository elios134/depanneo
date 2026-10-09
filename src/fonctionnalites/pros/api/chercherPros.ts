import type { Position } from '@/domaine/lieux';
import type { Pro } from '@/domaine/pro';
import { classerEchec, EchecPros, type RaisonEchec } from '../lib/echecPros';
import { fusionnerPros } from '../lib/fusion';
import { recalerPros } from '../lib/recalerPros';
import { chercherOsm } from './chercherOsm';
import { chercherRegistre } from './chercherRegistre';
import { chercherRge } from './chercherRge';

let enCours: { cle: string; promesse: Promise<Pro[]> } | null = null;

const raisonDeLEchec = (erreur: unknown): RaisonEchec => (erreur instanceof EchecPros ? erreur.raison : classerEchec([erreur]));

// Les trois sources en même temps : on affiche ce qui répond ; échec seulement si aucune ne répond.
async function interroger(position: Position, rayonKm: number): Promise<Pro[]> {
  const [osm, rge, registre] = await Promise.allSettled([
    chercherOsm(position, rayonKm),
    chercherRge(position, rayonKm),
    chercherRegistre(position, rayonKm),
  ]);
  const resultats = [osm, rge, registre];
  if (resultats.every((r) => r.status === 'rejected')) {
    const raisons = resultats.map((r) => raisonDeLEchec((r as PromiseRejectedResult).reason));
    throw new EchecPros(raisons.every((r) => r === 'hors-ligne') ? 'hors-ligne' : 'indisponible');
  }
  const valeur = (r: PromiseSettledResult<Pro[]>) => (r.status === 'fulfilled' ? r.value : []);
  return fusionnerPros({ osm: valeur(osm), rge: valeur(rge), registre: valeur(registre) });
}

const arrondir = (n: number) => Math.round(n * 1000) / 1000;

export function chercherPros(position: Position, rayonKm: number): Promise<Pro[]> {
  // Position arrondie à 3 décimales (~100 m) : moins précise pour les services, et clé de déduplication identique.
  const arrondie = { lat: arrondir(position.lat), lon: arrondir(position.lon) };
  const cle = `${arrondie.lat},${arrondie.lon},${rayonKm}`;
  let promesse: Promise<Pro[]>;
  if (enCours?.cle === cle) {
    promesse = enCours.promesse;
  } else {
    const nouvelle: Promise<Pro[]> = interroger(arrondie, rayonKm).finally(() => {
      if (enCours?.promesse === nouvelle) enCours = null;
    });
    enCours = { cle, promesse: nouvelle };
    promesse = nouvelle;
  }
  // Les requêtes fusionnées partagent le même résultat : chacun recale les distances depuis sa propre position.
  return promesse.then((pros) => recalerPros(pros, position, rayonKm));
}
