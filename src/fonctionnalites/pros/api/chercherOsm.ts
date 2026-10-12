import { Platform } from 'react-native';
import type { Position } from '@/domaine/lieux';
import type { Pro } from '@/domaine/pro';
import { analyserReponse, construireRequete, SERVEURS_OVERPASS } from '../lib/overpass';
import { classerEchec, EchecPros } from '../lib/echecPros';

// Les serveurs de secours mettent parfois plus de 15 s à répondre.
const DELAI_PAR_SERVEUR_MS = 20000;
const BUDGET_TOTAL_MS = 45000;

async function interrogerServeur(url: string, position: Position, rayonKm: number, delaiMs: number): Promise<Pro[]> {
  const controleur = new AbortController();
  const minuterie = setTimeout(() => controleur.abort(), delaiMs);
  try {
    const reponse = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        // Overpass refuse les requêtes anonymes ; le navigateur interdit cet en-tête sur le web.
        ...(Platform.OS === 'web' ? {} : { 'User-Agent': 'Depanneo/2.0' }),
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

// Essaie chaque serveur Overpass à la suite et s'arrête au premier succès.
export async function chercherOsm(position: Position, rayonKm: number): Promise<Pro[]> {
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
