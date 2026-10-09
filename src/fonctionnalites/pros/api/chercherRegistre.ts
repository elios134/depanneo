import type { Position } from '@/domaine/lieux';
import type { Pro } from '@/domaine/pro';
import { analyserRegistre, CODES_NAF, CODES_NAF_2025, construireUrlRegistre, PAR_PAGE, rayonsEssai } from '../lib/registre';
import { ErreurHttp, lireJson } from './lireJson';

// Assez d'entreprises pour remplir la liste (30 sans téléphone au plus) : on n'élargit plus le rayon.
export const SEUIL_REGISTRE = 30;
const BUDGET_MS = 15000;
// Pause entre deux requêtes : l'API accepte 7 requêtes par seconde au maximum.
const PAUSE_MS = 160;

const attendre = (ms: number) => new Promise<void>((resoudre) => setTimeout(resoudre, ms));

// L'API refuse un code NAF qu'elle ne connaît pas avec une erreur 400 qui nomme le paramètre.
const codeRefuse = (erreur: unknown) =>
  erreur instanceof ErreurHttp && erreur.statut === 400 && /activite_principale/.test(erreur.corps);

export async function chercherRegistre(position: Position, rayonKm: number): Promise<Pro[]> {
  const debut = Date.now();
  let codes: readonly string[] = CODES_NAF;
  let premiere = true;

  async function lirePage(rayon: number, page: number) {
    if (!premiere) await attendre(PAUSE_MS);
    premiere = false;
    const restant = Math.max(1000, BUDGET_MS - (Date.now() - debut));
    try {
      return analyserRegistre(await lireJson(construireUrlRegistre(position, rayon, codes, page), restant), position, rayon);
    } catch (erreur) {
      if (codes !== CODES_NAF || !codeRefuse(erreur)) throw erreur;
      // Bascule NAF 2025 : on garde les nouveaux codes pour la suite.
      codes = CODES_NAF_2025;
      await attendre(PAUSE_MS);
      return analyserRegistre(await lireJson(construireUrlRegistre(position, rayon, codes, page), restant), position, rayon);
    }
  }

  const rayons = rayonsEssai(rayonKm);
  for (const rayon of rayons) {
    const { pros, total } = await lirePage(rayon, 1);
    const dernier = rayon === rayons[rayons.length - 1];
    if (total < SEUIL_REGISTRE && !dernier) continue;
    // Une deuxième page si l'API en annonce une ; son échec n'annule pas la première.
    const suite = total > PAR_PAGE ? await lirePage(rayon, 2).catch(() => null) : null;
    const tous = [...pros, ...(suite?.pros ?? [])];
    return [...new Map(tous.map((p) => [p.id, p])).values()];
  }
  return [];
}
