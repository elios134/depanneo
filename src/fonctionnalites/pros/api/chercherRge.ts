import type { Position } from '@/domaine/lieux';
import type { Pro } from '@/domaine/pro';
import { analyserRge, construireUrlRge } from '../lib/rge';
import { lireJson } from './lireJson';

const DELAI_MS = 15000;

const aujourdhuiIso = () => new Date().toISOString().slice(0, 10);

export async function chercherRge(position: Position, rayonKm: number, aujourdhui: string = aujourdhuiIso()): Promise<Pro[]> {
  return analyserRge(await lireJson(construireUrlRge(position, rayonKm), DELAI_MS), position, aujourdhui);
}
