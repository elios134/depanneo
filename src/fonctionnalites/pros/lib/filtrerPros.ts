import type { Metier, Pro } from '@/domaine/pro';

export function filtrerPros(pros: Pro[], filtre: Metier | 'tous'): Pro[] {
  return filtre === 'tous' ? pros : pros.filter((p) => p.metiers.includes(filtre));
}
