import { Platform } from 'react-native';
import type { Position } from '@/domaine/lieux';
import type { Pro } from '@/domaine/pro';
import { recalerPros } from '../lib/recalerPros';
import { analyserReponse, construireRequete, URL_OVERPASS } from '../lib/overpass';

const DELAI_MS = 30000;
let enCours: { cle: string; promesse: Promise<Pro[]> } | null = null;

async function interroger(position: Position, rayonKm: number): Promise<Pro[]> {
  const controleur = new AbortController();
  const minuterie = setTimeout(() => controleur.abort(), DELAI_MS);
  try {
    const reponse = await fetch(URL_OVERPASS, {
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
