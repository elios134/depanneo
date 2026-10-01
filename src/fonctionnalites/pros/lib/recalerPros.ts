import { distanceKm } from '@/domaine/distance';
import type { Position } from '@/domaine/lieux';
import type { Pro } from '@/domaine/pro';

// Recalcule la distance de chaque pro depuis `ici`, garde ceux du rayon et trie du plus proche au plus loin.
export function recalerPros(pros: Pro[], ici: Position, rayonKm: number): Pro[] {
  return pros
    .map((pro) => ({ ...pro, distanceKm: distanceKm(ici, { lat: pro.lat, lon: pro.lon }) }))
    .filter((pro) => pro.distanceKm <= rayonKm)
    .sort((a, b) => a.distanceKm - b.distanceKm);
}
