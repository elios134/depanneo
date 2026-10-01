import { Platform } from 'react-native';
import type { Position } from '@/domaine/lieux';
import type { Pro } from '@/domaine/pro';
import { recalerPros } from '../lib/recalerPros';
import { analyserReponse, construireRequete, SERVEURS_OVERPASS } from '../lib/overpass';
import { classerEchec, EchecPros } from '../lib/echecPros';

const DELAI_PAR_SERVEUR_MS = 12000;
const BUDGET_TOTAL_MS = 30000;
let enCours: { cle: string; promesse: Promise<Pro[]> } | null = null;

async function interrogerServeur(url: string, position: Position, rayonKm: number, delaiMs: number): Promise<Pro[]> {
  const controleur = new AbortController();
  const minuterie = setTimeout(() => controleur.abort(), delaiMs);
  try {
    const reponse = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        // Overpass refuse les requêtes anonymes ; le navigateur interdit cet en-tête sur le web.
        ...(Platform.OS === 'web' ? {} : { 'User-Agent': 'DepannMaison/2.0' }),
      },
      body: 'data=' + encodeURIComponent(construireRequete(position, rayonKm)),
      signal: controleur.signal,
    });
    if (!reponse.ok) throw new Error(`Overpass a répondu ${reponse.status}`);
    return analyserReponse(await reponse.json(), position);
  } finally {
    clearTimeout(minuterie);
  }
}

// Essaie chaque serveur à la suite et s'arrête au premier succès.
async function interroger(position: Position, rayonKm: number): Promise<Pro[]> {
  const debut = Date.now();
  const erreurs: unknown[] = [];
  for (const url of SERVEURS_OVERPASS) {
    const restant = BUDGET_TOTAL_MS - (Date.now() - debut);
    if (restant <= 0) break;
    try {
      return await interrogerServeur(url, position, rayonKm, Math.min(DELAI_PAR_SERVEUR_MS, restant));
    } catch (erreur) {
      erreurs.push(erreur);
    }
  }
  throw new EchecPros(classerEchec(erreurs));
}

const arrondir = (n: number) => Math.round(n * 1000) / 1000;

export function chercherPros(position: Position, rayonKm: number): Promise<Pro[]> {
  // Position arrondie à 3 décimales (~100 m) : moins précise pour Overpass, et clé de déduplication identique.
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
