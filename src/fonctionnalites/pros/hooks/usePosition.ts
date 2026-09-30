// src/fonctionnalites/pros/hooks/usePosition.ts
import * as Location from 'expo-location';
import { useEffect, useState } from 'react';
import { Linking, Platform } from 'react-native';
import type { Position } from '@/domaine/lieux';
import { useReglages } from '@/fonctionnalites/reglages/ReglagesProvider';

export type StatutPosition = 'chargement' | 'gps' | 'ville' | 'aucune';

const FRAICHEUR_MS = 60000;
// Partagée entre les écrans pour ne pas redemander la position à chaque montage.
let memoire: { position: Position; date: number } | null = null;

export function usePosition(): { position: Position | null; statut: StatutPosition; demanderAutorisation: () => void } {
  const { reglages, modifier, charge } = useReglages();
  const [gps, setGps] = useState<Position | null>(memoire?.position ?? null);
  const [etat, setEtat] = useState<'chargement' | 'ok' | 'refuse'>(memoire ? 'ok' : 'chargement');
  const [essai, setEssai] = useState(0);

  useEffect(() => {
    if (!charge) return;
    if (!reglages.localisation) {
      setEtat('refuse');
      return;
    }
    if (memoire && essai === 0 && Date.now() - memoire.date < FRAICHEUR_MS) {
      setGps(memoire.position);
      setEtat('ok');
      return;
    }
    let annule = false;
    setEtat('chargement');
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          if (!annule) setEtat('refuse');
          return;
        }
        const r = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        const position = { lat: r.coords.latitude, lon: r.coords.longitude };
        memoire = { position, date: Date.now() };
        if (!annule) {
          setGps(position);
          setEtat('ok');
        }
      } catch {
        if (!annule) setEtat('refuse');
      }
    })();
    return () => {
      annule = true;
    };
  }, [charge, reglages.localisation, essai]);

  const demanderAutorisation = () => {
    if (!reglages.localisation) {
      modifier({ localisation: true });
      return;
    }
    Location.getForegroundPermissionsAsync()
      .then((p) => {
        if (p.status !== 'granted' && !p.canAskAgain && Platform.OS !== 'web') return Linking.openSettings();
        setEssai((n) => n + 1);
      })
      .catch(() => setEssai((n) => n + 1));
  };

  if (!charge) return { position: null, statut: 'chargement', demanderAutorisation };
  if (etat === 'ok' && gps) return { position: gps, statut: 'gps', demanderAutorisation };
  if (etat === 'chargement') return { position: null, statut: 'chargement', demanderAutorisation };
  if (reglages.villeParDefaut) return { position: reglages.villeParDefaut.position, statut: 'ville', demanderAutorisation };
  return { position: null, statut: 'aucune', demanderAutorisation };
}
