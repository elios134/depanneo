// src/ui/schemas/ZoneVisible.tsx — zone visible du défilement, publiée par FondEcran.
import { createContext, useContext } from 'react';

export interface ZoneVisible {
  debut: number;
  fin: number;
}

/**
 * La valeur sert surtout de « déclencheur » : à chaque changement, les schémas mesurent à nouveau leur position
 * (debut/fin ne sont pas lus par eux).
 * `null` = pas de défilement connu : les schémas restent toujours actifs. */
export const ZoneVisibleContexte = createContext<ZoneVisible | null>(null);

export function useZoneVisible(): ZoneVisible | null {
  return useContext(ZoneVisibleContexte);
}
