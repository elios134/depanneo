// src/fonctionnalites/pros/hooks/useCarteEchec.ts
import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';

// Suit l'échec de chargement du fond de carte et permet de remonter la carte
// (au retour dans l'appli ou sur « Réessayer ») pour qu'elle retente.
export function useCarteEchec() {
  const [carteEchec, setCarteEchec] = useState(false);
  const [rechargement, setRechargement] = useState(0);
  const echecActuel = useRef(false);
  echecActuel.current = carteEchec;

  const relancerCarte = useCallback(() => setRechargement((n) => n + 1), []);

  useEffect(() => {
    const abonnement = AppState.addEventListener('change', (statut) => {
      if (statut === 'active' && echecActuel.current) setRechargement((n) => n + 1);
    });
    return () => abonnement.remove();
  }, []);

  return { carteEchec, setCarteEchec, rechargement, relancerCarte };
}
