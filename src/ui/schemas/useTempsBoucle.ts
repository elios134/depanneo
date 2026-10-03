import { useIsFocused } from 'expo-router';
import { useEffect, useState } from 'react';
import { phaseBoucle } from './animation';

const PAS_MS = 42; // environ 24 images par seconde : fluide et peu coûteux

/** Temps qui tourne en boucle, entre 0 et 1, sur `dureeMs`. Garde sa dernière valeur quand `actif` est faux ; en pause quand l'écran n'est pas affiché. */
export function useTempsBoucle(dureeMs: number, actif: boolean): number {
  const [t, setT] = useState(0);
  const ecranAffiche = useIsFocused();
  useEffect(() => {
    if (!actif || !ecranAffiche) return undefined;
    const debut = Date.now();
    let dernier = 0;
    let id = 0;
    const boucle = () => {
      const maintenant = Date.now();
      if (maintenant - dernier >= PAS_MS) {
        dernier = maintenant;
        setT(phaseBoucle(maintenant - debut, dureeMs));
      }
      id = requestAnimationFrame(boucle);
    };
    id = requestAnimationFrame(boucle);
    return () => cancelAnimationFrame(id);
  }, [dureeMs, actif, ecranAffiche]);
  return t;
}
