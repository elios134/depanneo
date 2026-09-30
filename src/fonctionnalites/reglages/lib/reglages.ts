export type ModeTheme = 'sombre' | 'clair' | 'auto';
export type RayonKm = 5 | 10 | 20;

export interface Reglages {
  theme: ModeTheme;
  rayonKm: RayonKm;
  localisation: boolean;
  villeParDefaut: string | null;
}

export const REGLAGES_DEFAUT: Reglages = {
  theme: 'sombre',
  rayonKm: 10,
  localisation: true,
  villeParDefaut: null,
};

export const CLE_REGLAGES = 'depannmaison.reglages';

const MODES: ModeTheme[] = ['sombre', 'clair', 'auto'];
const RAYONS: RayonKm[] = [5, 10, 20];

export function lireReglages(brut: string | null): Reglages {
  if (!brut) return REGLAGES_DEFAUT;
  let donnees: Record<string, unknown>;
  try {
    const parse: unknown = JSON.parse(brut);
    if (typeof parse !== 'object' || parse === null) return REGLAGES_DEFAUT;
    donnees = parse as Record<string, unknown>;
  } catch {
    return REGLAGES_DEFAUT;
  }
  return {
    theme: MODES.includes(donnees.theme as ModeTheme) ? (donnees.theme as ModeTheme) : REGLAGES_DEFAUT.theme,
    rayonKm: RAYONS.includes(donnees.rayonKm as RayonKm) ? (donnees.rayonKm as RayonKm) : REGLAGES_DEFAUT.rayonKm,
    localisation: typeof donnees.localisation === 'boolean' ? donnees.localisation : REGLAGES_DEFAUT.localisation,
    villeParDefaut:
      typeof donnees.villeParDefaut === 'string' ? donnees.villeParDefaut : REGLAGES_DEFAUT.villeParDefaut,
  };
}

export function ecrireReglages(r: Reglages): string {
  return JSON.stringify(r);
}
