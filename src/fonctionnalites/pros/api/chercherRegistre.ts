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

class BudgetEpuise extends Error {}

export async function chercherRegistre(position: Position, rayonKm: number): Promise<Pro[]> {
  const debut = Date.now();
  let codes: readonly string[] = CODES_NAF;
  let premiere = true;

  // Chaque requête reçoit ce qui reste du budget total au moment où elle part.
  async function lireUne(rayon: number, page: number) {
    const restant = BUDGET_MS - (Date.now() - debut);
    if (restant <= 0) throw new BudgetEpuise();
    return analyserRegistre(await lireJson(construireUrlRegistre(position, rayon, codes, page), restant), position, rayon);
  }

  async function lirePage(rayon: number, page: number) {
    if (!premiere) await attendre(PAUSE_MS);
    premiere = false;
    try {
      return await lireUne(rayon, page);
    } catch (erreur) {
      if (codes !== CODES_NAF || !codeRefuse(erreur)) throw erreur;
      // Bascule NAF 2025 : on garde les nouveaux codes pour la suite.
      codes = CODES_NAF_2025;
      await attendre(PAUSE_MS);
      return lireUne(rayon, page);
    }
  }

  const rayons = rayonsEssai(rayonKm);
  let precedent: Pro[] | null = null;
  for (const rayon of rayons) {
    let premierePage;
    try {
      premierePage = await lirePage(rayon, 1);
    } catch (erreur) {
      // Un rayon élargi qui échoue (réseau, délai, budget) : on garde le meilleur résultat déjà obtenu.
      if (precedent) return precedent;
      throw erreur;
    }
    const { pros, total } = premierePage;
    const dernier = rayon === rayons[rayons.length - 1];
    if (total < SEUIL_REGISTRE && !dernier) {
      precedent = pros;
      continue;
    }
    // Une deuxième page si l'API en annonce une ; son échec (ou le budget épuisé) n'annule pas la première.
    const suite = total > PAR_PAGE ? await lirePage(rayon, 2).catch(() => null) : null;
    const tous = [...pros, ...(suite?.pros ?? [])];
    return [...new Map(tous.map((p) => [p.id, p])).values()];
  }
  return [];
}
