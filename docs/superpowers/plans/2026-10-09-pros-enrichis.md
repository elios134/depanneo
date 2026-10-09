# Pros enrichis — plan de mise en œuvre

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** ajouter à l'onglet Pros l'annuaire RGE de l'ADEME (pros avec téléphone + badge) et le registre des entreprises de l'État (artisans sans téléphone), fusionnés avec OpenStreetMap.

**Architecture:** trois modules d'analyse purs (`lib/rge.ts`, `lib/registre.ts`, `lib/fusion.ts`) testés sur des réponses figées ; trois fonctions réseau (`api/chercherOsm.ts`, `api/chercherRge.ts`, `api/chercherRegistre.ts`) appelées en parallèle par `api/chercherPros.ts` ; l'interface sépare « joignables » (avec téléphone) et « registre » (sans).

**Tech Stack:** Expo SDK 57, React Native 0.86, TypeScript strict, Jest (jest-expo), Maestro.

**Spec:** `docs/superpowers/specs/2026-10-09-pros-enrichis-design.md` — maquette validée `docs/design/maquettes-v2/13-pros-enrichis.html`.

## Global Constraints

- Tout en français : interface, commentaires, messages de commit (simples, sans jargon). Fin de chaque message de commit : ligne vide puis `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- Aucune couleur en dur hors de `src/theme/` (un test le vérifie) : utiliser `useTheme().couleurs` et `teinte()`.
- `app/` = routes seulement ; logique pure dans `lib/`, testée, test à côté du fichier.
- Tailles cibles : composant 80–150 lignes (plafond ~250), écran 150–250 (~350), lib 100–200 (~300).
- Ne jamais lancer `npx expo export`. Ne pas utiliser le Metro d'André.
- Commandes de vérification : `npx tsc --noEmit`, `npx expo lint` (0 erreur, 0 avertissement), `npx jest`.
- Identité git locale déjà configurée (elios134) : ne jamais toucher à la configuration git globale.
- Codes NAF actuels `43.22A` (plombier), `43.21A` (électricien) ; codes NAF 2025 `43.22G`, `43.21G` (refusés par l'API au 09/10/2026).
- Annuaire RGE : `https://data.ademe.fr/data-fair/api/v1/datasets/eo1n335dwa-ul7glxa7lm1ho/lines`. Registre : `https://recherche-entreprises.api.gouv.fr/near_point` (7 requêtes/s max).
- Au plus 30 pros sans téléphone dans la liste fusionnée.

---

## Structure des fichiers

| Fichier | Rôle |
|---|---|
| `src/domaine/pro.ts` (modifié) | Champs `source`, `siret`, `rge`, `anneeCreation` ; `estJoignable`, `texteRge` |
| `src/domaine/liensPro.ts` (nouveau) | `lienFicheOfficielle`, `lienChercherNumero`, `lienGoogleMaps` |
| `src/domaine/lienAvis.ts` (modifié) | exporte `lieuRecherche(pro)` réutilisé par `liensPro.ts` |
| `src/domaine/icones.ts`, `src/ui/Icone.tsx` (modifiés) | icône `building` |
| `src/fonctionnalites/pros/lib/nomPro.ts` (nouveau) | `casseTitre`, `normaliserNom` |
| `src/fonctionnalites/pros/lib/rge.ts` (nouveau) | URL + analyse de l'annuaire RGE |
| `src/fonctionnalites/pros/lib/registre.ts` (nouveau) | URL + analyse du registre, `rayonsEssai` |
| `src/fonctionnalites/pros/lib/fusion.ts` (nouveau) | `fusionnerPros` |
| `src/fonctionnalites/pros/api/lireJson.ts` (nouveau) | `fetch` avec délai + `ErreurHttp` |
| `src/fonctionnalites/pros/api/chercherOsm.ts` (nouveau, code déplacé) | interrogation Overpass |
| `src/fonctionnalites/pros/api/chercherRge.ts`, `chercherRegistre.ts` (nouveaux) | interrogation des deux nouvelles sources |
| `src/fonctionnalites/pros/api/chercherPros.ts` (modifié) | sources en parallèle + fusion |
| `src/fonctionnalites/pros/lib/cachePros.ts` (modifié) | `version: 2` |
| `src/ui/ouvrirLien.ts`, `src/ui/BadgeRge.tsx`, `src/ui/BlocRge.tsx` (nouveaux) | ouverture d'adresse, badge, encadré RGE |
| `src/ui/CarteListe.tsx`, `src/ui/CartePro.tsx`, `src/ui/FichePro.tsx` (modifiés) | badge, carte discrète, fiches RGE/registre |
| `src/fonctionnalites/pros/components/ListePros.tsx` (nouveau) | les deux sections de l'onglet |
| `src/fonctionnalites/pros/components/Marqueurs.tsx`, `CartePros.native.tsx`, `EcranPros.tsx` (modifiés) | point gris, sections, Google Maps, crédits |
| `src/fonctionnalites/accueil/EcranAccueil.tsx`, `components/SectionPros.tsx`, `src/fonctionnalites/diagnostic/components/CarteResultat.tsx` (modifiés) | joignables seulement |
| `e2e/pros.yaml` (nouveau), `CLAUDE.md`, `docs/build-android.md` (modifiés) | scénario + doc |

---

### Task 1 : modèle `Pro`, liens et noms

**Files:**
- Modify: `src/domaine/pro.ts`, `src/domaine/lienAvis.ts`, `src/domaine/icones.ts`, `src/ui/Icone.tsx`
- Create: `src/domaine/liensPro.ts`, `src/domaine/liensPro.test.ts`, `src/fonctionnalites/pros/lib/nomPro.ts`, `src/fonctionnalites/pros/lib/nomPro.test.ts`
- Test: `src/domaine/pro.test.ts` (ajouts)

**Interfaces:**
- Produces :
  - `type SourcePro = 'osm' | 'rge' | 'registre'`
  - `interface LabelRge { qualification: string; organisme: string; finValidite: string }` (`finValidite` au format `AAAA-MM-JJ`)
  - `Pro` gagne `source?: SourcePro; siret?: string | null; rge?: LabelRge | null; anneeCreation?: number | null`
  - `estJoignable(pro: Pro): boolean`, `texteRge(rge: LabelRge): string`
  - `lieuRecherche(pro: Pro): string` (dans `lienAvis.ts`)
  - `lienFicheOfficielle(siret: string): string`, `lienChercherNumero(pro: Pro): string`, `lienGoogleMaps(position: Position, filtre: Metier | 'tous'): string`
  - `casseTitre(nom: string): string`, `normaliserNom(nom: string): string`
  - icône `'building'`

- [ ] **Step 1 : écrire les tests qui échouent**

Ajouter à `src/domaine/pro.test.ts` :

```ts
import { estJoignable, texteRge, type Pro } from './pro';

const base: Pro = { id: 'x', nom: 'X', metiers: ['plombier'], telephone: null, lat: 43.3, lon: 5.4, distanceKm: 1 };

describe('estJoignable', () => {
  it('vrai avec un téléphone', () => {
    expect(estJoignable({ ...base, telephone: '04 91 00 00 00' })).toBe(true);
  });
  it('faux sans téléphone ou avec un téléphone vide', () => {
    expect(estJoignable(base)).toBe(false);
    expect(estJoignable({ ...base, telephone: '' })).toBe(false);
  });
});

describe('texteRge', () => {
  it('phrase avec organisme en majuscule et date française', () => {
    expect(
      texteRge({ qualification: 'Installation de plomberie sanitaire', organisme: 'qualibat', finValidite: '2030-07-11' }),
    ).toBe('Qualification « Installation de plomberie sanitaire » vérifiée par Qualibat, valable jusqu’au 11/07/2030.');
  });
});
```

Créer `src/domaine/liensPro.test.ts` :

```ts
import { lienChercherNumero, lienFicheOfficielle, lienGoogleMaps } from './liensPro';
import type { Pro } from './pro';

const pro: Pro = {
  id: 'registre/1', nom: 'VM Plomberie', metiers: ['plombier'], telephone: null, lat: 43.3, lon: 5.4, distanceKm: 1, ville: 'Marseille',
};

describe('liens des pros', () => {
  it('fiche officielle sur annuaire-entreprises', () => {
    expect(lienFicheOfficielle('40215610300036')).toBe('https://annuaire-entreprises.data.gouv.fr/etablissement/40215610300036');
  });
  it('recherche du numéro : nom + ville + téléphone', () => {
    expect(lienChercherNumero(pro)).toBe('https://www.google.com/search?q=VM%20Plomberie%20Marseille%20t%C3%A9l%C3%A9phone');
  });
  it('Google Maps suit le filtre', () => {
    const ici = { lat: 43.2965, lon: 5.3698 };
    expect(lienGoogleMaps(ici, 'plombier')).toBe('https://www.google.com/maps/search/plombier/@43.2965,5.3698,14z');
    expect(lienGoogleMaps(ici, 'electricien')).toBe('https://www.google.com/maps/search/%C3%A9lectricien/@43.2965,5.3698,14z');
    expect(lienGoogleMaps(ici, 'tous')).toBe('https://www.google.com/maps/search/plombier%20%C3%A9lectricien/@43.2965,5.3698,14z');
  });
});
```

Créer `src/fonctionnalites/pros/lib/nomPro.test.ts` :

```ts
import { casseTitre, normaliserNom } from './nomPro';

describe('casseTitre', () => {
  it('met en casse de titre un nom tout en majuscules', () => {
    expect(casseTitre('ETABLISSEMENTS SOUCHON')).toBe('Etablissements Souchon');
    expect(casseTitre('PLOMBERIE DE LA GARE')).toBe('Plomberie de la Gare');
    expect(casseTitre("L'ATELIER D'ELEC")).toBe("L'Atelier d'Elec");
    expect(casseTitre('JEAN-PIERRE MARTIN')).toBe('Jean-Pierre Martin');
  });
  it('garde les sigles juridiques en majuscules', () => {
    expect(casseTitre('SARL PH DEUX')).toBe('SARL Ph Deux');
  });
  it('laisse un nom déjà en casse mixte', () => {
    expect(casseTitre('Élec 13')).toBe('Élec 13');
  });
});

describe('normaliserNom', () => {
  it('minuscules, sans accents, sans ponctuation ni forme juridique', () => {
    expect(normaliserNom('SARL Plomberie Durand-Frères')).toBe('plomberie durand freres');
    expect(normaliserNom('Élec 13 (SAS)')).toBe('elec 13');
    expect(normaliserNom('Ets. Souchon')).toBe('souchon');
  });
});
```

- [ ] **Step 2 : lancer les tests, vérifier qu'ils échouent**

Run: `npx jest src/domaine src/fonctionnalites/pros/lib/nomPro.test.ts`
Expected: FAIL (`estJoignable`, `liensPro`, `nomPro` introuvables).

