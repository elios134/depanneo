// src/fonctionnalites/pros/hooks/usePosition.ts
import * as Location from 'expo-location';
import { useEffect, useRef, useState } from 'react';
import { AppState, Linking, Platform } from 'react-native';
import type { Position } from '@/domaine/lieux';
import { useReglages } from '@/fonctionnalites/reglages/ReglagesProvider';

export type StatutPosition = 'chargement' | 'gps' | 'ville' | 'aucune';

interface Options {
  // Passif : ne demande jamais la permission, utilise seulement celle déjà accordée.
  passif?: boolean;
}

const FRAICHEUR_MS = 60000;
const DELAI_MAX_MS = 12000;
const AGE_MAX_DERNIERE_MS = 10 * 60 * 1000;
// Partagée entre les écrans pour ne pas redemander la position à chaque montage.
let memoire: { position: Position; date: number } | null = null;

// Dernière position connue (rapide), sinon position actuelle avec un délai maximum.
async function lirePosition(): Promise<Position> {
  const derniere = await Location.getLastKnownPositionAsync({ maxAge: AGE_MAX_DERNIERE_MS }).catch(() => null);
  if (derniere) return { lat: derniere.coords.latitude, lon: derniere.coords.longitude };
  let minuterie: ReturnType<typeof setTimeout> | undefined;
  const delai = new Promise<never>((_, rejeter) => {
    minuterie = setTimeout(() => rejeter(new Error('Position trop longue')), DELAI_MAX_MS);
  });
  try {
    const r = await Promise.race([Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }), delai]);
    return { lat: r.coords.latitude, lon: r.coords.longitude };
  } finally {
    clearTimeout(minuterie);
  }
}

export function usePosition({ passif = false }: Options = {}): {
  position: Position | null;
  statut: StatutPosition;
  demanderAutorisation: () => void;
} {
  const { reglages, modifier, charge } = useReglages();
  const [gps, setGps] = useState<Position | null>(memoire?.position ?? null);
  const [etat, setEtat] = useState<'chargement' | 'ok' | 'refuse'>(memoire ? 'ok' : 'chargement');
  const [essai, setEssai] = useState(0);
  const etatActuel = useRef(etat);
  etatActuel.current = etat;

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
        const { status } = passif
          ? await Location.getForegroundPermissionsAsync()
          : await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          if (!annule) setEtat('refuse');
          return;
        }
        const position = await lirePosition();
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
  }, [charge, reglages.localisation, essai, passif]);

  // Au retour dans l'appli (par exemple depuis les réglages système), on relance si la permission a été accordée entre-temps.
  useEffect(() => {
    const abonnement = AppState.addEventListener('change', (statut) => {
      if (statut !== 'active' || etatActuel.current !== 'refuse') return;
      Location.getForegroundPermissionsAsync()
        .then((p) => {
          if (p.status === 'granted' && etatActuel.current === 'refuse') setEssai((n) => n + 1);
        })
        .catch(() => undefined);
    });
    return () => abonnement.remove();
  }, []);

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
