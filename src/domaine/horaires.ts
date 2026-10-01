const JOURS: Record<string, string> = { Mo: 'Lun', Tu: 'Mar', We: 'Mer', Th: 'Jeu', Fr: 'Ven', Sa: 'Sam', Su: 'Dim' };
const JOUR = '(?:Mo|Tu|We|Th|Fr|Sa|Su)';
const MOTIF_JOURS = new RegExp(`^${JOUR}(?:-${JOUR})?(?:,${JOUR}(?:-${JOUR})?)*$`);
const MOTIF_PLAGES = /^\d{1,2}:\d{2}-\d{1,2}:\d{2}(?:,\d{1,2}:\d{2}-\d{1,2}:\d{2})*$/;

function heure(h: string): string {
  const [heures, minutes] = h.split(':');
  return minutes === '00' ? `${Number(heures)}h` : `${Number(heures)}h${minutes}`;
}

function jours(brut: string): string {
  if (brut === 'Mo-Su') return 'Tous les jours';
  return brut
    .split(',')
    .map((part) => part.split('-').map((j) => JOURS[j]).join('–'))
    .join(', ');
}

function plages(brut: string): string {
  return brut
    .split(',')
    .map((p) => p.split('-').map(heure).join('–'))
    .join(', ');
}

function regle(texte: string): string | null {
  if (texte === 'off') return 'fermé';
  if (texte === 'PH off') return 'fermé les jours fériés';
  const [debut, ...reste] = texte.split(' ');
  const suite = reste.join(' ');
  if (reste.length === 0) return MOTIF_PLAGES.test(debut) ? plages(debut) : null;
  if (!MOTIF_JOURS.test(debut)) return null;
  if (suite === 'off') return `${jours(debut)} fermé`;
  return MOTIF_PLAGES.test(suite) ? `${jours(debut)} ${plages(suite)}` : null;
}

// Rend les horaires OpenStreetMap lisibles ; syntaxe non reconnue : texte brut inchangé.
export function formaterHoraires(brut: string): string {
  const texte = brut.trim();
  if (texte === '24/7') return '24h/24, 7j/7';
  const regles = texte.split(';').map((r) => regle(r.trim()));
  return regles.every((r) => r !== null) ? regles.join(' · ') : brut;
}
