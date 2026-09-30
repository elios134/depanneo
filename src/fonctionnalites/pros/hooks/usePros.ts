// src/fonctionnalites/pros/hooks/usePros.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import type { Position } from '@/domaine/lieux';
import type { Pro } from '@/domaine/pro';
import { useReglages } from '@/fonctionnalites/reglages/ReglagesProvider';
import { chercherPros } from '../api/chercherPros';
import { CLE_CACHE_PROS, doitRafraichir, ecrireCache, lireCache, type CachePros } from '../lib/cachePros';

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

export function usePros(position: Position | null): { pros: Pro[]; etat: EtatPros; date: number | null } {
  const { reglages } = useReglages();
  const rayonKm = reglages.rayonKm;
  const [etat, setEtat] = useState<EtatPros>('attente');
  const [pros, setPros] = useState<Pro[]>(cacheMemoire?.pros ?? []);
  const [date, setDate] = useState<number | null>(cacheMemoire?.date ?? null);
  const lat = position?.lat;
  const lon = position?.lon;

  useEffect(() => {
    if (lat === undefined || lon === undefined) {
      setEtat('attente');
      return;
    }
    const ici = { lat, lon };
    let annule = false;
    (async () => {
      const cache = await lireCacheStocke();
      if (annule) return;
      if (cache && !doitRafraichir(cache, ici, rayonKm, Date.now())) {
        setPros(cache.pros);
        setDate(cache.date);
        setEtat('ok');
        return;
      }
      setEtat('chargement');
      try {
        const trouves = await chercherPros(ici, rayonKm);
        const nouveau: CachePros = { pros: trouves, centre: ici, rayonKm, date: Date.now() };
        await enregistrer(nouveau);
        if (annule) return;
        setPros(trouves);
        setDate(nouveau.date);
        setEtat('ok');
      } catch {
        if (annule) return;
        setPros(cache?.pros ?? []);
        setDate(cache?.date ?? null);
        setEtat('hors-ligne');
      }
    })();
    return () => {
      annule = true;
    };
  }, [lat, lon, rayonKm]);

  return { pros, etat, date };
}