- [ ] **Step 3 : implémenter**

Dans `src/domaine/pro.ts`, remplacer l'interface `Pro` et ajouter les fonctions :

```ts
export type SourcePro = 'osm' | 'rge' | 'registre';

/** Label RGE (annuaire de l'ADEME). finValidite : AAAA-MM-JJ. */
export interface LabelRge {
  qualification: string;
  organisme: string;
  finValidite: string;
}

export interface Pro {
  id: string;
  nom: string;
  metiers: Metier[];
  telephone: string | null;
  lat: number;
  lon: number;
  distanceKm: number;
  // Facultatifs : absents des listes déjà enregistrées sur le téléphone.
  adresse?: string | null;
  siteWeb?: string | null;
  email?: string | null;
  horaires?: string | null;
  ville?: string | null;
  // Absent = OpenStreetMap (listes enregistrées avant le chantier « Pros enrichis »).
  source?: SourcePro;
  siret?: string | null;
  rge?: LabelRge | null;
  anneeCreation?: number | null;
}

/** Un pro qu'on peut appeler tout de suite. */
export function estJoignable(pro: Pro): boolean {
  return Boolean(pro.telephone);
}

/** Phrase de l'encadré RGE de la fiche. */
export function texteRge(rge: LabelRge): string {
  const organisme = rge.organisme.charAt(0).toUpperCase() + rge.organisme.slice(1);
  const [annee, mois, jour] = rge.finValidite.split('-');
  return `Qualification « ${rge.qualification} » vérifiée par ${organisme}, valable jusqu’au ${jour}/${mois}/${annee}.`;
}
```

Dans `src/domaine/lienAvis.ts`, extraire le lieu :

```ts
import { LIBELLES_METIER, type Pro } from './pro';

/** Ville du pro, sinon son code postal, sinon son métier : sert aux recherches web. */
export function lieuRecherche(pro: Pro): string {
  const ville = pro.ville?.trim();
  const codePostal = pro.adresse?.match(/\b\d{5}\b/)?.[0];
  return ville || codePostal || LIBELLES_METIER[pro.metiers[0]].toLowerCase();
}

// Recherche web « nom + ville + avis », ouverte dans le navigateur.
export function lienAvis(pro: Pro): string {
  const recherche = `${pro.nom} ${lieuRecherche(pro)} avis`.replace(/\s+/g, ' ').trim();
  return `https://www.google.com/search?q=${encodeURIComponent(recherche)}`;
}
```

Créer `src/domaine/liensPro.ts` :

```ts
import { lieuRecherche } from './lienAvis';
import type { Position } from './lieux';
import type { Metier, Pro } from './pro';

/** Fiche publique de l'établissement sur le site de l'État. */
export function lienFicheOfficielle(siret: string): string {
  return `https://annuaire-entreprises.data.gouv.fr/etablissement/${siret}`;
}

/** Recherche web « nom + ville + téléphone » pour un pro sans numéro. */
export function lienChercherNumero(pro: Pro): string {
  const recherche = `${pro.nom} ${lieuRecherche(pro)} téléphone`.replace(/\s+/g, ' ').trim();
  return `https://www.google.com/search?q=${encodeURIComponent(recherche)}`;
}

const TERMES: Record<Metier | 'tous', string> = {
  plombier: 'plombier',
  electricien: 'électricien',
  tous: 'plombier électricien',
};

/** Recherche Google Maps autour de la position (Android l'ouvre dans l'appli Google Maps si elle est installée). */
export function lienGoogleMaps(position: Position, filtre: Metier | 'tous'): string {
  return `https://www.google.com/maps/search/${encodeURIComponent(TERMES[filtre])}/@${position.lat},${position.lon},14z`;
}
```

Créer `src/fonctionnalites/pros/lib/nomPro.ts` :

```ts
// Sigles gardés en majuscules ; petits mots en minuscules (sauf en premier).
const SIGLES = new Set(['SARL', 'SAS', 'SASU', 'EURL', 'SA', 'SCI', 'SNC', 'EI', 'EIRL']);
const PETITS_MOTS = new Set(['de', 'du', 'des', 'la', 'le', 'les', 'et', 'en', 'à', 'au', 'aux', 'sur']);
const FORMES_JURIDIQUES = new Set(['sarl', 'sas', 'sasu', 'eurl', 'sa', 'ets', 'etablissements', 'eirl', 'ei']);

const majuscule = (mot: string) => mot.charAt(0).toUpperCase() + mot.slice(1);

