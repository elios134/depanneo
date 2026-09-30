import type { ModeTheme } from '@/fonctionnalites/reglages/lib/reglages';
import type { NomTheme } from './tokens';

export function resoudreTheme(mode: ModeTheme, systeme: string | null | undefined): NomTheme {
  if (mode === 'sombre' || mode === 'clair') return mode;
  return systeme === 'light' ? 'clair' : 'sombre';
}
