type Tags = Record<string, string>;

function texte(valeur: unknown): string | null {
  return typeof valeur === 'string' && valeur.trim() ? valeur.trim() : null;
}

export function villeDe(tags: Tags): string | null {
  return texte(tags['addr:city']);
}

// « 12 rue de la Rose, 13013 Marseille » ; null s'il n'y a pas de rue.
export function adresseDe(tags: Tags): string | null {
  const rue = texte(tags['addr:street']);
  if (!rue) return null;
  const voie = [texte(tags['addr:housenumber']), rue].filter(Boolean).join(' ');
  const commune = [texte(tags['addr:postcode']), villeDe(tags)].filter(Boolean).join(' ');
  return commune ? `${voie}, ${commune}` : voie;
}

// Seuls http et https sont acceptés (jamais javascript:, ftp:…).
export function siteWebDe(tags: Tags): string | null {
  const brut = texte(tags.website) ?? texte(tags['contact:website']);
  if (!brut) return null;
  const url = /^[a-z][a-z0-9+.-]*:/i.test(brut) ? brut : `https://${brut}`;
  return /^https?:\/\/\S+$/i.test(url) ? url : null;
}

export function emailDe(tags: Tags): string | null {
  const brut = texte(tags.email) ?? texte(tags['contact:email']);
  return brut ? texte(brut.split(';')[0]) : null;
}

export function horairesDe(tags: Tags): string | null {
  return texte(tags.opening_hours);
}
