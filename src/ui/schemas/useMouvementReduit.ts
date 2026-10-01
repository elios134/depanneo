import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

/** Vrai si l'utilisateur a demandé à son téléphone (ou navigateur) de réduire les animations. */
export function useMouvementReduit(): boolean {
  const [reduit, setReduit] = useState(false);
  useEffect(() => {
    let monte = true;
    AccessibilityInfo.isReduceMotionEnabled()
      .then((valeur) => {
        if (monte) setReduit(valeur);
      })
      .catch(() => undefined);
    // Sur le web, addEventListener peut ne rien renvoyer : d'où le « ?. ».
    const abonnement = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduit);
    return () => {
      monte = false;
      abonnement?.remove();
    };
  }, []);
  return reduit;
}
