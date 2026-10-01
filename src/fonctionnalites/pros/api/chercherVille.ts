import type { Lieu } from '@/domaine/lieux';
import { analyserGeocodage, construireUrlGeocodage } from '../lib/geocodage';

export async function chercherVille(recherche: string): Promise<Lieu[]> {
  const reponse = await fetch(construireUrlGeocodage(recherche));
  if (!reponse.ok) throw new Error(`Géocodage : ${reponse.status}`);
  return analyserGeocodage(await reponse.json());
}
