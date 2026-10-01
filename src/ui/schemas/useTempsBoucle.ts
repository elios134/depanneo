import { useEffect, useState } from 'react';
import { phaseBoucle } from './animation';

const PAS_MS = 33; // environ 30 images par seconde : fluide et peu coûteux

/** Temps qui tourne en boucle, entre 0 et 1, sur `dureeMs`. Reste à 0 si `actif` est faux. */
export function useTempsBoucle(dureeMs: number, actif: boolean): number {
  const [t, setT] = useState(0);
  useEffect(() => {
    if (!actif) return undefined;
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
  }, [dureeMs, actif]);
  return t;
}
