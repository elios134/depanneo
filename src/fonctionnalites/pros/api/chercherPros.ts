import { Platform } from 'react-native';
import type { Position } from '@/domaine/lieux';
import type { Pro } from '@/domaine/pro';
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

export function chercherPros(position: Position, rayonKm: number): Promise<Pro[]> {
  const cle = `${position.lat.toFixed(3)},${position.lon.toFixed(3)},${rayonKm}`;
  if (enCours?.cle === cle) return enCours.promesse;
  const promesse = interroger(position, rayonKm).finally(() => {
    if (enCours?.promesse === promesse) enCours = null;
  });
  enCours = { cle, promesse };
  return promesse;
}