/** « ETABLISSEMENTS SOUCHON » → « Etablissements Souchon ». Un nom déjà en casse mixte est gardé. */
export function casseTitre(nom: string): string {
  if (nom !== nom.toUpperCase()) return nom;
  return nom
    .split(' ')
    .filter(Boolean)
    .map((mot, i) => {
      if (SIGLES.has(mot)) return mot;
      const bas = mot.toLowerCase();
      if (i > 0 && PETITS_MOTS.has(bas)) return bas;
      // « D'ELEC » → « d'Elec » ; « JEAN-PIERRE » → « Jean-Pierre ».
      const apostrophe = bas.match(/^([dl])'(.+)$/);
      if (apostrophe) return `${i === 0 ? apostrophe[1].toUpperCase() : apostrophe[1]}'${majuscule(apostrophe[2])}`;
      return bas.split('-').map(majuscule).join('-');
    })
    .join(' ');
}

/** Forme comparable d'un nom : minuscules, sans accents, ponctuation ni forme juridique. */
export function normaliserNom(nom: string): string {
  return nom
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .split(' ')
    .filter((mot) => mot && !FORMES_JURIDIQUES.has(mot))
    .join(' ');
}
```

Ajouter l'icône `building` : dans `src/domaine/icones.ts`, ajouter `'building'` à la fin de `NOMS_ICONES` (après `'share'`) ; dans `src/ui/Icone.tsx`, importer `Building` depuis `lucide-react-native` (ordre alphabétique de l'import) et ajouter `building: Building` à `COMPOSANTS`.

- [ ] **Step 4 : lancer les tests**

Run: `npx jest src/domaine src/fonctionnalites/pros/lib/nomPro.test.ts && npx tsc --noEmit`
Expected: PASS, aucune erreur de type (le test existant `lienAvis.test.ts` doit toujours passer).

- [ ] **Step 5 : commit**

```bash
git add src/domaine src/ui/Icone.tsx src/fonctionnalites/pros/lib/nomPro.ts src/fonctionnalites/pros/lib/nomPro.test.ts
git commit -m "Prépare le modèle des pros : source, label RGE, SIRET et liens de recherche

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 2 : analyse de l'annuaire RGE

**Files:**
- Create: `src/fonctionnalites/pros/lib/rge.ts`, `src/fonctionnalites/pros/lib/rge.test.ts`

**Interfaces:**
- Consumes : `Pro`, `LabelRge`, `Metier` (`@/domaine/pro`), `distanceKm` (`@/domaine/distance`), `casseTitre` (`./nomPro`).
- Produces :
  - `URL_RGE: string`
  - `construireUrlRge(p: Position, rayonKm: number): string`
  - `metiersRge(qualification: string): Metier[]`
  - `analyserRge(donnees: unknown, depuis: Position, aujourdhui: string): Pro[]` (`aujourdhui` = `AAAA-MM-JJ`)

Notes sur l'API (vérifiées le 09/10/2026) : `q` + `q_fields=nom_qualification` filtre en texte libre (mots en « OU ») ; `sort=_geo_distance:<lon>:<lat>` trie du plus proche au plus loin ; `qs=particulier:true` garde les pros des particuliers. On filtre ensuite précisément côté appli.

- [ ] **Step 1 : écrire les tests qui échouent**

```ts
import { analyserRge, construireUrlRge, metiersRge } from './rge';

const ici = { lat: 43.2965, lon: 5.3698 };
const ligne = (extra: Record<string, unknown>) => ({
  siret: '05680647400021',
  nom_entreprise: 'ETABLISSEMENTS SOUCHON',
  adresse: '46 RUE DE LA BIBLIOTHEQUE',
  code_postal: '13001',
  commune: 'MARSEILLE',
  latitude: 43.2958,
  longitude: 5.386,
  telephone: '04 91 42 14 47',
  email: 'contact@exemple.fr',
  site_internet: null,
  nom_qualification: 'Installation de plomberie sanitaire en habitat individuel',
  organisme: 'qualibat',
  lien_date_fin: '2030-07-11',
  ...extra,
});

describe('construireUrlRge', () => {
  it('cherche autour du point, trie par distance, pros des particuliers', () => {
    const url = construireUrlRge(ici, 10);
    expect(url).toContain('https://data.ademe.fr/data-fair/api/v1/datasets/eo1n335dwa-ul7glxa7lm1ho/lines?');
    expect(url).toContain(`geo_distance=${encodeURIComponent('5.3698,43.2965,10km')}`);
    expect(url).toContain(`sort=${encodeURIComponent('_geo_distance:5.3698:43.2965')}`);
    expect(url).toContain(`qs=${encodeURIComponent('particulier:true')}`);
    expect(url).toContain('q_fields=nom_qualification');
    expect(url).toContain('size=1000');
  });
});

describe('metiersRge', () => {
  it('reconnaît plombier et électricien', () => {
    expect(metiersRge('Installation de plomberie sanitaire')).toEqual(['plombier']);
    expect(metiersRge('Efficacité énergétique - "ECO Artisan®" - Plombier')).toEqual(['plombier']);
    expect(metiersRge('QualiPAC CET - Pose de chauffe-eau thermodynamique')).toEqual(['plombier']);
    expect(metiersRge('Efficacité énergétique - "ECO Artisan®" - Électricien')).toEqual(['electricien']);
    expect(metiersRge('Radiateurs électriques, dont régulation')).toEqual(['electricien']);
  });
  it('ignore les autres qualifications', () => {
    expect(metiersRge('Couverture en plomb')).toEqual([]);
    expect(metiersRge('Isolation thermique par l’extérieur')).toEqual([]);
  });
});

describe('analyserRge', () => {
  it('regroupe les lignes par SIRET et garde le label le plus long', () => {
    const pros = analyserRge(
      {
        results: [
          ligne({ lien_date_fin: '2027-01-01' }),
          ligne({ nom_qualification: 'Radiateurs électriques, dont régulation', lien_date_fin: '2030-07-11' }),
        ],
      },
      ici,
      '2026-10-09',
    );
    expect(pros).toHaveLength(1);
    expect(pros[0]).toMatchObject({
      id: 'rge/05680647400021',
      source: 'rge',
      siret: '05680647400021',
      nom: 'Etablissements Souchon',
      metiers: ['plombier', 'electricien'],
      telephone: '04 91 42 14 47',
      adresse: '46 Rue de la Bibliotheque, 13001 Marseille',
      ville: 'Marseille',
      email: 'contact@exemple.fr',
      siteWeb: null,
      rge: { qualification: 'Radiateurs électriques, dont régulation', organisme: 'qualibat', finValidite: '2030-07-11' },
    });
    expect(pros[0].distanceKm).toBeGreaterThan(0);
  });
  it('écarte les labels expirés et les qualifications hors métier', () => {
    const pros = analyserRge(
      {
        results: [
          ligne({ lien_date_fin: '2026-10-08' }),
          ligne({ siret: '2', nom_qualification: 'Isolation thermique par l’extérieur' }),
        ],
      },
      ici,
      '2026-10-09',
    );
    expect(pros).toEqual([]);
  });
  it('écarte les lignes sans SIRET ou sans position, et un téléphone vide devient null', () => {
    const pros = analyserRge(
      { results: [ligne({ siret: null }), ligne({ siret: '3', latitude: 'x' }), ligne({ siret: '4', telephone: '  ' })] },
      ici,
      '2026-10-09',
    );
    expect(pros.map((p) => p.id)).toEqual(['rge/4']);
    expect(pros[0].telephone).toBeNull();
  });
  it('réponse illisible : liste vide', () => {
    expect(analyserRge(null, ici, '2026-10-09')).toEqual([]);
    expect(analyserRge({ results: 'non' }, ici, '2026-10-09')).toEqual([]);
  });
});
```

- [ ] **Step 2 : lancer, vérifier l'échec**

Run: `npx jest src/fonctionnalites/pros/lib/rge.test.ts`
Expected: FAIL (module `./rge` introuvable).

- [ ] **Step 3 : implémenter `src/fonctionnalites/pros/lib/rge.ts`**

```ts
import { distanceKm } from '@/domaine/distance';
import type { Position } from '@/domaine/lieux';
import type { LabelRge, Metier, Pro } from '@/domaine/pro';
import { casseTitre } from './nomPro';

// Annuaire des entreprises RGE de l'ADEME (Licence Ouverte, mis à jour chaque jour).
export const URL_RGE = 'https://data.ademe.fr/data-fair/api/v1/datasets/eo1n335dwa-ul7glxa7lm1ho/lines';

const CHAMPS = [
  'siret', 'nom_entreprise', 'adresse', 'code_postal', 'commune', 'latitude', 'longitude',
  'telephone', 'email', 'site_internet', 'nom_qualification', 'organisme', 'lien_date_fin',
].join(',');
// Premier tri côté serveur (mots en « OU ») ; le tri précis est fait par metiersRge.
const MOTS_METIERS = 'plomberie plombier chauffe-eau électricien radiateurs';

export function construireUrlRge(p: Position, rayonKm: number): string {
  const parametres: [string, string][] = [
    ['geo_distance', `${p.lon},${p.lat},${rayonKm}km`],
    ['sort', `_geo_distance:${p.lon}:${p.lat}`],
    ['qs', 'particulier:true'],
    ['q', MOTS_METIERS],
    ['q_fields', 'nom_qualification'],
    ['select', CHAMPS],
    ['size', '1000'],
  ];
  return `${URL_RGE}?${parametres.map(([cle, valeur]) => `${cle}=${encodeURIComponent(valeur)}`).join('&')}`;
}

export function metiersRge(qualification: string): Metier[] {
  const metiers: Metier[] = [];
  if (/plomberie|plombier|chauffe-eau/i.test(qualification)) metiers.push('plombier');
  if (/électricien|electricien|radiateurs électriques/i.test(qualification)) metiers.push('electricien');
  return metiers;
}

interface LigneRge {
  siret?: unknown;
  nom_entreprise?: unknown;
  adresse?: unknown;
  code_postal?: unknown;
  commune?: unknown;
  latitude?: unknown;
  longitude?: unknown;
  telephone?: unknown;
  email?: unknown;
  site_internet?: unknown;
  nom_qualification?: unknown;
  organisme?: unknown;
  lien_date_fin?: unknown;
}

const texte = (valeur: unknown): string | null => (typeof valeur === 'string' && valeur.trim() ? valeur.trim() : null);
const nombre = (valeur: unknown): number | null => (typeof valeur === 'number' && Number.isFinite(valeur) ? valeur : null);

/** Une entreprise par SIRET ; seulement les labels valides de plomberie ou d'électricité. */
export function analyserRge(donnees: unknown, depuis: Position, aujourdhui: string): Pro[] {
  const lignes = (donnees as { results?: unknown } | null)?.results;
  if (!Array.isArray(lignes)) return [];
  const parSiret = new Map<string, Pro>();
  for (const ligne of lignes as (LigneRge | null)[]) {
    if (!ligne || typeof ligne !== 'object') continue;
    const siret = texte(ligne.siret);
    const lat = nombre(ligne.latitude);
    const lon = nombre(ligne.longitude);
    const qualification = texte(ligne.nom_qualification);
    const fin = texte(ligne.lien_date_fin);
    if (!siret || lat === null || lon === null || !qualification || !fin || fin < aujourdhui) continue;
    const metiers = metiersRge(qualification);
    if (metiers.length === 0) continue;
    const label: LabelRge = { qualification, organisme: texte(ligne.organisme) ?? 'organisme inconnu', finValidite: fin };
    const deja = parSiret.get(siret);
    if (deja) {
      deja.metiers = [...new Set([...deja.metiers, ...metiers])];
      if (!deja.rge || deja.rge.finValidite < fin) deja.rge = label;
      continue;
    }
    const ville = texte(ligne.commune);
    const rue = texte(ligne.adresse);
    const codePostal = texte(ligne.code_postal);
    const adresse = [rue && casseTitre(rue), [codePostal, ville && casseTitre(ville)].filter(Boolean).join(' ')]
      .filter(Boolean)
      .join(', ');
    parSiret.set(siret, {
      id: `rge/${siret}`,
      source: 'rge',
      siret,
      nom: casseTitre(texte(ligne.nom_entreprise) ?? 'Entreprise RGE'),
      metiers,
      telephone: texte(ligne.telephone),
      lat,
      lon,
      distanceKm: distanceKm(depuis, { lat, lon }),
      adresse: adresse || null,
      ville: ville ? casseTitre(ville) : null,
      email: texte(ligne.email),
      siteWeb: texte(ligne.site_internet),
      rge: label,
    });
  }
  return [...parSiret.values()].sort((a, b) => a.distanceKm - b.distanceKm);
}
```

- [ ] **Step 4 : lancer les tests**

Run: `npx jest src/fonctionnalites/pros/lib/rge.test.ts && npx tsc --noEmit`
Expected: PASS.

- [ ] **Step 5 : commit**

```bash
git add src/fonctionnalites/pros/lib/rge.ts src/fonctionnalites/pros/lib/rge.test.ts
git commit -m "Lit l'annuaire RGE de l'ADEME (plombiers et électriciens labellisés)

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 3 : analyse du registre des entreprises

**Files:**
- Create: `src/fonctionnalites/pros/lib/registre.ts`, `src/fonctionnalites/pros/lib/registre.test.ts`

**Interfaces:**
- Consumes : `Pro`, `Metier`, `distanceKm`, `casseTitre`.
- Produces :
  - `URL_REGISTRE: string`, `CODES_NAF: readonly string[]` (`['43.22A', '43.21A']`), `CODES_NAF_2025: readonly string[]` (`['43.22G', '43.21G']`)
  - `PAR_PAGE = 25`
  - `construireUrlRegistre(p: Position, rayonKm: number, codes: readonly string[], page: number): string`
  - `rayonsEssai(rayonKm: number): number[]`
  - `metierNaf(code: unknown): Metier | null`
  - `analyserRegistre(donnees: unknown, depuis: Position, rayonKm: number): { pros: Pro[]; total: number }`

- [ ] **Step 1 : écrire les tests qui échouent**

```ts
import { analyserRegistre, construireUrlRegistre, metierNaf, rayonsEssai } from './registre';

const ici = { lat: 43.2965, lon: 5.3698 };
const etab = (extra: Record<string, unknown>) => ({
  siret: '40215610300036',
  activite_principale: '43.22A',
  etat_administratif: 'A',
  latitude: '43.2990',
  longitude: '5.3720',
  code_postal: '13001',
  adresse: '618 RUE SAINT PIERRE 13001 MARSEILLE',
  libelle_commune: 'MARSEILLE',
  liste_enseignes: null,
  nom_commercial: null,
  date_creation: '1997-08-20',
  ...extra,
});
const reponse = (etablissements: unknown[], extra: Record<string, unknown> = {}) => ({
  total_results: 42,
  results: [{ nom_complet: 'GERARD GUNALONS', activite_principale: '43.22A', matching_etablissements: etablissements, ...extra }],
});

describe('construireUrlRegistre', () => {
  it('cherche les codes demandés autour du point', () => {
    expect(construireUrlRegistre(ici, 2, ['43.22A', '43.21A'], 1)).toBe(
      'https://recherche-entreprises.api.gouv.fr/near_point?lat=43.2965&long=5.3698&radius=2&activite_principale=43.22A%2C43.21A&per_page=25&page=1',
    );
  });
});

describe('rayonsEssai', () => {
  it('rayons croissants jusqu’au rayon des réglages', () => {
    expect(rayonsEssai(5)).toEqual([1, 2, 5]);
    expect(rayonsEssai(10)).toEqual([1, 2, 5, 10]);
    expect(rayonsEssai(20)).toEqual([1, 2, 5, 10, 20]);
    expect(rayonsEssai(3)).toEqual([1, 2, 3]);
  });
});

describe('metierNaf', () => {
  it('codes actuels et codes 2025', () => {
    expect(metierNaf('43.22A')).toBe('plombier');
    expect(metierNaf('43.22G')).toBe('plombier');
    expect(metierNaf('43.21A')).toBe('electricien');
    expect(metierNaf('43.21G')).toBe('electricien');
    expect(metierNaf('43.22B')).toBeNull();
  });
});

describe('analyserRegistre', () => {
  it('un pro par établissement ouvert, sans téléphone', () => {
    const { pros, total } = analyserRegistre(reponse([etab({})]), ici, 5);
    expect(total).toBe(42);
    expect(pros).toHaveLength(1);
    expect(pros[0]).toMatchObject({
      id: 'registre/40215610300036',
      source: 'registre',
      siret: '40215610300036',
      nom: 'Gerard Gunalons',
      metiers: ['plombier'],
      telephone: null,
      adresse: '618 Rue Saint Pierre 13001 Marseille',
      ville: 'Marseille',
      anneeCreation: 1997,
    });
  });
  it('préfère l’enseigne, puis le nom commercial, puis le nom sans parenthèses', () => {
    expect(analyserRegistre(reponse([etab({ liste_enseignes: ['ADIBILLON ASSISTANCE 13'] })]), ici, 5).pros[0].nom).toBe('Adibillon Assistance 13');
    expect(analyserRegistre(reponse([etab({ nom_commercial: 'VM PLOMBERIE' })]), ici, 5).pros[0].nom).toBe('Vm Plomberie');
    expect(
      analyserRegistre(reponse([etab({})], { nom_complet: 'VINCENT MEOLA (VM PLOMBERIE)' }), ici, 5).pros[0].nom,
    ).toBe('Vincent Meola');
  });
  it('écarte les établissements fermés, étrangers, hors rayon ou sans position', () => {
    const { pros } = analyserRegistre(
      reponse([
        etab({ siret: '1', etat_administratif: 'F' }),
        etab({ siret: '2', code_postal: '1000-001' }),
        etab({ siret: '3', latitude: '44.5' }),
        etab({ siret: '4', latitude: null }),
        etab({ siret: '5', activite_principale: '41.20A' }),
        etab({ siret: '6' }),
      ]),
      ici,
      5,
    );
    expect(pros.map((p) => p.id)).toEqual(['registre/6']);
  });
  it('réponse illisible : rien', () => {
    expect(analyserRegistre(null, ici, 5)).toEqual({ pros: [], total: 0 });
    expect(analyserRegistre({ results: [null, { matching_etablissements: 'x' }] }, ici, 5)).toEqual({ pros: [], total: 0 });
  });
});
```

- [ ] **Step 2 : lancer, vérifier l'échec**

Run: `npx jest src/fonctionnalites/pros/lib/registre.test.ts`
Expected: FAIL (module `./registre` introuvable).

- [ ] **Step 3 : implémenter `src/fonctionnalites/pros/lib/registre.ts`**

```ts
import { distanceKm } from '@/domaine/distance';
import type { Position } from '@/domaine/lieux';
import type { Metier, Pro } from '@/domaine/pro';
import { casseTitre } from './nomPro';

// API Recherche d'entreprises de l'État (données INSEE Sirene), 7 requêtes par seconde au maximum.
export const URL_REGISTRE = 'https://recherche-entreprises.api.gouv.fr/near_point';
export const CODES_NAF = ['43.22A', '43.21A'] as const;
// Codes de la nomenclature NAF 2025 (en vigueur au 01/01/2027) : refusés par l'API au 09/10/2026.
export const CODES_NAF_2025 = ['43.22G', '43.21G'] as const;
export const PAR_PAGE = 25;
const RAYONS = [1, 2, 5, 10, 20, 50];

export function construireUrlRegistre(p: Position, rayonKm: number, codes: readonly string[], page: number): string {
  return (
    `${URL_REGISTRE}?lat=${p.lat}&long=${p.lon}&radius=${rayonKm}` +
    `&activite_principale=${encodeURIComponent(codes.join(','))}&per_page=${PAR_PAGE}&page=${page}`
  );
}

/** Rayons essayés l'un après l'autre : d'abord tout près, jusqu'au rayon des réglages. */
export function rayonsEssai(rayonKm: number): number[] {
  return [...RAYONS.filter((r) => r < rayonKm), Math.min(rayonKm, 50)];
}

export function metierNaf(code: unknown): Metier | null {
  if (code === '43.22A' || code === '43.22G') return 'plombier';
  if (code === '43.21A' || code === '43.21G') return 'electricien';
  return null;
}

interface Etablissement {
  siret?: unknown;
  activite_principale?: unknown;
  etat_administratif?: unknown;
  latitude?: unknown;
  longitude?: unknown;
  code_postal?: unknown;
  adresse?: unknown;
  libelle_commune?: unknown;
  liste_enseignes?: unknown;
  nom_commercial?: unknown;
  date_creation?: unknown;
}

interface Entreprise {
  nom_complet?: unknown;
  activite_principale?: unknown;
  matching_etablissements?: unknown;
}

const texte = (valeur: unknown): string | null => (typeof valeur === 'string' && valeur.trim() ? valeur.trim() : null);

function nomAffiche(entreprise: Entreprise, etab: Etablissement): string {
  const enseigne = Array.isArray(etab.liste_enseignes) ? texte(etab.liste_enseignes[0]) : null;
  const complet = texte(entreprise.nom_complet)?.replace(/\s*\(.*\)\s*$/, '').trim();
  return casseTitre(enseigne ?? texte(etab.nom_commercial) ?? (complet || 'Artisan'));
}

/** Établissements ouverts, en France, dans le rayon ; total = nombre d'entreprises annoncé par l'API. */
export function analyserRegistre(donnees: unknown, depuis: Position, rayonKm: number): { pros: Pro[]; total: number } {
  const brut = donnees as { results?: unknown; total_results?: unknown } | null;
  const total = typeof brut?.total_results === 'number' ? brut.total_results : 0;
  if (!Array.isArray(brut?.results)) return { pros: [], total };
  const pros: Pro[] = [];
  for (const entreprise of brut.results as (Entreprise | null)[]) {
    if (!entreprise || typeof entreprise !== 'object' || !Array.isArray(entreprise.matching_etablissements)) continue;
    for (const etab of entreprise.matching_etablissements as (Etablissement | null)[]) {
      if (!etab || typeof etab !== 'object' || etab.etat_administratif !== 'A') continue;
      const siret = texte(etab.siret);
      const lat = Number(etab.latitude);
      const lon = Number(etab.longitude);
      const codePostal = texte(etab.code_postal);
      const metier = metierNaf(etab.activite_principale ?? entreprise.activite_principale);
      if (!siret || !metier || etab.latitude == null || etab.longitude == null) continue;
      if (!Number.isFinite(lat) || !Number.isFinite(lon) || !codePostal || !/^\d{5}$/.test(codePostal)) continue;
      const distance = distanceKm(depuis, { lat, lon });
      if (distance > rayonKm) continue;
      const annee = Number(texte(etab.date_creation)?.slice(0, 4));
      const adresse = texte(etab.adresse);
      const ville = texte(etab.libelle_commune);
      pros.push({
        id: `registre/${siret}`,
        source: 'registre',
        siret,
        nom: nomAffiche(entreprise, etab),
        metiers: [metier],
        telephone: null,
        lat,
        lon,
        distanceKm: distance,
        adresse: adresse ? casseTitre(adresse) : null,
        ville: ville ? casseTitre(ville) : null,
        anneeCreation: Number.isInteger(annee) && annee > 1800 ? annee : null,
      });
    }
  }
  return { pros, total };
}
```

Note : la réponse illisible `{ results: [null, …] }` a `total_results` absent → `total: 0` (attendu par le test).

- [ ] **Step 4 : lancer les tests**

Run: `npx jest src/fonctionnalites/pros/lib/registre.test.ts && npx tsc --noEmit`
Expected: PASS.

- [ ] **Step 5 : commit**

```bash
git add src/fonctionnalites/pros/lib/registre.ts src/fonctionnalites/pros/lib/registre.test.ts
git commit -m "Lit le registre des entreprises de l'État (plombiers et électriciens déclarés)

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 4 : fusion des trois sources

**Files:**
- Create: `src/fonctionnalites/pros/lib/fusion.ts`, `src/fonctionnalites/pros/lib/fusion.test.ts`

**Interfaces:**
- Consumes : `Pro`, `estJoignable` (`@/domaine/pro`), `distanceKm`, `normaliserNom` (`./nomPro`).
- Produces : `MAX_SANS_TELEPHONE = 30`, `fusionnerPros(sources: { osm: Pro[]; rge: Pro[]; registre: Pro[] }): Pro[]` — joignables triés par distance, puis les autres triés par distance (30 au plus).

- [ ] **Step 1 : écrire les tests qui échouent**

```ts
import type { Pro } from '@/domaine/pro';
import { fusionnerPros, MAX_SANS_TELEPHONE } from './fusion';

const pro = (extra: Partial<Pro>): Pro => ({
  id: 'x', nom: 'X', metiers: ['plombier'], telephone: null, lat: 43.3, lon: 5.4, distanceKm: 1, ...extra,
});

describe('fusionnerPros', () => {
  it('registre + RGE de même SIRET : un seul pro, celui du RGE', () => {
    const rge = pro({ id: 'rge/1', source: 'rge', siret: '1', nom: 'Souchon', telephone: '04', metiers: ['plombier'], rge: { qualification: 'q', organisme: 'qualibat', finValidite: '2030-01-01' } });
    const registre = pro({ id: 'registre/1', source: 'registre', siret: '1', nom: 'Gerard Souchon', metiers: ['electricien'], anneeCreation: 1990 });
    const fusion = fusionnerPros({ osm: [], rge: [rge], registre: [registre] });
    expect(fusion).toHaveLength(1);
    expect(fusion[0]).toMatchObject({ id: 'rge/1', source: 'rge', telephone: '04', metiers: ['plombier', 'electricien'], anneeCreation: 1990 });
  });

  it('OSM + autre source, même nom à moins de 150 m : un seul pro enrichi', () => {
    const osm = pro({ id: 'node/9', nom: 'Plomberie Durand', telephone: null, horaires: 'Mo-Fr 08:00-18:00', lat: 43.3, lon: 5.4 });
    const registre = pro({ id: 'registre/2', source: 'registre', siret: '2', nom: 'SARL PLOMBERIE DURAND', lat: 43.3005, lon: 5.4, anneeCreation: 2001 });
    const fusion = fusionnerPros({ osm: [osm], rge: [], registre: [registre] });
    expect(fusion).toHaveLength(1);
    expect(fusion[0]).toMatchObject({ id: 'node/9', source: 'osm', siret: '2', horaires: 'Mo-Fr 08:00-18:00', anneeCreation: 2001, nom: 'Plomberie Durand' });
  });

  it('OSM + RGE : téléphone OSM prioritaire, source RGE gardée', () => {
    const osm = pro({ id: 'node/1', nom: 'Élec 13', telephone: '06', metiers: ['electricien'] });
    const rge = pro({ id: 'rge/3', source: 'rge', siret: '3', nom: 'ELEC 13', telephone: '04', metiers: ['electricien'], rge: { qualification: 'q', organisme: 'qualifelec', finValidite: '2030-01-01' } });
    const [seul] = fusionnerPros({ osm: [osm], rge: [rge], registre: [] });
    expect(seul).toMatchObject({ source: 'rge', telephone: '06', siret: '3' });
    expect(seul.rge).not.toBeNull();
  });

  it('même nom mais trop loin : deux pros', () => {
    const osm = pro({ id: 'node/1', nom: 'Durand', lat: 43.3, lon: 5.4 });
    const registre = pro({ id: 'registre/4', source: 'registre', siret: '4', nom: 'DURAND', lat: 43.31, lon: 5.4 });
    expect(fusionnerPros({ osm: [osm], rge: [], registre: [registre] })).toHaveLength(2);
  });

  it('joignables d’abord, puis 30 sans téléphone au plus, chacun par distance', () => {
    const loinAppelable = pro({ id: 'node/1', nom: 'A', telephone: '04', distanceKm: 4 });
    const presAppelable = pro({ id: 'rge/1', source: 'rge', nom: 'B', telephone: '04', distanceKm: 2 });
    const registre = Array.from({ length: 35 }, (_, i) =>
      pro({ id: `registre/${i}`, source: 'registre', siret: String(i), nom: `R${i}`, distanceKm: 35 - i, lat: 43 + i / 10 }),
    );
    const fusion = fusionnerPros({ osm: [loinAppelable], rge: [presAppelable], registre });
    expect(fusion.slice(0, 2).map((p) => p.id)).toEqual(['rge/1', 'node/1']);
    const sans = fusion.slice(2);
    expect(sans).toHaveLength(MAX_SANS_TELEPHONE);
    expect(sans[0].distanceKm).toBe(1);
    expect(sans.every((p, i) => i === 0 || sans[i - 1].distanceKm <= p.distanceKm)).toBe(true);
  });
});
```

- [ ] **Step 2 : lancer, vérifier l'échec**

Run: `npx jest src/fonctionnalites/pros/lib/fusion.test.ts`
Expected: FAIL (module `./fusion` introuvable).

- [ ] **Step 3 : implémenter `src/fonctionnalites/pros/lib/fusion.ts`**

```ts
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
```

Note : `distanceKm(p, osm)` accepte un `Pro` car il a `lat`/`lon` (type `Position` structurel). Un pro déjà fusionné avec OSM a `source` `'osm'` ou `'rge'` : la condition `p.source !== 'osm'` empêche de fusionner deux fiches OSM entre elles ; un pro RGE déjà enrichi par OSM peut l'être une seconde fois (sans effet gênant).

- [ ] **Step 4 : lancer les tests**

Run: `npx jest src/fonctionnalites/pros/lib/fusion.test.ts && npx tsc --noEmit`
Expected: PASS.

- [ ] **Step 5 : commit**

```bash
git add src/fonctionnalites/pros/lib/fusion.ts src/fonctionnalites/pros/lib/fusion.test.ts
git commit -m "Fusionne les pros d'OpenStreetMap, du RGE et du registre sans doublon

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 5 : interrogation des nouvelles sources

**Files:**
- Create: `src/fonctionnalites/pros/api/lireJson.ts`, `src/fonctionnalites/pros/api/chercherRge.ts`, `src/fonctionnalites/pros/api/chercherRegistre.ts`, `src/fonctionnalites/pros/api/chercherRegistre.test.ts`, `src/fonctionnalites/pros/api/chercherRge.test.ts`

**Interfaces:**
- Consumes : `construireUrlRge`, `analyserRge` (Task 2) ; `construireUrlRegistre`, `analyserRegistre`, `rayonsEssai`, `CODES_NAF`, `CODES_NAF_2025`, `PAR_PAGE` (Task 3).
- Produces :
  - `class ErreurHttp extends Error { statut: number; corps: string }`
  - `lireJson(url: string, delaiMs: number): Promise<unknown>`
  - `chercherRge(position: Position, rayonKm: number, aujourdhui?: string): Promise<Pro[]>`
  - `chercherRegistre(position: Position, rayonKm: number): Promise<Pro[]>`
  - `SEUIL_REGISTRE = 30`

- [ ] **Step 1 : écrire les tests qui échouent**

`src/fonctionnalites/pros/api/chercherRegistre.test.ts` :

```ts
import { chercherRegistre } from './chercherRegistre';

const ici = { lat: 43.2965, lon: 5.3698 };
const etab = (siret: string) => ({
  siret, activite_principale: '43.22A', etat_administratif: 'A', latitude: '43.2966', longitude: '5.3699',
  code_postal: '13001', adresse: 'RUE', libelle_commune: 'MARSEILLE', date_creation: '2000-01-01',
});
const corps = (total: number, sirets: string[]) => ({
  total_results: total,
  results: sirets.map((s) => ({ nom_complet: `ARTISAN ${s}`, activite_principale: '43.22A', matching_etablissements: [etab(s)] })),
});
const reponseOk = (json: unknown) => ({ ok: true, status: 200, json: async () => json, text: async () => JSON.stringify(json) });
const reponse400 = (message: string) => ({ ok: false, status: 400, json: async () => ({ erreur: message }), text: async () => JSON.stringify({ erreur: message }) });

let appels: string[];
beforeEach(() => {
  appels = [];
  jest.useFakeTimers({ doNotFake: ['nextTick', 'setImmediate'] });
});
afterEach(() => {
  jest.useRealTimers();
  jest.restoreAllMocks();
});

function simuler(reponses: ((url: string) => unknown)[]) {
  global.fetch = jest.fn(async (url: string) => {
    appels.push(url);
    const suivante = reponses.shift();
    if (!suivante) throw new Error('appel inattendu');
    return suivante(url);
  }) as unknown as typeof fetch;
}

// Lecture d'un paramètre d'adresse sans dépendre de URL (incomplet dans l'environnement React Native de Jest).
const param = (url: string, cle: string) => decodeURIComponent(new RegExp(`[?&]${cle}=([^&]*)`).exec(url)?.[1] ?? '');

async function lancer<T>(promesse: Promise<T>): Promise<T> {
  promesse.catch(() => undefined); // évite un avertissement de rejet non géré pendant l'avance des minuteurs
  // Fait avancer les pauses entre requêtes.
  for (let i = 0; i < 20; i++) await jest.advanceTimersByTimeAsync(200);
  return promesse;
}

describe('chercherRegistre', () => {
  it('élargit le rayon tant qu’il y a moins de 30 entreprises', async () => {
    simuler([() => reponseOk(corps(3, ['1'])), () => reponseOk(corps(12, ['1', '2'])), () => reponseOk(corps(20, ['1', '2', '3']))]);
    const pros = await lancer(chercherRegistre(ici, 5));
    expect(appels.map((u) => param(u, 'radius'))).toEqual(['1', '2', '5']);
    expect(pros.map((p) => p.id).sort()).toEqual(['registre/1', 'registre/2', 'registre/3']);
  });

  it('s’arrête dès 30 entreprises et lit une deuxième page', async () => {
    simuler([() => reponseOk(corps(472, ['1', '2'])), () => reponseOk(corps(472, ['2', '3']))]);
    const pros = await lancer(chercherRegistre(ici, 10));
    expect(appels.map((u) => [param(u, 'radius'), param(u, 'page')])).toEqual([['1', '1'], ['1', '2']]);
    expect(pros.map((p) => p.id).sort()).toEqual(['registre/1', 'registre/2', 'registre/3']);
  });

  it('bascule sur les codes NAF 2025 si l’API refuse les anciens', async () => {
    simuler([
      () => reponse400('Au moins un paramètre `activite_principale` est non valide.'),
      () => reponseOk(corps(40, ['1'])),
      () => reponseOk(corps(40, ['2'])),
    ]);
    await lancer(chercherRegistre(ici, 5));
    expect(param(appels[0], 'activite_principale')).toBe('43.22A,43.21A');
    expect(param(appels[1], 'activite_principale')).toBe('43.22G,43.21G');
    expect(param(appels[2], 'activite_principale')).toBe('43.22G,43.21G');
  });

  it('une autre erreur 400 n’entraîne pas de bascule', async () => {
    simuler([() => reponse400('rayon non valide')]);
    await expect(lancer(chercherRegistre(ici, 5))).rejects.toMatchObject({ statut: 400 });
    expect(appels).toHaveLength(1);
  });
});
```

`src/fonctionnalites/pros/api/chercherRge.test.ts` :

```ts
import { chercherRge } from './chercherRge';

afterEach(() => jest.restoreAllMocks());

describe('chercherRge', () => {
  it('interroge l’annuaire et renvoie les pros analysés', async () => {
    global.fetch = jest.fn(async () => ({
      ok: true,
      status: 200,
      json: async () => ({
        results: [{
          siret: '1', nom_entreprise: 'ELEC 13', latitude: 43.3, longitude: 5.4, telephone: '04',
          nom_qualification: 'Efficacité énergétique - ECO Artisan - Électricien', organisme: 'qualibat', lien_date_fin: '2030-01-01',
        }],
      }),
    })) as unknown as typeof fetch;
    const pros = await chercherRge({ lat: 43.3, lon: 5.4 }, 10, '2026-10-09');
    expect(pros.map((p) => p.id)).toEqual(['rge/1']);
    expect((global.fetch as jest.Mock).mock.calls[0][0]).toContain('data.ademe.fr');
  });

  it('erreur HTTP : rejette avec le statut', async () => {
    global.fetch = jest.fn(async () => ({ ok: false, status: 503, text: async () => 'indisponible' })) as unknown as typeof fetch;
    await expect(chercherRge({ lat: 43.3, lon: 5.4 }, 10, '2026-10-09')).rejects.toMatchObject({ statut: 503 });
  });
});
```

- [ ] **Step 2 : lancer, vérifier l'échec**

Run: `npx jest src/fonctionnalites/pros/api`
Expected: FAIL (modules introuvables).

- [ ] **Step 3 : implémenter**

`src/fonctionnalites/pros/api/lireJson.ts` :

```ts
// Réponse HTTP en erreur : on garde le statut et le texte (utile pour reconnaître un code refusé).
export class ErreurHttp extends Error {
  statut: number;
  corps: string;

  constructor(statut: number, corps: string) {
    super(`Le service a répondu ${statut}`);
    this.name = 'ErreurHttp';
    this.statut = statut;
    this.corps = corps;
    Object.setPrototypeOf(this, ErreurHttp.prototype);
  }
}

/** GET d'une adresse avec un délai maximal ; rejette avec ErreurHttp si le statut n'est pas 2xx. */
export async function lireJson(url: string, delaiMs: number): Promise<unknown> {
  const controleur = new AbortController();
  const minuterie = setTimeout(() => controleur.abort(), delaiMs);
  try {
    const reponse = await fetch(url, { signal: controleur.signal });
    if (!reponse.ok) throw new ErreurHttp(reponse.status, await reponse.text().catch(() => ''));
    return await reponse.json();
  } finally {
    clearTimeout(minuterie);
  }
}
```

`src/fonctionnalites/pros/api/chercherRge.ts` :

```ts
import type { Position } from '@/domaine/lieux';
import type { Pro } from '@/domaine/pro';
import { analyserRge, construireUrlRge } from '../lib/rge';
import { lireJson } from './lireJson';

const DELAI_MS = 15000;

const aujourdhuiIso = () => new Date().toISOString().slice(0, 10);

export async function chercherRge(position: Position, rayonKm: number, aujourdhui: string = aujourdhuiIso()): Promise<Pro[]> {
  return analyserRge(await lireJson(construireUrlRge(position, rayonKm), DELAI_MS), position, aujourdhui);
}
```

`src/fonctionnalites/pros/api/chercherRegistre.ts` :

```ts
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
```

- [ ] **Step 4 : lancer les tests**

Run: `npx jest src/fonctionnalites/pros/api && npx tsc --noEmit`
Expected: PASS. Si les faux minuteurs bloquent un test (délai dépassé), vérifier que `lancer()` fait bien avancer les minuteurs ; ne pas augmenter le délai Jest.

- [ ] **Step 5 : commit**

```bash
git add src/fonctionnalites/pros/api
git commit -m "Interroge l'annuaire RGE et le registre (rayon progressif, codes NAF 2027)

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 6 : sources en parallèle, fusion et cache

**Files:**
- Create: `src/fonctionnalites/pros/api/chercherOsm.ts`, `src/fonctionnalites/pros/api/chercherPros.test.ts`
- Modify: `src/fonctionnalites/pros/api/chercherPros.ts`, `src/fonctionnalites/pros/lib/cachePros.ts`, `src/fonctionnalites/pros/lib/cachePros.test.ts`, `src/fonctionnalites/pros/hooks/usePros.ts`

**Interfaces:**
- Consumes : `chercherRge`, `chercherRegistre` (Task 5), `fusionnerPros` (Task 4), `EchecPros`, `classerEchec` (`../lib/echecPros`).
- Produces :
  - `chercherOsm(position: Position, rayonKm: number): Promise<Pro[]>` (code Overpass actuel, déplacé tel quel)
  - `chercherPros(position, rayonKm)` : même signature qu'aujourd'hui, renvoie la liste fusionnée
  - `VERSION_CACHE = 2` ; `CachePros` gagne `version?: number`

- [ ] **Step 1 : écrire les tests qui échouent**

`src/fonctionnalites/pros/api/chercherPros.test.ts` :

```ts
import type { Pro } from '@/domaine/pro';
import { EchecPros } from '../lib/echecPros';
import { chercherPros } from './chercherPros';
import { chercherOsm } from './chercherOsm';
import { chercherRegistre } from './chercherRegistre';
import { chercherRge } from './chercherRge';

jest.mock('./chercherOsm', () => ({ chercherOsm: jest.fn() }));
jest.mock('./chercherRge', () => ({ chercherRge: jest.fn() }));
jest.mock('./chercherRegistre', () => ({ chercherRegistre: jest.fn() }));

const osm = chercherOsm as jest.Mock;
const rge = chercherRge as jest.Mock;
const registre = chercherRegistre as jest.Mock;

const pro = (id: string, telephone: string | null, lat: number): Pro => ({
  id, nom: id, metiers: ['plombier'], telephone, lat, lon: 5.4, distanceKm: 0,
});

beforeEach(() => jest.resetAllMocks());

describe('chercherPros', () => {
  it('fusionne les trois sources', async () => {
    osm.mockResolvedValue([pro('node/1', '04', 43.301)]);
    rge.mockResolvedValue([{ ...pro('rge/1', '05', 43.302), source: 'rge', siret: '1' }]);
    registre.mockResolvedValue([{ ...pro('registre/2', null, 43.303), source: 'registre', siret: '2' }]);
    const pros = await chercherPros({ lat: 43.3, lon: 5.4 }, 10);
    expect(pros.map((p) => p.id)).toEqual(['node/1', 'rge/1', 'registre/2']);
  });

  it('une source en panne : les autres s’affichent', async () => {
    osm.mockRejectedValue(new EchecPros('indisponible'));
    rge.mockResolvedValue([]);
    registre.mockResolvedValue([{ ...pro('registre/2', null, 43.31), source: 'registre', siret: '2' }]);
    const pros = await chercherPros({ lat: 43.31, lon: 5.41 }, 10);
    expect(pros.map((p) => p.id)).toEqual(['registre/2']);
  });

  it('trois sources hors ligne : échec « hors-ligne »', async () => {
    osm.mockRejectedValue(new EchecPros('hors-ligne'));
    rge.mockRejectedValue(new TypeError('Network request failed'));
    registre.mockRejectedValue(new TypeError('Network request failed'));
    await expect(chercherPros({ lat: 43.32, lon: 5.42 }, 10)).rejects.toMatchObject({ raison: 'hors-ligne' });
  });

  it('trois échecs dont un serveur en erreur : échec « indisponible »', async () => {
    osm.mockRejectedValue(new EchecPros('hors-ligne'));
    rge.mockRejectedValue(new Error('Le service a répondu 503'));
    registre.mockRejectedValue(new TypeError('Network request failed'));
    await expect(chercherPros({ lat: 43.33, lon: 5.43 }, 10)).rejects.toMatchObject({ raison: 'indisponible' });
  });
});
```

Note : chaque test utilise une position différente pour ne pas réutiliser la requête en cours d'un test précédent (déduplication par clé).

Ajouter à `src/fonctionnalites/pros/lib/cachePros.test.ts` (en réutilisant l'import existant de `doitRafraichir`) :

```ts
describe('version du cache', () => {
  const centre = { lat: 43.3, lon: 5.4 };
  const maintenant = 1_000_000_000;
  it('un cache sans version (ancienne appli) doit être rafraîchi', () => {
    expect(doitRafraichir({ pros: [], centre, rayonKm: 10, date: maintenant }, centre, 10, maintenant)).toBe(true);
  });
  it('un cache en version 2 récent et proche reste valable', () => {
    expect(doitRafraichir({ pros: [], centre, rayonKm: 10, date: maintenant, version: 2 }, centre, 10, maintenant)).toBe(false);
  });
});
```

Vérifier les tests existants de `cachePros.test.ts` qui attendent `false` de `doitRafraichir` : leur ajouter `version: 2` dans l'objet cache.

- [ ] **Step 2 : lancer, vérifier l'échec**

Run: `npx jest src/fonctionnalites/pros`
Expected: FAIL (`./chercherOsm` introuvable, version du cache non gérée).

- [ ] **Step 3 : implémenter**

Créer `src/fonctionnalites/pros/api/chercherOsm.ts` en y **déplaçant** depuis `chercherPros.ts` : les imports nécessaires (`Platform`, `Position`, `Pro`, `analyserReponse`, `construireRequete`, `SERVEURS_OVERPASS`, `classerEchec`, `EchecPros`), les constantes `DELAI_PAR_SERVEUR_MS` et `BUDGET_TOTAL_MS`, la fonction `interrogerServeur` (inchangée) et la fonction `interroger`, renommée et exportée :

```ts
// Essaie chaque serveur Overpass à la suite et s'arrête au premier succès.
export async function chercherOsm(position: Position, rayonKm: number): Promise<Pro[]> {
  const debut = Date.now();
  const erreurs: unknown[] = [];
  for (const url of SERVEURS_OVERPASS) {
    const restant = BUDGET_TOTAL_MS - (Date.now() - debut);
    if (restant <= 0) break;
    try {
      return await interrogerServeur(url, position, rayonKm, Math.min(DELAI_PAR_SERVEUR_MS, restant));
    } catch (erreur) {
      erreurs.push(erreur);
    }
  }
  throw new EchecPros(classerEchec(erreurs));
}
```

Remplacer `src/fonctionnalites/pros/api/chercherPros.ts` par :

```ts
import type { Position } from '@/domaine/lieux';
import type { Pro } from '@/domaine/pro';
import { classerEchec, EchecPros, type RaisonEchec } from '../lib/echecPros';
import { fusionnerPros } from '../lib/fusion';
import { recalerPros } from '../lib/recalerPros';
import { chercherOsm } from './chercherOsm';
import { chercherRegistre } from './chercherRegistre';
import { chercherRge } from './chercherRge';

let enCours: { cle: string; promesse: Promise<Pro[]> } | null = null;

const raisonDeLEchec = (erreur: unknown): RaisonEchec => (erreur instanceof EchecPros ? erreur.raison : classerEchec([erreur]));

// Les trois sources en même temps : on affiche ce qui répond ; échec seulement si aucune ne répond.
async function interroger(position: Position, rayonKm: number): Promise<Pro[]> {
  const [osm, rge, registre] = await Promise.allSettled([
    chercherOsm(position, rayonKm),
    chercherRge(position, rayonKm),
    chercherRegistre(position, rayonKm),
  ]);
  const resultats = [osm, rge, registre];
  if (resultats.every((r) => r.status === 'rejected')) {
    const raisons = resultats.map((r) => raisonDeLEchec((r as PromiseRejectedResult).reason));
    throw new EchecPros(raisons.every((r) => r === 'hors-ligne') ? 'hors-ligne' : 'indisponible');
  }
  const valeur = (r: PromiseSettledResult<Pro[]>) => (r.status === 'fulfilled' ? r.value : []);
  return fusionnerPros({ osm: valeur(osm), rge: valeur(rge), registre: valeur(registre) });
}

const arrondir = (n: number) => Math.round(n * 1000) / 1000;

export function chercherPros(position: Position, rayonKm: number): Promise<Pro[]> {
  // Position arrondie à 3 décimales (~100 m) : moins précise pour les services, et clé de déduplication identique.
  const arrondie = { lat: arrondir(position.lat), lon: arrondir(position.lon) };
  const cle = `${arrondie.lat},${arrondie.lon},${rayonKm}`;
  let promesse: Promise<Pro[]>;
  if (enCours?.cle === cle) {
    promesse = enCours.promesse;
  } else {
    const nouvelle: Promise<Pro[]> = interroger(arrondie, rayonKm).finally(() => {
      if (enCours?.promesse === nouvelle) enCours = null;
    });
    enCours = { cle, promesse: nouvelle };
    promesse = nouvelle;
  }
  // Les requêtes fusionnées partagent le même résultat : chacun recale les distances depuis sa propre position.
  return promesse.then((pros) => recalerPros(pros, position, rayonKm));
}
```

Dans `src/fonctionnalites/pros/lib/cachePros.ts` :

```ts
export interface CachePros {
  pros: Pro[];
  centre: Position;
  rayonKm: number;
  date: number;
  // 2 = liste fusionnée (OSM + RGE + registre). Absent = ancienne appli (OSM seul).
  version?: number;
}

export const VERSION_CACHE = 2;
```

et en tête de `doitRafraichir`, juste après `if (!cache) return true;` :

```ts
  if (cache.version !== VERSION_CACHE) return true;
```

Dans `src/fonctionnalites/pros/hooks/usePros.ts`, importer `VERSION_CACHE` et écrire la version dans le nouveau cache :

```ts
const nouveau: CachePros = { pros: trouves, centre: ici, rayonKm, date: Date.now(), version: VERSION_CACHE };
```

Mettre à jour le commentaire de `EtatPros` : `// hors-ligne : pas de réseau ; indisponible : le réseau marche mais aucun service des pros ne répond.`

- [ ] **Step 4 : lancer les tests**

Run: `npx jest && npx tsc --noEmit && npx expo lint`
Expected: tout PASS, 0 erreur, 0 avertissement.

- [ ] **Step 5 : commit**

```bash
git add src/fonctionnalites/pros
git commit -m "Interroge les trois sources de pros en parallèle et enregistre la liste fusionnée

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 7 : badge RGE, cartes et fiches

**Files:**
- Create: `src/ui/ouvrirLien.ts`, `src/ui/BadgeRge.tsx`, `src/ui/BlocRge.tsx`
- Modify: `src/ui/CarteListe.tsx`, `src/ui/CartePro.tsx`, `src/ui/FichePro.tsx`

**Interfaces:**
- Consumes : `estJoignable`, `texteRge`, `LabelRge` (Task 1) ; `lienChercherNumero`, `lienFicheOfficielle` (Task 1) ; icône `building`.
- Produces : `ouvrirLien(url: string): void` ; `<BadgeRge />` ; `<BlocRge rge={LabelRge} />` ; `CarteListe` gagne `badge?: ReactNode` et `discret?: boolean` ; `CartePro` affiche badge, bouton d'appel ou loupe ; testIDs `bouton-chercher-numero`, `bouton-fiche-officielle`, `bloc-rge`.

Maquette : `docs/design/maquettes-v2/13-pros-enrichis.html`, écrans 1 (cartes), 2 (fiche RGE) et 3 (fiche registre).

- [ ] **Step 1 : `src/ui/ouvrirLien.ts` (déplacé de `FichePro.tsx`)**

```ts
import { Alert, Linking } from 'react-native';

/** Ouvre une adresse (web, mailto…) ; message clair si le téléphone ne sait pas l'ouvrir. */
export function ouvrirLien(url: string): void {
  Linking.openURL(url).catch(() => Alert.alert('Ouverture impossible', "Cette adresse ne peut pas s'ouvrir sur ton téléphone."));
}
```

Dans `FichePro.tsx`, supprimer la fonction locale `ouvrir` et utiliser `ouvrirLien` (import `./ouvrirLien`) ; retirer `Alert` et `Linking` de l'import `react-native` s'ils ne servent plus.

- [ ] **Step 2 : `src/ui/BadgeRge.tsx`**

```tsx
import { StyleSheet, Text } from 'react-native';
import { teinte } from '@/theme/teinte';
import { useTheme } from '@/theme/ThemeProvider';

/** Petit badge vert « RGE » (label reconnu par l'État). */
export function BadgeRge() {
  const { couleurs } = useTheme();
  return (
    <Text
      accessibilityLabel="Label RGE"
      style={[styles.badge, { color: couleurs.verdictVert, backgroundColor: teinte(couleurs.verdictVert, 0.14), borderColor: teinte(couleurs.verdictVert, 0.45) }]}
    >
      RGE
    </Text>
  );
}

const styles = StyleSheet.create({
  badge: { fontSize: 10, fontWeight: '800', borderWidth: 1, borderRadius: 5, paddingHorizontal: 4, overflow: 'hidden' },
});
```

- [ ] **Step 3 : `src/ui/BlocRge.tsx`**

```tsx
import { StyleSheet, Text, View } from 'react-native';
import { texteRge, type LabelRge } from '@/domaine/pro';
import { teinte } from '@/theme/teinte';
import { useTheme } from '@/theme/ThemeProvider';
import { BadgeRge } from './BadgeRge';

/** Encadré de la fiche d'un pro RGE : label, qualification, organisme et date de validité. */
export function BlocRge({ rge }: { rge: LabelRge }) {
  const { couleurs } = useTheme();
  return (
    <View testID="bloc-rge" style={[styles.bloc, { backgroundColor: teinte(couleurs.verdictVert, 0.08), borderColor: teinte(couleurs.verdictVert, 0.3) }]}>
      <View style={styles.titre}>
        <BadgeRge />
        <Text style={[styles.texteTitre, { color: couleurs.texte }]}>Label reconnu par l’État</Text>
      </View>
      <Text style={[styles.detail, { color: couleurs.texteDiscret }]}>{texteRge(rge)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  bloc: { borderWidth: 1, borderRadius: 12, padding: 10, gap: 4, marginBottom: 6 },
  titre: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  texteTitre: { fontSize: 13.5, fontWeight: '700' },
  detail: { fontSize: 12.5, lineHeight: 17 },
});
```

- [ ] **Step 4 : `CarteListe` — badge et variante discrète**

Dans `src/ui/CarteListe.tsx` : ajouter à `Props` `badge?: ReactNode;` (« Élément affiché devant le sous-titre, ex. badge RGE. ») et `discret?: boolean;` (« Carte plus effacée : pros sans téléphone. ») ; les ajouter à la déstructuration ; calculer le fond ainsi :

```tsx
  // Les cartes discrètes (pros sans téléphone) n'ont pas de fond : seule la bordure reste.
  const fond = danger ? teinte(couleurs.danger, 0.12) : discret ? 'transparent' : couleurs.carte;
```

et remplacer la ligne du sous-titre par :

```tsx
        {sousTitre || badge ? (
          <View style={styles.ligneSous}>
            {badge}
            {sousTitre ? <Text style={[styles.sousTitre, { color: couleurs.texteDiscret }]}>{sousTitre}</Text> : null}
          </View>
        ) : null}
```

avec le style `ligneSous: { flexDirection: 'row', alignItems: 'center', gap: 6 },`. (`teinte()` n'accepte que des couleurs `#rrggbb` ; `couleurs.carte` est en `rgba` dans le thème sombre, d'où `'transparent'`. Le mot-clé `'transparent'` n'est pas une couleur en dur au sens du test.)

- [ ] **Step 5 : `CartePro` — badge, appel ou loupe**

Remplacer le corps de `src/ui/CartePro.tsx` :

```tsx
// src/ui/CartePro.tsx
import { Pressable, StyleSheet } from 'react-native';
import { lienChercherNumero } from '@/domaine/liensPro';
import { estJoignable, sousTitrePro, type Metier, type Pro } from '@/domaine/pro';
import { teinte } from '@/theme/teinte';
import { useTheme } from '@/theme/ThemeProvider';
import { appeler } from './appeler';
import { BadgeRge } from './BadgeRge';
import { CarteListe } from './CarteListe';
import { Icone } from './Icone';
import { ouvrirLien } from './ouvrirLien';

interface Props {
  pro: Pro;
  onOuvrir?: (pro: Pro) => void;
  /** Métier mis en avant (icône et couleur) ; par défaut le premier métier du pro. */
  metier?: Metier;
}

export function CartePro({ pro, onOuvrir, metier: metierDemande }: Props) {
  const { couleurs } = useTheme();
  const metier = metierDemande ?? pro.metiers[0];
  const telephone = pro.telephone;
  const joignable = estJoignable(pro);
  return (
    <CarteListe
      icone={metier === 'plombier' ? 'wrench' : 'zap'}
      couleur={metier === 'plombier' ? couleurs.plomberie : couleurs.electricite}
      titre={pro.nom}
      testID={joignable ? 'carte-pro' : 'carte-pro-registre'}
      onPress={onOuvrir ? () => onOuvrir(pro) : undefined}
      sousTitre={sousTitrePro(pro)}
      badge={pro.rge ? <BadgeRge /> : undefined}
      discret={!joignable}
      droite={
        telephone ? (
          <Pressable
            onPress={() => appeler(telephone)}
            accessibilityRole="button"
            accessibilityLabel={`Appeler ${pro.nom}`}
            hitSlop={6}
            style={[styles.rond, { backgroundColor: teinte(couleurs.accent, 0.18) }]}
          >
            <Icone nom="phone" couleur={couleurs.accent} taille={16} />
          </Pressable>
        ) : (
          <Pressable
            onPress={() => ouvrirLien(lienChercherNumero(pro))}
            accessibilityRole="button"
            accessibilityLabel={`Chercher le numéro de ${pro.nom}`}
            hitSlop={6}
            style={[styles.rond, { borderWidth: 1, borderColor: teinte(couleurs.accent, 0.4) }]}
          >
            <Icone nom="search" couleur={couleurs.accent} taille={16} />
          </Pressable>
        )
      }
    />
  );
}

const styles = StyleSheet.create({
  rond: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
});
```

- [ ] **Step 6 : `FichePro` — encadré RGE, année, boutons et note selon la source**

Dans `src/ui/FichePro.tsx` :
1. Imports : `BlocRge` (`./BlocRge`), `ouvrirLien` (`./ouvrirLien`), `lienChercherNumero`, `lienFicheOfficielle` (`@/domaine/liensPro`).
2. `aDesInfos` inclut l'année : `Boolean(p && (p.adresse || p.horaires || p.siteWeb || p.email || p.anneeCreation))`.
3. Juste après le `View` d'en-tête (`styles.tete`), ajouter `{p.rge ? <BlocRge rge={p.rge} /> : null}`.
4. Après la ligne e-mail, ajouter `{p.anneeCreation ? <Ligne icone="building" texte={`Entreprise créée en ${p.anneeCreation}`} libelle="Date de création" /> : null}`.
5. Remplacer le bloc `boutons` et la note par :

```tsx
            <View style={styles.boutons}>
              {p.telephone ? (
                <BoutonPrincipal libelle="Appeler" icone="phone" accessibilityLabel={`Appeler ${p.nom}`} onPress={() => appeler(p.telephone!)} />
              ) : (
                <BoutonPrincipal
                  libelle="Chercher le numéro"
                  icone="search"
                  testID="bouton-chercher-numero"
                  accessibilityLabel={`Chercher le numéro de ${p.nom} sur le web`}
                  onPress={() => ouvrirLien(lienChercherNumero(p))}
                />
              )}
              {p.siret && !p.telephone ? (
                <BoutonPrincipal
                  libelle="Voir la fiche officielle"
                  icone="building"
                  variante="teinte"
                  testID="bouton-fiche-officielle"
                  accessibilityLabel={`Voir la fiche officielle de ${p.nom}`}
                  onPress={() => ouvrirLien(lienFicheOfficielle(p.siret!))}
                />
              ) : (
                <BoutonPrincipal
                  libelle="Voir les avis sur le web"
                  icone="search"
                  variante="teinte"
                  accessibilityLabel={`Voir les avis sur ${p.nom} sur le web`}
                  onPress={() => ouvrirLien(lienAvis(p))}
                />
              )}
            </View>
            <Text style={[styles.note, { color: couleurs.texteDiscret }]}>{NOTES[p.source ?? 'osm']}</Text>
```

et, au-dessus du composant :

```tsx
const NOTES: Record<SourcePro, string> = {
  osm: 'Infos OpenStreetMap, parfois incomplètes. Les avis s’ouvrent dans ton navigateur.',
  rge: 'Infos de l’annuaire RGE de l’ADEME.',
  registre: 'Artisan déclaré au registre des entreprises (INSEE). Son numéro n’est pas public : la recherche s’ouvre dans ton navigateur.',
};
```

(importer `SourcePro` depuis `@/domaine/pro`). Les textes de la note OSM gardent le sens actuel.

- [ ] **Step 7 : vérifier**

Run: `npx tsc --noEmit && npx expo lint && npx jest`
Expected: tout vert (dont le test « aucune couleur en dur »). `FichePro.tsx` doit rester sous ~200 lignes.

- [ ] **Step 8 : commit**

```bash
git add src/ui
git commit -m "Affiche le badge RGE et les fiches des artisans du registre

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 8 : onglet Pros en deux sections, carte, accueil et résultats

**Files:**
- Create: `src/fonctionnalites/pros/components/ListePros.tsx`
- Modify: `src/fonctionnalites/pros/components/Marqueurs.tsx`, `src/fonctionnalites/pros/components/CartePros.native.tsx`, `src/fonctionnalites/pros/EcranPros.tsx`, `src/fonctionnalites/accueil/EcranAccueil.tsx`, `src/fonctionnalites/accueil/components/SectionPros.tsx`, `src/fonctionnalites/diagnostic/components/CarteResultat.tsx`

**Interfaces:**
- Consumes : `estJoignable`, `lienGoogleMaps` (Task 1), `CartePro` (Task 7), `ouvrirLien` (Task 7).
- Produces : `<ListePros pros={Pro[]} filtre={Metier | 'tous'} onOuvrir={(pro) => void} />` ; `<PointPro />` ; testIDs `section-joignables`, `section-registre`, `bouton-google-maps`.

Maquette : écran 1 de `docs/design/maquettes-v2/13-pros-enrichis.html`.

- [ ] **Step 1 : `PointPro` dans `Marqueurs.tsx`**

```tsx
/** Pro sans téléphone (registre) : petit point gris, plus discret que l'épingle. */
export function PointPro() {
  const { couleurs } = useTheme();
  return <View style={[styles.pointPro, { backgroundColor: couleurs.texteDiscret, borderColor: couleurs.fond }]} />;
}
```

style : `pointPro: { width: 12, height: 12, borderRadius: 6, borderWidth: 2 },`.

- [ ] **Step 2 : `CartePros.native.tsx` — joignables d'abord, point gris pour les autres**

Importer `estJoignable` (`@/domaine/pro`) et `PointPro`. Avant le `return` principal :

```tsx
  // Les pros appelables passent en premier : ce sont eux qu'on garde si la limite d'épingles est atteinte.
  const ordonnes = [...pros.filter(estJoignable), ...pros.filter((p) => !estJoignable(p))];
```

Remplacer `pros.slice(0, MAX_EPINGLES).map(...)` par `ordonnes.slice(0, MAX_EPINGLES).map(...)`, avec `anchor={estJoignable(pro) ? 'bottom' : 'center'}` sur `ViewAnnotation` et `{estJoignable(pro) ? <EpinglePro metier={pro.metiers[0]} /> : <PointPro />}` dans le `Pressable`.

- [ ] **Step 3 : `src/fonctionnalites/pros/components/ListePros.tsx`**

```tsx
import { StyleSheet, Text, View } from 'react-native';
import { estJoignable, type Metier, type Pro } from '@/domaine/pro';
import { useTheme } from '@/theme/ThemeProvider';
import { CartePro } from '@/ui/CartePro';

interface Props {
  pros: Pro[];
  filtre: Metier | 'tous';
  onOuvrir: (pro: Pro) => void;
}

/** Deux sections : les pros qu'on peut appeler, puis les artisans du registre (numéro à chercher). */
export function ListePros({ pros, filtre, onOuvrir }: Props) {
  const { couleurs } = useTheme();
  const joignables = pros.filter(estJoignable);
  const autres = pros.filter((p) => !estJoignable(p));
  const metier = filtre === 'tous' ? undefined : filtre;
  const titre = { color: couleurs.texteDiscret };
  return (
    <>
      {joignables.length > 0 ? (
        <View style={styles.section}>
          <Text testID="section-joignables" style={[styles.titre, titre]}>Joignables tout de suite</Text>
          {joignables.map((pro) => (
            <CartePro key={pro.id} pro={pro} metier={metier} onOuvrir={onOuvrir} />
          ))}
        </View>
      ) : null}
      {autres.length > 0 ? (
        <View style={styles.section}>
          <Text testID="section-registre" style={[styles.titre, titre]}>
            Autres artisans déclarés <Text style={styles.aide}>· numéro à chercher</Text>
          </Text>
          {autres.map((pro) => (
            <CartePro key={pro.id} pro={pro} metier={metier} onOuvrir={onOuvrir} />
          ))}
        </View>
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  section: { gap: 8 },
  titre: { fontSize: 11.5, textTransform: 'uppercase', letterSpacing: 0.6, marginTop: 4 },
  aide: { textTransform: 'none', letterSpacing: 0 },
});
```

- [ ] **Step 4 : `EcranPros.tsx`**

1. Importer `ListePros`, `BoutonPrincipal` (`@/ui/BoutonPrincipal`), `lienGoogleMaps` (`@/domaine/liensPro`), `ouvrirLien` (`@/ui/ouvrirLien`) ; retirer l'import de `CartePro` s'il ne sert plus.
2. Remplacer `{liste.map((pro) => (<CartePro … />))}` par `<ListePros pros={liste} filtre={filtre} onOuvrir={setProOuvert} />`.
3. Message « aucun pro » : `Aucun pro trouvé dans un rayon de {reglages.rayonKm} km.` (sans la phrase sur OpenStreetMap).
4. Crédits : `Données © OpenStreetMap · ADEME · INSEE (Sirene) · mis à jour {age}`.
5. Juste avant les crédits, quand une position est connue :

```tsx
          {position ? (
            <BoutonPrincipal
              libelle="Voir plus sur Google Maps"
              icone="map-pin"
              variante="discret"
              testID="bouton-google-maps"
              accessibilityLabel="Voir plus de pros sur Google Maps"
              onPress={() => ouvrirLien(lienGoogleMaps(position, filtre))}
            />
          ) : null}
```

- [ ] **Step 5 : accueil et résultats — joignables seulement**

`src/fonctionnalites/accueil/EcranAccueil.tsx` : importer `estJoignable` et `useMemo` ; après `usePros` :

```tsx
  // L'accueil sert à appeler vite : seulement les pros avec un téléphone.
  const joignables = useMemo(() => pros.filter(estJoignable), [pros]);
```

et passer `joignables` à la place de `pros` à `CartePros`, à `PanneauAccueil` (`nombrePros={joignables.length}`) et à `SectionPros`.

`src/fonctionnalites/accueil/components/SectionPros.tsx` : remplacer le texte `"Les données viennent d'OpenStreetMap et peuvent être incomplètes."` par `"L'onglet Pros montre aussi les artisans sans numéro."`.

`src/fonctionnalites/diagnostic/components/CarteResultat.tsx` : importer `estJoignable` et remplacer `filtrerPros(pros, metier)` par `filtrerPros(pros.filter(estJoignable), metier)`.

- [ ] **Step 6 : vérifier**

Run: `npx tsc --noEmit && npx expo lint && npx jest`
Expected: tout vert. `EcranPros.tsx` sous ~200 lignes.

- [ ] **Step 7 : commit**

```bash
git add src/fonctionnalites
git commit -m "Sépare les pros joignables et les artisans du registre dans l'onglet Pros

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 9 : scénario Maestro, documentation, essai sur le téléphone

**Files:**
- Create: `e2e/pros.yaml`
- Modify: `CLAUDE.md`, `docs/build-android.md`

- [ ] **Step 1 : `e2e/pros.yaml`**

```yaml
appId: fr.depanneo.app
---
# Onglet Pros avec la ville par défaut (localisation refusée) : sections et fiche d'un artisan du registre.
- launchApp:
    clearState: true
- runFlow: sous-flux/premier-lancement.yaml
- tapOn:
    id: "onglet-pros"
- tapOn: "Ta ville ou ton code postal"
- inputText: "Marseille"
- extendedWaitUntil:
    visible: "Marseille \\(.*\\)"
    timeout: 10000
- tapOn: "Marseille \\(.*\\)"
- extendedWaitUntil:
    visible:
      id: "section-registre"
    timeout: 60000
- assertVisible:
    id: "section-joignables"
- scrollUntilVisible:
    element:
      id: "carte-pro-registre"
    direction: DOWN
- tapOn:
    id: "carte-pro-registre"
- assertVisible:
    id: "bouton-chercher-numero"
- assertVisible:
    id: "bouton-fiche-officielle"
```

- [ ] **Step 2 : documentation**

`CLAUDE.md`, ligne « Carte des pros » : remplacer par
`- **Carte des pros** : plombiers et électriciens proches, depuis OpenStreetMap, l'annuaire RGE de l'ADEME (badge RGE) et le registre des entreprises de l'État (artisans sans numéro : « Chercher le numéro »). Appel en 1 appui pour les pros joignables.`
et, dans « Stack technique », `Pros : Overpass (OpenStreetMap).` par `Pros : Overpass (OpenStreetMap), annuaire RGE (data.ademe.fr), API Recherche d'entreprises (recherche-entreprises.api.gouv.fr).`

`docs/build-android.md`, section Maestro : ajouter `pros.yaml` à la liste des scénarios, avec la mention « nécessite le réseau ; peut prendre jusqu'à une minute ».

- [ ] **Step 3 : vérifications complètes**

Run: `npx tsc --noEmit && npx expo lint && npx jest`
Expected: tout vert.

- [ ] **Step 4 : version de production sur le téléphone (contrôleur, pas un sous-agent)**

Suivre `docs/build-android.md` : `CI=1 npx expo prebuild --platform android --no-install`, recréer `android/local.properties` (`sdk.dir=C:/Users/andre/AppData/Local/Android/Sdk`), `cd android && ./gradlew.bat assembleRelease`, vérifier le paquet (`unzip -p app/build/outputs/apk/release/app-release.apk assets/index.android.bundle | grep -a -c "recherche-entreprises.api.gouv.fr"` ≥ 1), installer avec `adb install -r`, puis `maestro test e2e/` (téléphone déverrouillé, 8/8 attendus).

- [ ] **Step 5 : commit**

```bash
git add e2e/pros.yaml CLAUDE.md docs/build-android.md
git commit -m "Ajoute le scénario Maestro des pros et met à jour la documentation

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```
