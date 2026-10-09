import { distanceKm } from '@/domaine/distance';
import { estJoignable, type Pro } from '@/domaine/pro';
import { normaliserNom } from './nomPro';

export const MAX_SANS_TELEPHONE = 30;
// Deux fiches de même nom à moins de 150 m désignent le même pro.
const ECART_MAX_KM = 0.15;

const unir = (a: Pro['metiers'], b: Pro['metiers']) => [...new Set([...a, ...b])];
const parDistance = (a: Pro, b: Pro) => a.distanceKm - b.distanceKm;

// Fiche OSM + fiche d'une autre source : OSM apporte ses contacts et horaires, l'autre son SIRET et son label.
function enrichirOsm(osm: Pro, autre: Pro): Pro {
  return {
    ...autre,
    id: osm.id,
    nom: osm.nom,
    metiers: unir(osm.metiers, autre.metiers),
    telephone: osm.telephone ?? autre.telephone,
    horaires: osm.horaires ?? autre.horaires,
    siteWeb: osm.siteWeb ?? autre.siteWeb,
    email: osm.email ?? autre.email,
    adresse: osm.adresse ?? autre.adresse,
    ville: osm.ville ?? autre.ville,
    source: autre.source === 'rge' ? 'rge' : 'osm',
  };
}

/** Réunit OSM, RGE et registre sans doublon : joignables d'abord, puis 30 pros sans téléphone au plus. */
export function fusionnerPros(sources: { osm: Pro[]; rge: Pro[]; registre: Pro[] }): Pro[] {
  const rgeParSiret = new Map(sources.rge.map((p) => [p.siret, { ...p }]));
  const autres: Pro[] = [...rgeParSiret.values()];
  for (const registre of sources.registre) {
    const rge = registre.siret ? rgeParSiret.get(registre.siret) : undefined;
    if (rge) {
      rge.metiers = unir(rge.metiers, registre.metiers);
      rge.anneeCreation = rge.anneeCreation ?? registre.anneeCreation;
    } else {
      autres.push(registre);
    }
  }
  const tous = [...autres];
  for (const osm of sources.osm) {
    const nom = normaliserNom(osm.nom);
    const indice = nom
      ? tous.findIndex((p) => p.source !== undefined && p.source !== 'osm' && normaliserNom(p.nom) === nom && distanceKm(p, osm) <= ECART_MAX_KM)
      : -1;
    if (indice >= 0) tous[indice] = enrichirOsm(osm, tous[indice]);
    else tous.push(osm);
  }
  const joignables = tous.filter(estJoignable).sort(parDistance);
  const sansTelephone = tous.filter((p) => !estJoignable(p)).sort(parDistance).slice(0, MAX_SANS_TELEPHONE);
  return [...joignables, ...sansTelephone];
}
