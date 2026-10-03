// Filtrage des « miettes » Sentry : on retire tout appel réseau dont l'adresse contient la position ou un lieu.
const DOMAINES_AVEC_POSITION = [
  'overpass-api.de',
  'maps.mail.ru',
  'overpass.private.coffee',
  'data.geopf.fr',
  'openfreemap.org',
];

export function nettoyerFilAriane<T extends { category?: string; data?: Record<string, unknown> }>(
  miette: T,
): T | null {
  if (miette.category !== 'fetch' && miette.category !== 'xhr') return miette;
  const url = miette.data?.url;
  if (typeof url === 'string' && DOMAINES_AVEC_POSITION.some((domaine) => url.includes(domaine))) {
    return null;
  }
  return miette;
}
