// src/fonctionnalites/pros/hooks/usePros.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { distanceKm } from '@/domaine/distance';
import type { Position } from '@/domaine/lieux';
import type { Pro } from '@/domaine/pro';
import { useReglages } from '@/fonctionnalites/reglages/ReglagesProvider';
import { chercherPros } from '../api/chercherPros';
import { CLE_CACHE_PROS, doitRafraichir, ecrireCache, lireCache, type CachePros } from '../lib/cachePros';
import { recalerPros } from '../lib/recalerPros';

export type EtatPros = 'attente' | 'chargement' | 'ok' | 'hors-ligne';

// undefined = pas encore lu sur le téléphone ; partagé entre les écrans.
let cacheMemoire: CachePros | null | undefined;

async function lireCacheStocke(): Promise<CachePros | null> {
  if (cacheMemoire !== undefined) return cacheMemoire;
  try {
    cacheMemoire = lireCache(await AsyncStorage.getItem(CLE_CACHE_PROS));
  } catch {
    cacheMemoire = null;
  }
  return cacheMemoire;
}

async function enregistrer(cache: CachePros): Promise<void> {
  cacheMemoire = cache;
  await AsyncStorage.setItem(CLE_CACHE_PROS, ecrireCache(cache)).catch(() => undefined);
}

// Résultat valable pour un lieu et un rayon précis : on ne l'expose jamais pour un autre lieu.
interface Resultat {
  cle: string;
  pros: Pro[];
  date: number | null;
  etat: 'ok' | 'hors-ligne';
}

export function usePros(position: Position | null): { pros: Pro[]; etat: EtatPros; date: number | null; reessayer: () => void } {
  const { reglages } = useReglages();
  const rayonKm = reglages.rayonKm;
  const [resultat, setResultat] = useState<Resultat | null>(null);
  const [essai, setEssai] = useState(0);
  const lat = position?.lat;
  const lon = position?.lon;
  const cleActuelle = lat === undefined || lon === undefined ? null : `${lat},${lon},${rayonKm}`;
  const valide = resultat !== null && resultat.cle === cleActuelle ? resultat : null;
  const etat: EtatPros = cleActuelle === null ? 'attente' : (valide?.etat ?? 'chargement');
  const etatActuel = useRef(etat);
  etatActuel.current = etat;

  const reessayer = useCallback(() => setEssai((n) => n + 1), []);

  // Au retour dans l'appli, on relance la recherche si on était hors connexion.
  useEffect(() => {
    const abonnement = AppState.addEventListener('change', (statut) => {
      if (statut === 'active' && etatActuel.current === 'hors-ligne') setEssai((n) => n + 1);
    });
    return () => abonnement.remove();
  }, []);

  useEffect(() => {
    if (lat === undefined || lon === undefined) return;
    const ici = { lat, lon };
    const cle = `${lat},${lon},${rayonKm}`;
    let annule = false;
    (async () => {
      const cache = await lireCacheStocke();
      if (annule) return;
      if (cache && !doitRafraichir(cache, ici, rayonKm, Date.now())) {
        setResultat({ cle, pros: recalerPros(cache.pros, ici, rayonKm), date: cache.date, etat: 'ok' });
        return;
      }
      setResultat(null);
      try {
        const trouves = await chercherPros(ici, rayonKm);
        const nouveau: CachePros = { pros: trouves, centre: ici, rayonKm, date: Date.now() };
        await enregistrer(nouveau);
        if (annule) return;
        setResultat({ cle, pros: trouves, date: nouveau.date, etat: 'ok' });
      } catch {
        if (annule) return;
        const proche = cache !== null && distanceKm(cache.centre, ici) <= rayonKm;
        setResultat({
          cle,
          pros: proche ? recalerPros(cache.pros, ici, rayonKm) : [],
          date: proche ? cache.date : null,
          etat: 'hors-ligne',
        });
      }
    })();
    return () => {
      annule = true;
    };
  }, [lat, lon, rayonKm, essai]);

  return { pros: valide?.pros ?? [], etat, date: valide?.date ?? null, reessayer };
}
