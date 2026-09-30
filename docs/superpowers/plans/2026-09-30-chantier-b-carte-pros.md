# Chantier B — Carte et pros — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remplacer la carte factice par une vraie carte (MapLibre + OpenFreeMap) avec la position de l'utilisateur, les plombiers et électriciens proches (OpenStreetMap / Overpass) appelables en 1 appui, un cache hors-ligne et une recherche par ville quand la localisation est refusée.

**Architecture:** La logique pure (distance, requête et lecture Overpass, cache, géocodage, réglage « ville par défaut ») est dans des fichiers `lib/` testés. Deux hooks (`usePosition`, `usePros`) portent l'état ; ils sont dans la fonctionnalité `pros` et réutilisés par l'accueil, l'écran Pros et le résultat de diagnostic. La carte native (`CartePros.native.tsx`, MapLibre) a un double web (`CartePros.tsx`, fond factice) pour que la prévisualisation web continue de fonctionner.

**Tech Stack:** Expo SDK 57, React Native 0.86, Expo Router, TypeScript strict, Jest ; `@maplibre/maplibre-react-native` 11.4, `expo-location` ~57.0.x ; services Overpass (`https://overpass-api.de/api/interpreter`), OpenFreeMap (`https://tiles.openfreemap.org/styles/dark` et `/positron`), géocodage Géoplateforme (`https://data.geopf.fr/geocodage/search`).

**Spec:** [docs/superpowers/specs/2026-09-30-depannmaison-v2-design.md](../specs/2026-09-30-depannmaison-v2-design.md) §5 et §7 — maquettes validées : [1-accueil](../../design/maquettes-v2/1-accueil.html), [2-parcours-diagnostic](../../design/maquettes-v2/2-parcours-diagnostic.html) (résultat « Si tu préfères un pro »), [3-autres-ecrans](../../design/maquettes-v2/3-autres-ecrans.html) (écran Pros, Réglages), [5-carte-etats](../../design/maquettes-v2/5-carte-etats.html) (hors connexion, localisation refusée, aucun pro).

## Global Constraints

- Tout en français : textes, noms métier, commits (simples ; ligne `Co-Authored-By:` du modèle qui écrit).
- Les maquettes font foi pour le visuel. Aucune couleur en dur hors de `src/theme/` (le test `src/theme/couleursEnDur.test.ts` doit rester vert).
- `app/` : routes minces uniquement. Composant 80–150 lignes (plafond ~250), écran 150–250 (~350), hook/lib 100–200 (~300). `lib/` pur et testé, tests à côté du fichier. Imports via `@/`.
- Dépendances autorisées pour ce chantier : `@maplibre/maplibre-react-native`, `expo-location` (installées avec `npx expo install`). Aucune autre.
- Aucun test ne fait d'appel réseau (seules les fonctions pures sont testées).
- La position de l'utilisateur ne sort du téléphone que dans la requête de recherche des pros. Permission « pendant l'utilisation » uniquement.
- Overpass exige un identifiant d'appli : en natif, envoyer l'en-tête `User-Agent: DepannMaison/2.0` (pas sur le web, où le navigateur l'interdit). Aucune donnée personnelle dans cet en-tête.
- Crédit carte obligatoire et visible : « © OpenFreeMap · OpenStreetMap ».
- Règles de sécurité CLAUDE.md inchangées ; sur un verdict rouge, le numéro d'urgence éventuel passe avant les pros.
- Vérification : `npm test`, puis types des routes régénérés avec `rm -f .expo/types/router.d.ts && timeout 60 npx expo start --web --port 8099`, puis `npx tsc --noEmit` (0 erreur). **Ne jamais utiliser `npx expo export` pour préparer `tsc`.** Aucun processus Expo laissé actif.
- Ne jamais committer `dist-check/`, `.expo/`, `node_modules/`, `.superpowers/`, `/android`, `/ios`.

### Décisions de ce plan

- Hors connexion = la dernière recherche de pros a échoué (pas de dépendance réseau supplémentaire). Dans ce cas la carte native est remplacée par le fond neutre.
- `usePosition` et `usePros` n'utilisent pas de nouveau contexte global : une mémoire au niveau du module évite les doubles requêtes (spec §12 : 2 contextes seulement).
- `RechercheVille`, `usePosition`, `usePros` appartiennent à la fonctionnalité `pros` et sont importés par l'accueil, le diagnostic et les réglages (la fonctionnalité `pros` fournit ces briques).
- Sur un verdict rouge : numéro d'urgence (s'il existe), puis les pros du bon métier, puis le geste.
- Identifiant d'appli natif : `fr.depannmaison.app` (Android `package` et iOS `bundleIdentifier`).
- Expo Go ne peut plus lancer l'appli (MapLibre = code natif) : André passe par un build de développement (doc ajoutée à la tâche 6).

---

## File Structure

```
src/domaine/
  lieux.ts                   Position, Lieu, libelleLieu()
  pro.ts                     Metier, Pro, LIBELLES_METIER, metierDeCategorie()
  distance.ts (+ test)       distanceKm(), formaterDistance()
src/fonctionnalites/pros/
  lib/overpass.ts (+ test)   URL_OVERPASS, construireRequete(), analyserReponse()
  lib/filtrerPros.ts (+test) filtrerPros()
  lib/cachePros.ts (+ test)  CachePros, doitRafraichir(), lireCache(), ecrireCache(), ageTexte()
  lib/geocodage.ts (+ test)  construireUrlGeocodage(), analyserGeocodage()
  api/chercherPros.ts        fetch Overpass (délai 30 s, requêtes identiques fusionnées)
  api/chercherVille.ts       fetch géocodage
  hooks/usePosition.ts       GPS / ville par défaut / aucune
  hooks/usePros.ts           cache + recherche + hors connexion
  components/FondCarte.tsx   (déplacé depuis accueil) + variante neutre
  components/Marqueurs.tsx   PointPosition, EpinglePro
  components/carteTypes.ts   PropsCartePros
  components/CartePros.native.tsx   MapLibre
  components/CartePros.tsx          web : fond factice
  components/RechercheVille.tsx
  EcranPros.tsx              (réécrit)
src/ui/
  CartePro.tsx               ligne d'un pro avec bouton d'appel
  BandeauHorsLigne.tsx
src/fonctionnalites/accueil/
  EcranAccueil.tsx           (réécrit)
  components/PanneauAccueil.tsx     (accepte des enfants)
  components/SectionPros.tsx        états de la maquette 5
  components/BoutonRecentrer.tsx
src/fonctionnalites/diagnostic/components/CarteResultat.tsx   (pros du bon métier)
src/fonctionnalites/diagnostic/EcranDiagnostic.tsx            (passe le métier)
src/fonctionnalites/reglages/lib/reglages.ts (+ test)         villeParDefaut: Lieu | null
src/fonctionnalites/reglages/EcranReglages.tsx                ligne « Ville par défaut »
app.json, docs/build-android.md, CLAUDE.md
```

---

### Task 1: Domaine — lieux, pros et distance

**Files:**
- Create: `src/domaine/lieux.ts`, `src/domaine/pro.ts`, `src/domaine/distance.ts`, `src/domaine/distance.test.ts`, `src/domaine/pro.test.ts`

**Interfaces:**
- Consumes: `Categorie` (`@/domaine/types`).
- Produces:
  - `interface Position { lat: number; lon: number }`, `interface Lieu { nom: string; codePostal: string; position: Position }`, `libelleLieu(l: Lieu): string`
  - `type Metier = 'plombier' | 'electricien'`, `interface Pro { id: string; nom: string; metiers: Metier[]; telephone: string | null; lat: number; lon: number; distanceKm: number }`, `LIBELLES_METIER: Record<Metier, string>`, `metierDeCategorie(c: Categorie): Metier`
  - `distanceKm(a: Position, b: Position): number`, `formaterDistance(km: number): string`

- [ ] **Step 1: Tests (failing)**

```typescript
// src/domaine/distance.test.ts
import { distanceKm, formaterDistance } from './distance';

describe('distance', () => {
  it('vaut 0 pour le même point', () => {
    expect(distanceKm({ lat: 43.3, lon: 5.4 }, { lat: 43.3, lon: 5.4 })).toBe(0);
  });

  it('calcule Paris–Marseille (environ 661 km)', () => {
    const km = distanceKm({ lat: 48.8566, lon: 2.3522 }, { lat: 43.2965, lon: 5.3698 });
    expect(Math.abs(km - 661)).toBeLessThan(5);
  });

  it('affiche les distances courtes en mètres arrondis à 10 m', () => {
    expect(formaterDistance(0.8)).toBe('800 m');
    expect(formaterDistance(0.834)).toBe('830 m');
  });

  it('affiche les distances longues en km avec une virgule', () => {
    expect(formaterDistance(1.23)).toBe('1,2 km');
    expect(formaterDistance(12)).toBe('12 km');
  });
});
```

```typescript
// src/domaine/pro.test.ts
import { libelleLieu } from './lieux';
import { metierDeCategorie } from './pro';

describe('pro et lieux', () => {
  it('déduit le métier de la catégorie de panne', () => {
    expect(metierDeCategorie('plomberie')).toBe('plombier');
    expect(metierDeCategorie('electricite')).toBe('electricien');
  });

  it('affiche un lieu avec son code postal', () => {
    expect(libelleLieu({ nom: 'Marseille', codePostal: '13013', position: { lat: 0, lon: 0 } })).toBe('Marseille (13013)');
    expect(libelleLieu({ nom: 'Lyon', codePostal: '', position: { lat: 0, lon: 0 } })).toBe('Lyon');
  });
});
```

Run: `npx jest src/domaine/distance.test.ts src/domaine/pro.test.ts` → FAIL (modules introuvables).

- [ ] **Step 2: Implémenter**

```typescript
// src/domaine/lieux.ts
export interface Position {
  lat: number;
  lon: number;
}

export interface Lieu {
  nom: string;
  codePostal: string;
  position: Position;
}

export function libelleLieu(lieu: Lieu): string {
  return lieu.codePostal ? `${lieu.nom} (${lieu.codePostal})` : lieu.nom;
}
```

```typescript
// src/domaine/pro.ts
import type { Categorie } from './types';

export type Metier = 'plombier' | 'electricien';

export interface Pro {
  id: string;
  nom: string;
  metiers: Metier[];
  telephone: string | null;
  lat: number;
  lon: number;
  distanceKm: number;
}

export const LIBELLES_METIER: Record<Metier, string> = {
  plombier: 'Plombier',
  electricien: 'Électricien',
};

export function metierDeCategorie(categorie: Categorie): Metier {
  return categorie === 'plomberie' ? 'plombier' : 'electricien';
}
```

```typescript
// src/domaine/distance.ts
import type { Position } from './lieux';

const RAYON_TERRE_KM = 6371;
const radians = (degres: number) => (degres * Math.PI) / 180;

export function distanceKm(a: Position, b: Position): number {
  const dLat = radians(b.lat - a.lat);
  const dLon = radians(b.lon - a.lon);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(radians(a.lat)) * Math.cos(radians(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 2 * RAYON_TERRE_KM * Math.asin(Math.sqrt(h));
}

export function formaterDistance(km: number): string {
  if (km < 1) return `${Math.round((km * 1000) / 10) * 10} m`;
  return `${String(Math.round(km * 10) / 10).replace('.', ',')} km`;
}
```

- [ ] **Step 3: Vérifier et committer**

Run: `npx jest src/domaine` → PASS ; `npm test` → vert.

```bash
git add src/domaine/lieux.ts src/domaine/pro.ts src/domaine/distance.ts src/domaine/distance.test.ts src/domaine/pro.test.ts
git commit -m "Ajoute les types des pros et le calcul de distance"
```

---

### Task 2: Réglages — la ville par défaut devient un lieu

**Files:**
- Modify: `src/fonctionnalites/reglages/lib/reglages.ts`, `src/fonctionnalites/reglages/lib/reglages.test.ts`

**Interfaces:**
- Consumes: `Lieu` (`@/domaine/lieux`).
- Produces: `Reglages.villeParDefaut: Lieu | null` (au lieu de `string | null`) ; `lireReglages` n'accepte qu'un objet `{ nom: string; codePostal: string; position: { lat: number; lon: number } }`.

- [ ] **Step 1: Tests (failing)**

Dans `reglages.test.ts`, remplacer le test « relit exactement ce qui a été écrit » par :

```typescript
  it('relit exactement ce qui a été écrit', () => {
    const r = {
      theme: 'auto' as const,
      rayonKm: 20 as const,
      localisation: false,
      villeParDefaut: { nom: 'Marseille', codePostal: '13013', position: { lat: 43.34, lon: 5.43 } },
    };
    expect(lireReglages(ecrireReglages(r))).toEqual(r);
  });

  it('ignore une ville par défaut mal formée', () => {
    const lu = lireReglages(JSON.stringify({ villeParDefaut: { nom: 'Marseille', position: { lat: 'x', lon: 5 } } }));
    expect(lu.villeParDefaut).toBeNull();
  });
```

Run: `npx jest src/fonctionnalites/reglages` → FAIL.

- [ ] **Step 2: Implémenter**

Dans `reglages.ts` : `import type { Lieu } from '@/domaine/lieux';`, type `villeParDefaut: Lieu | null;`, ajouter la fonction ci-dessous et remplacer la lecture de `villeParDefaut` dans `lireReglages` par `villeParDefaut: lireLieu(donnees.villeParDefaut),` :

```typescript
function lireLieu(valeur: unknown): Lieu | null {
  if (typeof valeur !== 'object' || valeur === null) return null;
  const v = valeur as { nom?: unknown; codePostal?: unknown; position?: { lat?: unknown; lon?: unknown } };
  const lat = v.position?.lat;
  const lon = v.position?.lon;
  if (typeof v.nom !== 'string' || typeof lat !== 'number' || typeof lon !== 'number') return null;
  return { nom: v.nom, codePostal: typeof v.codePostal === 'string' ? v.codePostal : '', position: { lat, lon } };
}
```

- [ ] **Step 3: Vérifier et committer**

Run: `npx jest src/fonctionnalites/reglages` → PASS ; `npm test` ; types régénérés puis `npx tsc --noEmit` → 0 erreur.

```bash
git add src/fonctionnalites/reglages/lib
git commit -m "Enregistre la ville par défaut avec sa position"
```

---

### Task 3: Recherche des pros sur OpenStreetMap (Overpass)

**Files:**
- Create: `src/fonctionnalites/pros/lib/overpass.ts`, `src/fonctionnalites/pros/lib/overpass.test.ts`, `src/fonctionnalites/pros/lib/filtrerPros.ts`, `src/fonctionnalites/pros/lib/filtrerPros.test.ts`, `src/fonctionnalites/pros/api/chercherPros.ts`

**Interfaces:**
- Consumes: `Position`, `Pro`, `Metier`, `distanceKm`.
- Produces: `URL_OVERPASS`, `construireRequete(p: Position, rayonKm: number): string`, `analyserReponse(donnees: unknown, depuis: Position): Pro[]` (triés par distance) ; `filtrerPros(pros: Pro[], filtre: Metier | 'tous'): Pro[]` ; `chercherPros(p: Position, rayonKm: number): Promise<Pro[]>`.

- [ ] **Step 1: Tests (failing)**

```typescript
// src/fonctionnalites/pros/lib/overpass.test.ts
import { analyserReponse, construireRequete } from './overpass';

const depuis = { lat: 43.3, lon: 5.4 };

describe('overpass', () => {
  it('construit une requête plombiers + électriciens dans le rayon (en mètres)', () => {
    const requete = construireRequete(depuis, 10);
    expect(requete).toContain('nwr["craft"="plumber"](around:10000,43.3,5.4)');
    expect(requete).toContain('nwr["craft"="electrician"](around:10000,43.3,5.4)');
    expect(requete).toContain('out center tags');
  });

  it('lit les points, les bâtiments (center) et les téléphones', () => {
    const pros = analyserReponse(
      {
        elements: [
          { type: 'node', id: 1, lat: 43.31, lon: 5.4, tags: { craft: 'plumber', name: 'Plomberie Martin', phone: '+33 4 91 00 00 00' } },
          { type: 'way', id: 2, center: { lat: 43.301, lon: 5.4 }, tags: { craft: 'electrician', name: 'Élec 13', 'contact:phone': '04 91 11 11 11;06 00 00 00 00' } },
        ],
      },
      depuis,
    );
    expect(pros.map((p) => p.id)).toEqual(['way/2', 'node/1']);
    expect(pros[0].telephone).toBe('04 91 11 11 11');
    expect(pros[0].metiers).toEqual(['electricien']);
    expect(pros[1].telephone).toBe('+33 4 91 00 00 00');
  });

  it('reconnaît plusieurs métiers (craft_1)', () => {
    const [pro] = analyserReponse(
      { elements: [{ type: 'node', id: 3, lat: 43.3, lon: 5.4, tags: { craft: 'plumber', craft_1: 'electrician', name: 'Multi' } }] },
      depuis,
    );
    expect(pro.metiers).toEqual(['plombier', 'electricien']);
  });

  it('ignore les entrées sans nom ni téléphone, ou sans métier connu', () => {
    const pros = analyserReponse(
      {
        elements: [
          { type: 'node', id: 4, lat: 43.3, lon: 5.4, tags: { craft: 'plumber' } },
          { type: 'node', id: 5, lat: 43.3, lon: 5.4, tags: { craft: 'carpenter', name: 'Menuisier' } },
          { type: 'node', id: 6, lat: 43.3, lon: 5.4, tags: { craft: 'plumber', phone: '0600000000' } },
        ],
      },
      depuis,
    );
    expect(pros.map((p) => p.id)).toEqual(['node/6']);
    expect(pros[0].nom).toBe('Plombier');
  });

  it('renvoie une liste vide si la réponse est invalide', () => {
    expect(analyserReponse(null, depuis)).toEqual([]);
    expect(analyserReponse({ elements: 'x' }, depuis)).toEqual([]);
  });
});
```

```typescript
// src/fonctionnalites/pros/lib/filtrerPros.test.ts
import type { Pro } from '@/domaine/pro';
import { filtrerPros } from './filtrerPros';

const pro = (id: string, metiers: Pro['metiers']): Pro => ({ id, nom: id, metiers, telephone: null, lat: 0, lon: 0, distanceKm: 0 });
const liste = [pro('a', ['plombier']), pro('b', ['electricien']), pro('c', ['plombier', 'electricien'])];

describe('filtrerPros', () => {
  it('garde tout pour « tous »', () => {
    expect(filtrerPros(liste, 'tous').map((p) => p.id)).toEqual(['a', 'b', 'c']);
  });
  it('filtre par métier', () => {
    expect(filtrerPros(liste, 'plombier').map((p) => p.id)).toEqual(['a', 'c']);
    expect(filtrerPros(liste, 'electricien').map((p) => p.id)).toEqual(['b', 'c']);
  });
});
```

Run: `npx jest src/fonctionnalites/pros` → FAIL.

- [ ] **Step 2: Implémenter la logique pure**

```typescript
// src/fonctionnalites/pros/lib/overpass.ts
import { distanceKm } from '@/domaine/distance';
import type { Position } from '@/domaine/lieux';
import type { Metier, Pro } from '@/domaine/pro';

export const URL_OVERPASS = 'https://overpass-api.de/api/interpreter';

const METIERS: Record<string, Metier> = { plumber: 'plombier', electrician: 'electricien' };

interface ElementOverpass {
  type: string;
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
}

export function construireRequete(p: Position, rayonKm: number): string {
  const autour = `(around:${Math.round(rayonKm * 1000)},${p.lat},${p.lon})`;
  return `[out:json][timeout:25];(nwr["craft"="plumber"]${autour};nwr["craft"="electrician"]${autour};);out center tags;`;
}

function metiersDe(tags: Record<string, string>): Metier[] {
  const valeurs = Object.entries(tags)
    .filter(([cle]) => cle === 'craft' || cle.startsWith('craft_'))
    .flatMap(([, valeur]) => valeur.split(';'))
    .map((v) => METIERS[v.trim()])
    .filter((m): m is Metier => Boolean(m));
  return [...new Set(valeurs)];
}

export function analyserReponse(donnees: unknown, depuis: Position): Pro[] {
  const elements = (donnees as { elements?: unknown } | null)?.elements;
  if (!Array.isArray(elements)) return [];
  const pros: Pro[] = [];
  for (const el of elements as ElementOverpass[]) {
    const lat = el.lat ?? el.center?.lat;
    const lon = el.lon ?? el.center?.lon;
    const tags = el.tags ?? {};
    const metiers = metiersDe(tags);
    if (lat === undefined || lon === undefined || metiers.length === 0) continue;
    const brut = tags.phone ?? tags['contact:phone'] ?? tags['contact:mobile'] ?? null;
    const telephone = brut ? brut.split(';')[0].trim() : null;
    if (!tags.name && !telephone) continue;
    pros.push({
      id: `${el.type}/${el.id}`,
      nom: tags.name ?? (metiers[0] === 'plombier' ? 'Plombier' : 'Électricien'),
      metiers,
      telephone,
      lat,
      lon,
      distanceKm: distanceKm(depuis, { lat, lon }),
    });
  }
  return pros.sort((a, b) => a.distanceKm - b.distanceKm);
}
```

```typescript
// src/fonctionnalites/pros/lib/filtrerPros.ts
import type { Metier, Pro } from '@/domaine/pro';

export function filtrerPros(pros: Pro[], filtre: Metier | 'tous'): Pro[] {
  return filtre === 'tous' ? pros : pros.filter((p) => p.metiers.includes(filtre));
}
```

Run: `npx jest src/fonctionnalites/pros` → PASS.

- [ ] **Step 3: Appel réseau (non testé : aucune requête réseau dans les tests)**

```typescript
// src/fonctionnalites/pros/api/chercherPros.ts
import { Platform } from 'react-native';
import type { Position } from '@/domaine/lieux';
import type { Pro } from '@/domaine/pro';
import { analyserReponse, construireRequete, URL_OVERPASS } from '../lib/overpass';

const DELAI_MS = 30000;
let enCours: { cle: string; promesse: Promise<Pro[]> } | null = null;

async function interroger(position: Position, rayonKm: number): Promise<Pro[]> {
  const controleur = new AbortController();
  const minuterie = setTimeout(() => controleur.abort(), DELAI_MS);
  try {
    const reponse = await fetch(URL_OVERPASS, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        // Overpass refuse les requêtes anonymes ; le navigateur interdit cet en-tête sur le web.
        ...(Platform.OS === 'web' ? {} : { 'User-Agent': 'DepannMaison/2.0' }),
      },
      body: 'data=' + encodeURIComponent(construireRequete(position, rayonKm)),
      signal: controleur.signal,
    });
    if (!reponse.ok) throw new Error(`Overpass a répondu ${reponse.status}`);
    return analyserReponse(await reponse.json(), position);
  } finally {
    clearTimeout(minuterie);
  }
}

export function chercherPros(position: Position, rayonKm: number): Promise<Pro[]> {
  const cle = `${position.lat.toFixed(3)},${position.lon.toFixed(3)},${rayonKm}`;
  if (enCours?.cle === cle) return enCours.promesse;
  const promesse = interroger(position, rayonKm).finally(() => {
    if (enCours?.promesse === promesse) enCours = null;
  });
  enCours = { cle, promesse };
  return promesse;
}
```

- [ ] **Step 4: Vérifier et committer**

Run: `npm test` ; types régénérés puis `npx tsc --noEmit` → 0 erreur.

```bash
git add src/fonctionnalites/pros/lib/overpass.ts src/fonctionnalites/pros/lib/overpass.test.ts src/fonctionnalites/pros/lib/filtrerPros.ts src/fonctionnalites/pros/lib/filtrerPros.test.ts src/fonctionnalites/pros/api/chercherPros.ts
git commit -m "Ajoute la recherche des plombiers et électriciens sur OpenStreetMap"
```

---

### Task 4: Cache des pros (hors connexion)

**Files:**
- Create: `src/fonctionnalites/pros/lib/cachePros.ts`, `src/fonctionnalites/pros/lib/cachePros.test.ts`

**Interfaces:**
- Consumes: `Pro`, `Position`, `distanceKm`.
- Produces: `interface CachePros { pros: Pro[]; centre: Position; rayonKm: number; date: number }`, `CLE_CACHE_PROS = 'depannmaison.pros'`, `doitRafraichir(cache: CachePros | null, position: Position, rayonKm: number, maintenant: number): boolean`, `lireCache(brut: string | null): CachePros | null`, `ecrireCache(c: CachePros): string`, `ageTexte(date: number, maintenant: number): string`.

- [ ] **Step 1: Tests (failing)**

```typescript
// src/fonctionnalites/pros/lib/cachePros.test.ts
import { ageTexte, doitRafraichir, ecrireCache, lireCache, type CachePros } from './cachePros';

const HEURE = 60 * 60 * 1000;
const cache: CachePros = {
  pros: [{ id: 'node/1', nom: 'A', metiers: ['plombier'], telephone: null, lat: 43.3, lon: 5.4, distanceKm: 0.2 }],
  centre: { lat: 43.3, lon: 5.4 },
  rayonKm: 10,
  date: 0,
};

describe('cache des pros', () => {
  it('rafraîchit sans cache', () => {
    expect(doitRafraichir(null, cache.centre, 10, 0)).toBe(true);
  });
  it('garde le cache récent, au même endroit et au même rayon', () => {
    expect(doitRafraichir(cache, { lat: 43.301, lon: 5.4 }, 10, 2 * HEURE)).toBe(false);
  });
  it('rafraîchit si on a bougé de plus de 1 km', () => {
    expect(doitRafraichir(cache, { lat: 43.32, lon: 5.4 }, 10, HEURE)).toBe(true);
  });
  it('rafraîchit si le rayon change', () => {
    expect(doitRafraichir(cache, cache.centre, 20, HEURE)).toBe(true);
  });
  it('rafraîchit après 24 h', () => {
    expect(doitRafraichir(cache, cache.centre, 10, 25 * HEURE)).toBe(true);
  });
  it('relit ce qui a été écrit et refuse un texte illisible', () => {
    expect(lireCache(ecrireCache(cache))).toEqual(cache);
    expect(lireCache('{oups')).toBeNull();
    expect(lireCache(JSON.stringify({ pros: 'x' }))).toBeNull();
    expect(lireCache(null)).toBeNull();
  });
  it('dit depuis quand la liste est enregistrée', () => {
    expect(ageTexte(0, 30 * 1000)).toBe("à l'instant");
    expect(ageTexte(0, 5 * 60 * 1000)).toBe('il y a 5 min');
    expect(ageTexte(0, 3 * HEURE)).toBe('il y a 3 h');
    expect(ageTexte(0, 24 * HEURE)).toBe('il y a 1 jour');
    expect(ageTexte(0, 50 * HEURE)).toBe('il y a 2 jours');
  });
});
```

Run: `npx jest src/fonctionnalites/pros/lib/cachePros.test.ts` → FAIL.

- [ ] **Step 2: Implémenter**

```typescript
// src/fonctionnalites/pros/lib/cachePros.ts
import { distanceKm } from '@/domaine/distance';
import type { Position } from '@/domaine/lieux';
import type { Pro } from '@/domaine/pro';

export interface CachePros {
  pros: Pro[];
  centre: Position;
  rayonKm: number;
  date: number;
}

export const CLE_CACHE_PROS = 'depannmaison.pros';

const MINUTE = 60 * 1000;
const HEURE = 60 * MINUTE;
const JOUR = 24 * HEURE;

export function doitRafraichir(cache: CachePros | null, position: Position, rayonKm: number, maintenant: number): boolean {
  if (!cache) return true;
  if (cache.rayonKm !== rayonKm) return true;
  if (maintenant - cache.date > JOUR) return true;
  return distanceKm(cache.centre, position) > 1;
}

export function lireCache(brut: string | null): CachePros | null {
  if (!brut) return null;
  try {
    const c = JSON.parse(brut) as Partial<CachePros>;
    const valide =
      Array.isArray(c.pros) &&
      typeof c.centre?.lat === 'number' &&
      typeof c.centre?.lon === 'number' &&
      typeof c.rayonKm === 'number' &&
      typeof c.date === 'number';
    return valide ? (c as CachePros) : null;
  } catch {
    return null;
  }
}

export function ecrireCache(cache: CachePros): string {
  return JSON.stringify(cache);
}

export function ageTexte(date: number, maintenant: number): string {
  const ecart = maintenant - date;
  if (ecart < MINUTE) return "à l'instant";
  if (ecart < HEURE) return `il y a ${Math.floor(ecart / MINUTE)} min`;
  if (ecart < JOUR) return `il y a ${Math.floor(ecart / HEURE)} h`;
  const jours = Math.floor(ecart / JOUR);
  return `il y a ${jours} jour${jours > 1 ? 's' : ''}`;
}
```

- [ ] **Step 3: Vérifier et committer**

Run: `npx jest src/fonctionnalites/pros` → PASS ; `npm test`.

```bash
git add src/fonctionnalites/pros/lib/cachePros.ts src/fonctionnalites/pros/lib/cachePros.test.ts
git commit -m "Garde la dernière liste de pros pour le mode hors connexion"
```

---

### Task 5: Recherche d'une ville (géocodage)

**Files:**
- Create: `src/fonctionnalites/pros/lib/geocodage.ts`, `src/fonctionnalites/pros/lib/geocodage.test.ts`, `src/fonctionnalites/pros/api/chercherVille.ts`

**Interfaces:**
- Consumes: `Lieu`.
- Produces: `construireUrlGeocodage(recherche: string): string`, `analyserGeocodage(donnees: unknown): Lieu[]`, `chercherVille(recherche: string): Promise<Lieu[]>`.

- [ ] **Step 1: Tests (failing)**

```typescript
// src/fonctionnalites/pros/lib/geocodage.test.ts
import { analyserGeocodage, construireUrlGeocodage } from './geocodage';

describe('géocodage', () => {
  it('construit l’URL de recherche des communes', () => {
    expect(construireUrlGeocodage(' Marseille 13e ')).toBe(
      'https://data.geopf.fr/geocodage/search?q=Marseille%2013e&type=municipality&limit=5',
    );
  });

  it('lit les communes (coordonnées dans l’ordre longitude, latitude)', () => {
    const lieux = analyserGeocodage({
      features: [
        {
          geometry: { type: 'Point', coordinates: [5.429033, 43.340303] },
          properties: { label: 'Marseille 13e Arrondissement', city: 'Marseille 13e Arrondissement', postcode: '13013' },
        },
        { geometry: { type: 'Point', coordinates: ['x', 1] }, properties: { city: 'Invalide' } },
      ],
    });
    expect(lieux).toEqual([
      { nom: 'Marseille 13e Arrondissement', codePostal: '13013', position: { lat: 43.340303, lon: 5.429033 } },
    ]);
  });

  it('renvoie une liste vide si la réponse est invalide', () => {
    expect(analyserGeocodage(null)).toEqual([]);
  });
});
```

Run: `npx jest src/fonctionnalites/pros/lib/geocodage.test.ts` → FAIL.

- [ ] **Step 2: Implémenter**

```typescript
// src/fonctionnalites/pros/lib/geocodage.ts
import type { Lieu } from '@/domaine/lieux';

interface Entite {
  geometry?: { coordinates?: unknown[] };
  properties?: { city?: string; name?: string; label?: string; postcode?: string };
}

export function construireUrlGeocodage(recherche: string): string {
  return `https://data.geopf.fr/geocodage/search?q=${encodeURIComponent(recherche.trim())}&type=municipality&limit=5`;
}

export function analyserGeocodage(donnees: unknown): Lieu[] {
  const entites = (donnees as { features?: unknown } | null)?.features;
  if (!Array.isArray(entites)) return [];
  return (entites as Entite[]).flatMap((e) => {
    const [lon, lat] = e.geometry?.coordinates ?? [];
    const nom = e.properties?.city ?? e.properties?.name ?? e.properties?.label;
    if (typeof lat !== 'number' || typeof lon !== 'number' || !nom) return [];
    return [{ nom, codePostal: e.properties?.postcode ?? '', position: { lat, lon } }];
  });
}
```

```typescript
// src/fonctionnalites/pros/api/chercherVille.ts
import type { Lieu } from '@/domaine/lieux';
import { analyserGeocodage, construireUrlGeocodage } from '../lib/geocodage';

export async function chercherVille(recherche: string): Promise<Lieu[]> {
  const reponse = await fetch(construireUrlGeocodage(recherche));
  if (!reponse.ok) throw new Error(`Géocodage : ${reponse.status}`);
  return analyserGeocodage(await reponse.json());
}
```

- [ ] **Step 3: Vérifier et committer**

Run: `npx jest src/fonctionnalites/pros` → PASS ; `npm test` ; types régénérés puis `npx tsc --noEmit`.

```bash
git add src/fonctionnalites/pros/lib/geocodage.ts src/fonctionnalites/pros/lib/geocodage.test.ts src/fonctionnalites/pros/api/chercherVille.ts
git commit -m "Ajoute la recherche d'une ville ou d'un code postal"
```

---

### Task 6: Dépendances natives, configuration et guide de build

**Files:**
- Modify: `package.json`, `app.json`, `CLAUDE.md`
- Create: `docs/build-android.md`

**Interfaces:**
- Produces: modules `@maplibre/maplibre-react-native` et `expo-location` installés et déclarés.

- [ ] **Step 1: Installer**

```bash
npx expo install @maplibre/maplibre-react-native expo-location
```

- [ ] **Step 2: `app.json`**

Dans `expo` :
- `ios` : ajouter `"bundleIdentifier": "fr.depannmaison.app"` (garder `icon`).
- `android` : ajouter `"package": "fr.depannmaison.app"` (garder le reste).
- `plugins` : ajouter à la fin du tableau existant :

```json
      "@maplibre/maplibre-react-native",
      [
        "expo-location",
        {
          "locationWhenInUsePermission": "Dépann'Maison utilise ta position pour trouver les plombiers et électriciens proches."
        }
      ]
```

- [ ] **Step 3: Guide pour André — `docs/build-android.md`**

```markdown
# Lancer Dépann'Maison sur ton téléphone Android

Depuis l'ajout de la carte (MapLibre), l'appli contient du code natif : **Expo Go ne peut plus l'ouvrir**. Il faut installer une version « de développement » de l'appli sur ton téléphone. Deux possibilités.

## Option 1 — Sur ton PC avec Android Studio (gratuit)

1. Installe [Android Studio](https://developer.android.com/studio), puis ouvre-le une fois pour qu'il installe le SDK Android.
2. Sur ton téléphone : Paramètres → À propos → appuie 7 fois sur « Numéro de build » pour activer les options développeur, puis active « Débogage USB ».
3. Branche le téléphone en USB et accepte l'autorisation qui s'affiche.
4. Dans le dossier du projet :
   ```bash
   npx expo run:android --device
   ```
   La première fois, c'est long (plusieurs minutes). L'appli s'installe et s'ouvre sur le téléphone.
5. Les fois suivantes : `npx expo start`, puis ouvre l'appli « Dépann'Maison » déjà installée (elle se connecte au serveur tout seul).

## Option 2 — En ligne avec EAS (compte Expo gratuit, sans Android Studio)

1. `npm install -g eas-cli` puis `eas login`.
2. `eas build --profile development --platform android` (EAS te propose de créer la configuration la première fois).
3. Installe l'APK reçu par lien sur ton téléphone.
4. Ensuite : `npx expo start --dev-client`.

## À vérifier sur le téléphone
- L'appli demande la permission de localisation au premier lancement.
- La carte s'affiche (sombre ou claire selon le thème) avec ton point bleu et les pros proches.
- Mode avion : bandeau « Hors connexion », la dernière liste de pros reste affichée.
- Refuser la localisation : le champ « Ta ville ou ton code postal » apparaît.
```

- [ ] **Step 4: `CLAUDE.md`**

Dans « Stack technique », ajouter la ligne :
`- Carte native : l'appli ne tourne plus dans Expo Go ; build de développement nécessaire (voir \`docs/build-android.md\`). La prévisualisation web affiche un fond de carte factice.`

- [ ] **Step 5: Vérifier et committer**

Run: `npm test` ; types régénérés puis `npx tsc --noEmit` → 0 erreur ; vérifier que le bundle web se construit encore : `npx expo export --platform web --output-dir dist-check` (succès attendu : rien n'importe encore MapLibre), puis `rm -rf dist-check` et **régénérer les types** (l'export les pollue) avant tout `tsc`.

```bash
git add package.json package-lock.json app.json CLAUDE.md docs/build-android.md
git commit -m "Ajoute MapLibre et la localisation, et le guide pour lancer l'appli sur Android"
```

---

### Task 7: Hooks position et pros

**Files:**
- Create: `src/fonctionnalites/pros/hooks/usePosition.ts`, `src/fonctionnalites/pros/hooks/usePros.ts`

**Interfaces:**
- Consumes: `useReglages()` (`reglages.localisation`, `reglages.villeParDefaut`, `reglages.rayonKm`, `modifier`), `chercherPros`, cache (tâche 4).
- Produces:
  - `type StatutPosition = 'chargement' | 'gps' | 'ville' | 'aucune'` ; `usePosition(): { position: Position | null; statut: StatutPosition; demanderAutorisation: () => void }`
  - `type EtatPros = 'attente' | 'chargement' | 'ok' | 'hors-ligne'` ; `usePros(position: Position | null): { pros: Pro[]; etat: EtatPros; date: number | null }` (liste vide + `ok` = aucun pro trouvé)

- [ ] **Step 1: `usePosition.ts`**

```typescript
// src/fonctionnalites/pros/hooks/usePosition.ts
import * as Location from 'expo-location';
import { useEffect, useState } from 'react';
import { Linking, Platform } from 'react-native';
import type { Position } from '@/domaine/lieux';
import { useReglages } from '@/fonctionnalites/reglages/ReglagesProvider';

export type StatutPosition = 'chargement' | 'gps' | 'ville' | 'aucune';

const FRAICHEUR_MS = 60000;
// Partagée entre les écrans pour ne pas redemander la position à chaque montage.
let memoire: { position: Position; date: number } | null = null;

export function usePosition(): { position: Position | null; statut: StatutPosition; demanderAutorisation: () => void } {
  const { reglages, modifier } = useReglages();
  const [gps, setGps] = useState<Position | null>(memoire?.position ?? null);
  const [etat, setEtat] = useState<'chargement' | 'ok' | 'refuse'>(memoire ? 'ok' : 'chargement');
  const [essai, setEssai] = useState(0);

  useEffect(() => {
    if (!reglages.localisation) {
      setEtat('refuse');
      return;
    }
    if (memoire && essai === 0 && Date.now() - memoire.date < FRAICHEUR_MS) {
      setGps(memoire.position);
      setEtat('ok');
      return;
    }
    let annule = false;
    setEtat('chargement');
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          if (!annule) setEtat('refuse');
          return;
        }
        const r = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        const position = { lat: r.coords.latitude, lon: r.coords.longitude };
        memoire = { position, date: Date.now() };
        if (!annule) {
          setGps(position);
          setEtat('ok');
        }
      } catch {
        if (!annule) setEtat('refuse');
      }
    })();
    return () => {
      annule = true;
    };
  }, [reglages.localisation, essai]);

  const demanderAutorisation = () => {
    if (!reglages.localisation) {
      modifier({ localisation: true });
      return;
    }
    Location.getForegroundPermissionsAsync()
      .then((p) => {
        if (p.status !== 'granted' && !p.canAskAgain && Platform.OS !== 'web') return Linking.openSettings();
        setEssai((n) => n + 1);
      })
      .catch(() => setEssai((n) => n + 1));
  };

  if (etat === 'ok' && gps) return { position: gps, statut: 'gps', demanderAutorisation };
  if (etat === 'chargement') return { position: null, statut: 'chargement', demanderAutorisation };
  if (reglages.villeParDefaut) return { position: reglages.villeParDefaut.position, statut: 'ville', demanderAutorisation };
  return { position: null, statut: 'aucune', demanderAutorisation };
}
```

- [ ] **Step 2: `usePros.ts`**

```typescript
// src/fonctionnalites/pros/hooks/usePros.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import type { Position } from '@/domaine/lieux';
import type { Pro } from '@/domaine/pro';
import { useReglages } from '@/fonctionnalites/reglages/ReglagesProvider';
import { chercherPros } from '../api/chercherPros';
import { CLE_CACHE_PROS, doitRafraichir, ecrireCache, lireCache, type CachePros } from '../lib/cachePros';

export type EtatPros = 'attente' | 'chargement' | 'ok' | 'hors-ligne';

// undefined = pas encore lu sur le téléphone ; partagé entre les écrans.
let cacheMemoire: CachePros | null | undefined;

async function lireCacheStocke(): Promise<CachePros | null> {
  if (cacheMemoire !== undefined) return cacheMemoire;
  try {
    cacheMemoire = lireCache(await AsyncStorage.getItem(CLE_CACHE_PROS));
  } catch {
    cacheMemoire = null;
  }
  return cacheMemoire;
}

async function enregistrer(cache: CachePros): Promise<void> {
  cacheMemoire = cache;
  await AsyncStorage.setItem(CLE_CACHE_PROS, ecrireCache(cache)).catch(() => undefined);
}

export function usePros(position: Position | null): { pros: Pro[]; etat: EtatPros; date: number | null } {
  const { reglages } = useReglages();
  const rayonKm = reglages.rayonKm;
  const [etat, setEtat] = useState<EtatPros>('attente');
  const [pros, setPros] = useState<Pro[]>(cacheMemoire?.pros ?? []);
  const [date, setDate] = useState<number | null>(cacheMemoire?.date ?? null);
  const lat = position?.lat;
  const lon = position?.lon;

  useEffect(() => {
    if (lat === undefined || lon === undefined) {
      setEtat('attente');
      return;
    }
    const ici = { lat, lon };
    let annule = false;
    (async () => {
      const cache = await lireCacheStocke();
      if (annule) return;
      if (cache && !doitRafraichir(cache, ici, rayonKm, Date.now())) {
        setPros(cache.pros);
        setDate(cache.date);
        setEtat('ok');
        return;
      }
      setEtat('chargement');
      try {
        const trouves = await chercherPros(ici, rayonKm);
        const nouveau: CachePros = { pros: trouves, centre: ici, rayonKm, date: Date.now() };
        await enregistrer(nouveau);
        if (annule) return;
        setPros(trouves);
        setDate(nouveau.date);
        setEtat('ok');
      } catch {
        if (annule) return;
        setPros(cache?.pros ?? []);
        setDate(cache?.date ?? null);
        setEtat('hors-ligne');
      }
    })();
    return () => {
      annule = true;
    };
  }, [lat, lon, rayonKm]);

  return { pros, etat, date };
}
```

- [ ] **Step 3: Vérifier et committer**

Run: `npm test` ; types régénérés puis `npx tsc --noEmit` → 0 erreur.

```bash
git add src/fonctionnalites/pros/hooks
git commit -m "Ajoute la position et la liste des pros avec leur cache"
```

---

### Task 8: La carte (native MapLibre + double web)

**Files:**
- Move: `src/fonctionnalites/accueil/components/FondCarte.tsx` → `src/fonctionnalites/pros/components/FondCarte.tsx` (git mv, puis modification)
- Create: `src/fonctionnalites/pros/components/Marqueurs.tsx`, `src/fonctionnalites/pros/components/carteTypes.ts`, `src/fonctionnalites/pros/components/CartePros.native.tsx`, `src/fonctionnalites/pros/components/CartePros.tsx`
- Modify: `src/fonctionnalites/accueil/EcranAccueil.tsx` (import de FondCarte seulement, pour que tout compile ; réécrit à la tâche 10)

**Interfaces:**
- Consumes: `useTheme()`, `teinte()`, `Icone`, `Position`, `Pro`, `Metier`.
- Produces:
  - `<FondCarte neutre?={boolean} avecPoint?={boolean} />` (défauts : `neutre=false`, `avecPoint=true`)
  - `<PointPosition />`, `<EpinglePro metier={Metier} />`
  - `interface PropsCartePros { centre: Position | null; pros: Pro[]; horsLigne: boolean; recentrage: number }` (`recentrage` : compteur ; chaque incrément recentre la carte sur `centre`)
  - `<CartePros {...PropsCartePros} />` (remplit son parent en absolu)

- [ ] **Step 1: Déplacer et étendre `FondCarte`**

```bash
git mv src/fonctionnalites/accueil/components/FondCarte.tsx src/fonctionnalites/pros/components/FondCarte.tsx
```

Modifier la signature et le rendu : `export function FondCarte({ neutre = false, avecPoint = true }: { neutre?: boolean; avecPoint?: boolean })`. En mode `neutre` : ne dessiner que le sol (`carteSol`) et les routes (`ROUTES` et `GRANDES_ROUTES`) en couleur `carteBloc`, sans rivière, blocs, parc ni point. Hors mode neutre : rendu actuel ; les trois vues du point (halo, haloProche, point) ne s'affichent que si `avecPoint`. Garder `overflow: 'hidden'` et `pointerEvents: 'none'` dans le style racine.

Dans `src/fonctionnalites/accueil/EcranAccueil.tsx`, changer seulement l'import en `import { FondCarte } from '@/fonctionnalites/pros/components/FondCarte';`.

- [ ] **Step 2: `Marqueurs.tsx` et `carteTypes.ts`**

```tsx
// src/fonctionnalites/pros/components/Marqueurs.tsx
import { StyleSheet, View } from 'react-native';
import type { Metier } from '@/domaine/pro';
import { teinte } from '@/theme/teinte';
import { useTheme } from '@/theme/ThemeProvider';
import { Icone } from '@/ui/Icone';

export function PointPosition() {
  const { couleurs } = useTheme();
  return (
    <View style={[styles.halo, { backgroundColor: teinte(couleurs.accent, 0.25) }]}>
      <View style={[styles.point, { backgroundColor: couleurs.accent, borderColor: couleurs.surAccent }]} />
    </View>
  );
}

export function EpinglePro({ metier }: { metier: Metier }) {
  const { couleurs } = useTheme();
  const couleur = metier === 'plombier' ? couleurs.plomberie : couleurs.electricite;
  return (
    <View style={[styles.epingle, { backgroundColor: couleur, shadowColor: couleurs.ombre }]}>
      <View style={styles.redresse}>
        <Icone nom={metier === 'plombier' ? 'wrench' : 'zap'} couleur={couleurs.fond} taille={13} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  halo: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  point: { width: 16, height: 16, borderRadius: 8, borderWidth: 3 },
  epingle: {
    width: 26,
    height: 26,
    borderTopLeftRadius: 13,
    borderTopRightRadius: 13,
    borderBottomRightRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ rotate: '-45deg' }],
    shadowOpacity: 0.5,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  redresse: { transform: [{ rotate: '45deg' }] },
});
```

```typescript
// src/fonctionnalites/pros/components/carteTypes.ts
import type { Position } from '@/domaine/lieux';
import type { Pro } from '@/domaine/pro';

export interface PropsCartePros {
  centre: Position | null;
  pros: Pro[];
  horsLigne: boolean;
  recentrage: number;
}
```

- [ ] **Step 3: `CartePros.native.tsx` (MapLibre)**

```tsx
// src/fonctionnalites/pros/components/CartePros.native.tsx
import { Camera, Map, ViewAnnotation, type CameraRef } from '@maplibre/maplibre-react-native';
import { useEffect, useRef } from 'react';
import { StyleSheet } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import type { PropsCartePros } from './carteTypes';
import { FondCarte } from './FondCarte';
import { EpinglePro, PointPosition } from './Marqueurs';

const STYLES = {
  sombre: 'https://tiles.openfreemap.org/styles/dark',
  clair: 'https://tiles.openfreemap.org/styles/positron',
} as const;
const FRANCE: [number, number] = [2.4, 46.6];
const ZOOM_PROCHE = 13;

export function CartePros({ centre, pros, horsLigne, recentrage }: PropsCartePros) {
  const { nom } = useTheme();
  const camera = useRef<CameraRef>(null);
  const lat = centre?.lat;
  const lon = centre?.lon;

  useEffect(() => {
    if (lat === undefined || lon === undefined) return;
    camera.current?.flyTo({ center: [lon, lat], zoom: ZOOM_PROCHE, duration: 800 });
  }, [lat, lon, recentrage]);

  if (horsLigne) return <FondCarte neutre />;

  return (
    <Map style={StyleSheet.absoluteFill} mapStyle={STYLES[nom]} attribution={false} logo={false} compass={false}>
      <Camera
        ref={camera}
        initialViewState={
          lat !== undefined && lon !== undefined
            ? { center: [lon, lat], zoom: ZOOM_PROCHE }
            : { center: FRANCE, zoom: 5 }
        }
      />
      {lat !== undefined && lon !== undefined ? (
        <ViewAnnotation id="moi" lngLat={[lon, lat]}>
          <PointPosition />
        </ViewAnnotation>
      ) : null}
      {pros.map((pro) => (
        <ViewAnnotation key={pro.id} id={pro.id} lngLat={[pro.lon, pro.lat]} anchor="bottom">
          <EpinglePro metier={pro.metiers[0]} />
        </ViewAnnotation>
      ))}
    </Map>
  );
}
```

Si `anchor="bottom"` n'est pas accepté par le type `Anchor` de la version installée, retirer la prop et le signaler.

- [ ] **Step 4: `CartePros.tsx` (web : fond factice)**

```tsx
// src/fonctionnalites/pros/components/CartePros.tsx
// Version web : MapLibre n'existe qu'en natif, on garde le fond de carte factice.
import type { PropsCartePros } from './carteTypes';
import { FondCarte } from './FondCarte';

export function CartePros({ centre, horsLigne }: PropsCartePros) {
  return <FondCarte neutre={horsLigne} avecPoint={centre !== null} />;
}
```

- [ ] **Step 5: Vérifier et committer**

Run: `npm test` (dont le test des couleurs en dur) ; types régénérés puis `npx tsc --noEmit` → 0 erreur ; `npx expo export --platform web --output-dir dist-check` doit réussir (preuve que le web n'importe pas MapLibre), puis `rm -rf dist-check` et régénérer les types.

```bash
git add -A src/fonctionnalites/pros/components src/fonctionnalites/accueil
git commit -m "Ajoute la vraie carte MapLibre et son double pour le web"
```

---

### Task 9: Composants partagés — ligne de pro, bandeau, recherche de ville

**Files:**
- Create: `src/ui/CartePro.tsx`, `src/ui/BandeauHorsLigne.tsx`, `src/fonctionnalites/pros/components/RechercheVille.tsx`

**Interfaces:**
- Consumes: `CarteListe`, `Verre`, `Icone`, `appeler` (`@/ui/appeler`), `formaterDistance`, `LIBELLES_METIER`, `chercherVille`, `libelleLieu`.
- Produces: `<CartePro pro={Pro} />`, `<BandeauHorsLigne />`, `<RechercheVille onChoisir={(lieu: Lieu) => void} />`.

- [ ] **Step 1: `CartePro.tsx`** (maquettes 1-accueil et 3-autres-ecrans : icône métier teintée, nom, « Métier · distance », bouton d'appel rond)

```tsx
// src/ui/CartePro.tsx
import { Pressable, StyleSheet } from 'react-native';
import { formaterDistance } from '@/domaine/distance';
import { LIBELLES_METIER, type Pro } from '@/domaine/pro';
import { teinte } from '@/theme/teinte';
import { useTheme } from '@/theme/ThemeProvider';
import { appeler } from './appeler';
import { CarteListe } from './CarteListe';
import { Icone } from './Icone';

export function CartePro({ pro }: { pro: Pro }) {
  const { couleurs } = useTheme();
  const metier = pro.metiers[0];
  const telephone = pro.telephone;
  return (
    <CarteListe
      icone={metier === 'plombier' ? 'wrench' : 'zap'}
      couleur={metier === 'plombier' ? couleurs.plomberie : couleurs.electricite}
      titre={pro.nom}
      sousTitre={`${LIBELLES_METIER[metier]} · ${formaterDistance(pro.distanceKm)}`}
      droite={
        telephone ? (
          <Pressable
            onPress={() => appeler(telephone)}
            accessibilityRole="button"
            accessibilityLabel={`Appeler ${pro.nom}`}
            hitSlop={6}
            style={[styles.appel, { backgroundColor: teinte(couleurs.accent, 0.18) }]}
          >
            <Icone nom="phone" couleur={couleurs.accent} taille={16} />
          </Pressable>
        ) : null
      }
    />
  );
}

const styles = StyleSheet.create({
  appel: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
});
```

Note : `CarteListe` affiche un chevron quand `droite` est absent **et** `onPress` défini ; ici il n'y a pas d'`onPress`, donc ni chevron ni appui sur la ligne (seul le bouton appelle).

- [ ] **Step 2: `BandeauHorsLigne.tsx`** (maquette 5, état 1 : pilule de verre, icône `zap-off`, texte « Hors connexion » en orange)

```tsx
// src/ui/BandeauHorsLigne.tsx
import { StyleSheet, Text } from 'react-native';
import { teinte } from '@/theme/teinte';
import { useTheme } from '@/theme/ThemeProvider';
import { Icone } from './Icone';
import { Verre } from './Verre';

export function BandeauHorsLigne() {
  const { couleurs } = useTheme();
  return (
    <Verre style={[styles.bandeau, { borderColor: teinte(couleurs.electricite, 0.45) }]}>
      <Icone nom="zap-off" couleur={couleurs.electricite} taille={14} />
      <Text style={[styles.texte, { color: couleurs.electricite }]}>Hors connexion</Text>
    </Verre>
  );
}

const styles = StyleSheet.create({
  bandeau: { flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 999, paddingVertical: 8, paddingHorizontal: 12 },
  texte: { fontSize: 12.5, fontWeight: '600' },
});
```

- [ ] **Step 3: `RechercheVille.tsx`** (maquette 5, état 2)

```tsx
// src/fonctionnalites/pros/components/RechercheVille.tsx
import { useEffect, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { libelleLieu, type Lieu } from '@/domaine/lieux';
import { useTheme } from '@/theme/ThemeProvider';
import { CarteListe } from '@/ui/CarteListe';
import { Icone } from '@/ui/Icone';
import { Verre } from '@/ui/Verre';
import { chercherVille } from '../api/chercherVille';

const ATTENTE_MS = 400;

export function RechercheVille({ onChoisir }: { onChoisir: (lieu: Lieu) => void }) {
  const { couleurs } = useTheme();
  const [texte, setTexte] = useState('');
  const [lieux, setLieux] = useState<Lieu[]>([]);
  const [erreur, setErreur] = useState(false);

  useEffect(() => {
    const recherche = texte.trim();
    if (recherche.length < 2) {
      setLieux([]);
      setErreur(false);
      return;
    }
    let annule = false;
    const minuterie = setTimeout(() => {
      chercherVille(recherche)
        .then((trouves) => {
          if (annule) return;
          setLieux(trouves);
          setErreur(false);
        })
        .catch(() => {
          if (!annule) setErreur(true);
        });
    }, ATTENTE_MS);
    return () => {
      annule = true;
      clearTimeout(minuterie);
    };
  }, [texte]);

  return (
    <View style={styles.bloc}>
      <Verre style={styles.champ}>
        <Icone nom="search" couleur={couleurs.texteDiscret} taille={16} />
        <TextInput
          value={texte}
          onChangeText={setTexte}
          placeholder="Ta ville ou ton code postal"
          placeholderTextColor={couleurs.texteDiscret}
          accessibilityLabel="Ta ville ou ton code postal"
          style={[styles.saisie, { color: couleurs.texte }]}
        />
      </Verre>
      {erreur ? (
        <Text style={[styles.message, { color: couleurs.texteDiscret }]}>Recherche impossible sans connexion.</Text>
      ) : null}
      {lieux.map((lieu) => (
        <CarteListe
          key={`${lieu.nom}-${lieu.codePostal}`}
          icone="map-pin"
          couleur={couleurs.accent}
          titre={libelleLieu(lieu)}
          onPress={() => {
            onChoisir(lieu);
            setTexte('');
            setLieux([]);
          }}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  bloc: { gap: 8 },
  champ: { flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 12, paddingHorizontal: 12 },
  saisie: { flex: 1, fontSize: 14, paddingVertical: 11 },
  message: { fontSize: 12.5, textAlign: 'center' },
});
```

- [ ] **Step 4: Vérifier et committer**

Run: `npm test` ; types régénérés puis `npx tsc --noEmit`.

```bash
git add src/ui/CartePro.tsx src/ui/BandeauHorsLigne.tsx src/fonctionnalites/pros/components/RechercheVille.tsx
git commit -m "Ajoute la ligne de pro, le bandeau hors connexion et la recherche de ville"
```

---

### Task 10: Accueil — vraie carte et états de la maquette 5

**Files:**
- Modify (remplacement complet): `src/fonctionnalites/accueil/EcranAccueil.tsx`, `src/fonctionnalites/accueil/components/PanneauAccueil.tsx`
- Create: `src/fonctionnalites/accueil/components/SectionPros.tsx`, `src/fonctionnalites/accueil/components/BoutonRecentrer.tsx`

**Interfaces:**
- Consumes: `usePosition`, `usePros`, `CartePros`, `RechercheVille`, `CartePro`, `BandeauHorsLigne`, `ageTexte`, `useReglages`, `useMargeBarre`, `Logo`.
- Produces: `<PanneauAccueil>{enfants}</PanneauAccueil>` (enfants entre le bouton Diagnostic et l'avertissement).

- [ ] **Step 1: `PanneauAccueil.tsx`**

```tsx
// src/fonctionnalites/accueil/components/PanneauAccueil.tsx
import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { BoutonPrincipal } from '@/ui/BoutonPrincipal';
import { Verre } from '@/ui/Verre';

export function PanneauAccueil({ children }: { children?: ReactNode }) {
  const { couleurs } = useTheme();
  return (
    <Verre style={styles.panneau}>
      <View style={[styles.poignee, { backgroundColor: couleurs.bordure }]} />
      <BoutonPrincipal libelle="Diagnostiquer une panne" icone="stethoscope" onPress={() => router.push('/diagnostic')} />
      {children}
      <Text style={[styles.avertissement, { color: couleurs.texteDiscret }]}>
        Conseils uniquement — ne remplace pas un professionnel.
      </Text>
    </Verre>
  );
}

const styles = StyleSheet.create({
  panneau: { borderRadius: 24, padding: 12, gap: 10 },
  poignee: { width: 38, height: 4, borderRadius: 2, alignSelf: 'center' },
  avertissement: { fontSize: 12.5, textAlign: 'center' },
});
```

- [ ] **Step 2: `SectionPros.tsx`** (maquettes 1-accueil et 5-carte-etats)

```tsx
// src/fonctionnalites/accueil/components/SectionPros.tsx
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { Pro } from '@/domaine/pro';
import { RechercheVille } from '@/fonctionnalites/pros/components/RechercheVille';
import type { StatutPosition } from '@/fonctionnalites/pros/hooks/usePosition';
import type { EtatPros } from '@/fonctionnalites/pros/hooks/usePros';
import { ageTexte } from '@/fonctionnalites/pros/lib/cachePros';
import { useReglages } from '@/fonctionnalites/reglages/ReglagesProvider';
import { useTheme } from '@/theme/ThemeProvider';
import { CartePro } from '@/ui/CartePro';

interface Props {
  statut: StatutPosition;
  pros: Pro[];
  etat: EtatPros;
  date: number | null;
  onUtiliserPosition: () => void;
}

function Lien({ texte, onPress }: { texte: string; onPress: () => void }) {
  const { couleurs } = useTheme();
  return (
    <Pressable onPress={onPress} accessibilityRole="button" hitSlop={6}>
      <Text style={[styles.lien, { color: couleurs.accent }]}>{texte}</Text>
    </Pressable>
  );
}

export function SectionPros({ statut, pros, etat, date, onUtiliserPosition }: Props) {
  const { couleurs } = useTheme();
  const { reglages, modifier } = useReglages();
  const titre = (texte: string, avecToutVoir: boolean) => (
    <View style={styles.entete}>
      <Text style={[styles.titre, { color: couleurs.texteDiscret }]}>{texte}</Text>
      {avecToutVoir ? <Lien texte="Tout voir" onPress={() => router.navigate('/pros')} /> : null}
    </View>
  );

  if (statut === 'chargement') return null;

  if (statut === 'aucune') {
    return (
      <View style={styles.bloc}>
        {titre('Trouver des pros', false)}
        <RechercheVille onChoisir={(lieu) => modifier({ villeParDefaut: lieu })} />
        <Lien texte="Utiliser ma position" onPress={onUtiliserPosition} />
      </View>
    );
  }

  if (etat === 'attente' || etat === 'chargement') {
    return (
      <View style={styles.bloc}>
        {titre('Pros près de toi', false)}
        <Text style={[styles.message, { color: couleurs.texteDiscret }]}>Recherche des pros autour de toi…</Text>
      </View>
    );
  }

  if (pros.length === 0) {
    const horsLigne = etat === 'hors-ligne';
    return (
      <View style={styles.bloc}>
        {titre('Pros près de toi', false)}
        <Text style={[styles.vide, { color: couleurs.texte }]}>
          {horsLigne ? 'Pas de liste enregistrée' : `Aucun pro trouvé dans un rayon de ${reglages.rayonKm} km`}
        </Text>
        <Text style={[styles.message, { color: couleurs.texteDiscret }]}>
          {horsLigne
            ? 'Reconnecte-toi pour trouver les pros autour de toi.'
            : "Les données viennent d'OpenStreetMap et peuvent être incomplètes."}
        </Text>
        {!horsLigne && reglages.rayonKm < 20 ? <Lien texte="Élargir à 20 km" onPress={() => modifier({ rayonKm: 20 })} /> : null}
      </View>
    );
  }

  return (
    <View style={styles.bloc}>
      {titre('Pros près de toi', true)}
      {pros.slice(0, 2).map((pro) => (
        <CartePro key={pro.id} pro={pro} />
      ))}
      {etat === 'hors-ligne' && date !== null ? (
        <Text style={[styles.message, { color: couleurs.texteDiscret }]}>Liste enregistrée {ageTexte(date, Date.now())}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  bloc: { gap: 8 },
  entete: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 2 },
  titre: { fontSize: 11.5, textTransform: 'uppercase', letterSpacing: 0.6 },
  lien: { fontSize: 13, textAlign: 'center' },
  vide: { fontSize: 14, fontWeight: '700', textAlign: 'center' },
  message: { fontSize: 12, textAlign: 'center' },
});
```

- [ ] **Step 3: `BoutonRecentrer.tsx`**

```tsx
// src/fonctionnalites/accueil/components/BoutonRecentrer.tsx
import { Pressable, StyleSheet } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { Icone } from '@/ui/Icone';
import { Verre } from '@/ui/Verre';

export function BoutonRecentrer({ onPress }: { onPress: () => void }) {
  const { couleurs } = useTheme();
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel="Recentrer la carte sur ma position" hitSlop={6}>
      <Verre style={styles.bouton}>
        <Icone nom="locate-fixed" couleur={couleurs.texte} taille={18} />
      </Verre>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  bouton: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
});
```

- [ ] **Step 4: `EcranAccueil.tsx`**

```tsx
// src/fonctionnalites/accueil/EcranAccueil.tsx
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CartePros } from '@/fonctionnalites/pros/components/CartePros';
import { usePosition } from '@/fonctionnalites/pros/hooks/usePosition';
import { usePros } from '@/fonctionnalites/pros/hooks/usePros';
import { useTheme } from '@/theme/ThemeProvider';
import { BandeauHorsLigne } from '@/ui/BandeauHorsLigne';
import { useMargeBarre } from '@/ui/useMargeBarre';
import { BoutonRecentrer } from './components/BoutonRecentrer';
import { Logo } from './components/Logo';
import { PanneauAccueil } from './components/PanneauAccueil';
import { SectionPros } from './components/SectionPros';

export function EcranAccueil() {
  const { couleurs } = useTheme();
  const { top } = useSafeAreaInsets();
  const margeBarre = useMargeBarre();
  const { position, statut, demanderAutorisation } = usePosition();
  const { pros, etat, date } = usePros(position);
  const [recentrage, setRecentrage] = useState(0);
  const horsLigne = etat === 'hors-ligne';

  return (
    <View style={[styles.racine, { backgroundColor: couleurs.carteSol }]}>
      <CartePros centre={position} pros={pros} horsLigne={horsLigne} recentrage={recentrage} />
      <View style={[styles.haut, { top: top + 12 }]} pointerEvents="box-none">
        <Logo />
        {horsLigne ? <BandeauHorsLigne /> : null}
        {statut === 'gps' && !horsLigne ? (
          <BoutonRecentrer onPress={() => setRecentrage((n) => n + 1)} />
        ) : (
          <View style={styles.place} />
        )}
      </View>
      {!horsLigne ? (
        <Text style={[styles.credit, { top: top + 62, color: couleurs.texteDiscret }]}>© OpenFreeMap · OpenStreetMap</Text>
      ) : null}
      <View style={[styles.panneau, { bottom: margeBarre - 8 }]}>
        <PanneauAccueil>
          <SectionPros statut={statut} pros={pros} etat={etat} date={date} onUtiliserPosition={demanderAutorisation} />
        </PanneauAccueil>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  racine: { flex: 1 },
  haut: { position: 'absolute', left: 16, right: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  place: { width: 44, height: 44 },
  credit: { position: 'absolute', left: 16, fontSize: 10 },
  panneau: { position: 'absolute', left: 10, right: 10 },
});
```

- [ ] **Step 5: Vérifier et committer**

Run: `npm test` ; types régénérés puis `npx tsc --noEmit` → 0 erreur.

```bash
git add src/fonctionnalites/accueil
git commit -m "Branche la carte et les pros proches sur l'accueil"
```

---

### Task 11: Écran Pros

**Files:**
- Modify (remplacement complet): `src/fonctionnalites/pros/EcranPros.tsx`

**Interfaces:**
- Consumes: `usePosition`, `usePros`, `filtrerPros`, `CartePros`, `CartePro`, `RechercheVille`, `BandeauHorsLigne`, `Onglets`, `ageTexte`, `useReglages`.

- [ ] **Step 1: Réécrire l'écran** (maquette 3-autres-ecrans, écran « Pros » : petite carte, filtre Tous / Plombiers / Électriciens, liste triée par distance, crédit + date)

```tsx
// src/fonctionnalites/pros/EcranPros.tsx
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { Metier } from '@/domaine/pro';
import { useReglages } from '@/fonctionnalites/reglages/ReglagesProvider';
import { useTheme } from '@/theme/ThemeProvider';
import { BandeauHorsLigne } from '@/ui/BandeauHorsLigne';
import { CartePro } from '@/ui/CartePro';
import { EnTete } from '@/ui/EnTete';
import { FondEcran } from '@/ui/FondEcran';
import { Onglets } from '@/ui/Onglets';
import { CartePros } from './components/CartePros';
import { RechercheVille } from './components/RechercheVille';
import { usePosition } from './hooks/usePosition';
import { usePros } from './hooks/usePros';
import { ageTexte } from './lib/cachePros';
import { filtrerPros } from './lib/filtrerPros';

export function EcranPros() {
  const { couleurs } = useTheme();
  const { reglages, modifier } = useReglages();
  const { position, statut, demanderAutorisation } = usePosition();
  const { pros, etat, date } = usePros(position);
  const [filtre, setFiltre] = useState<Metier | 'tous'>('tous');
  const liste = filtrerPros(pros, filtre);
  const horsLigne = etat === 'hors-ligne';
  const discret = { color: couleurs.texteDiscret };

  return (
    <FondEcran>
      <EnTete titre="Pros près de toi" />
      {horsLigne ? <View style={styles.centre}><BandeauHorsLigne /></View> : null}
      {statut === 'aucune' ? (
        <>
          <Text style={[styles.message, discret]}>Indique ta ville pour trouver les pros autour de toi.</Text>
          <RechercheVille onChoisir={(lieu) => modifier({ villeParDefaut: lieu })} />
          <Text style={[styles.lien, { color: couleurs.accent }]} onPress={demanderAutorisation}>
            Utiliser ma position
          </Text>
        </>
      ) : (
        <>
          <View style={[styles.carte, { borderColor: couleurs.bordure }]}>
            <CartePros centre={position} pros={liste} horsLigne={horsLigne} recentrage={0} />
          </View>
          <Onglets<Metier | 'tous'>
            options={[
              { valeur: 'tous', libelle: 'Tous' },
              { valeur: 'plombier', libelle: 'Plombiers' },
              { valeur: 'electricien', libelle: 'Électriciens' },
            ]}
            valeur={filtre}
            onChange={setFiltre}
          />
          {etat === 'attente' || etat === 'chargement' ? (
            <Text style={[styles.message, discret]}>Recherche des pros autour de toi…</Text>
          ) : null}
          {etat === 'ok' && liste.length === 0 ? (
            <Text style={[styles.message, discret]}>
              Aucun pro trouvé dans un rayon de {reglages.rayonKm} km. Les données d'OpenStreetMap peuvent être incomplètes.
            </Text>
          ) : null}
          {liste.map((pro) => (
            <CartePro key={pro.id} pro={pro} />
          ))}
          {date !== null && liste.length > 0 ? (
            <Text style={[styles.credit, discret]}>Données © OpenStreetMap · mis à jour {ageTexte(date, Date.now())}</Text>
          ) : null}
        </>
      )}
    </FondEcran>
  );
}

const styles = StyleSheet.create({
  centre: { alignItems: 'center' },
  carte: { height: 170, borderRadius: 18, borderWidth: 1, overflow: 'hidden' },
  message: { fontSize: 13.5, textAlign: 'center', lineHeight: 19 },
  lien: { fontSize: 14, textAlign: 'center' },
  credit: { fontSize: 11, textAlign: 'center', marginTop: 4 },
});
```

- [ ] **Step 2: Vérifier et committer**

Run: `npm test` ; types régénérés puis `npx tsc --noEmit`.

```bash
git add src/fonctionnalites/pros/EcranPros.tsx
git commit -m "Affiche la liste des pros proches avec filtre par métier"
```

---

### Task 12: Résultat du diagnostic — les pros du bon métier

**Files:**
- Modify (remplacement complet): `src/fonctionnalites/diagnostic/components/CarteResultat.tsx`
- Modify: `src/fonctionnalites/diagnostic/EcranDiagnostic.tsx` (passer le métier)

**Interfaces:**
- Consumes: `usePosition`, `usePros`, `filtrerPros`, `CartePro`, `Metier`, `metierDeCategorie`, `LIBELLES_METIER`.
- Produces: `<CarteResultat resultat={Resultat} metier={Metier} onRecommencer={() => void} />`.

- [ ] **Step 1: Réécrire `CarteResultat.tsx`** (maquette 2, écrans 3a/3b ; spec §5 : vert → tuto puis « Si tu préfères un pro » (1 pro) ; orange → geste, numéro, pros (2), tuto ; rouge → numéro, pros (2), geste ; jamais de tuto sur rouge)

```tsx
// src/fonctionnalites/diagnostic/components/CarteResultat.tsx
import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { LIBELLES_METIER, type Metier } from '@/domaine/pro';
import type { Resultat } from '@/domaine/types';
import { gestesUrgence } from '@/donnees/gestesUrgence';
import { tutos } from '@/donnees/tutos';
import { usePosition } from '@/fonctionnalites/pros/hooks/usePosition';
import { usePros } from '@/fonctionnalites/pros/hooks/usePros';
import { filtrerPros } from '@/fonctionnalites/pros/lib/filtrerPros';
import { useTheme } from '@/theme/ThemeProvider';
import { BoutonPrincipal } from '@/ui/BoutonPrincipal';
import { CarteListe } from '@/ui/CarteListe';
import { CartePro } from '@/ui/CartePro';
import { NumeroUrgence } from '@/ui/NumeroUrgence';
import { VerdictBadge } from '@/ui/VerdictBadge';

interface Props {
  resultat: Resultat;
  metier: Metier;
  onRecommencer: () => void;
}

export function CarteResultat({ resultat, metier, onRecommencer }: Props) {
  const { couleurs } = useTheme();
  const { position } = usePosition();
  const { pros } = usePros(position);
  const tuto = tutos.find((t) => t.id === resultat.tutoId);
  const geste = gestesUrgence.find((g) => g.id === resultat.gesteUrgenceId);
  const prosMetier = filtrerPros(pros, metier).slice(0, resultat.verdict === 'vert' ? 1 : 2);

  const boutonTuto = tuto ? (
    <BoutonPrincipal
      key="tuto"
      libelle={`Voir le tuto (${tuto.duree})`}
      icone="book-open"
      onPress={() => router.push({ pathname: '/tutos/[id]', params: { id: tuto.id } }, { withAnchor: true })}
    />
  ) : null;
  const carteGeste = geste ? (
    <CarteListe
      key="geste"
      icone={geste.icone}
      couleur={couleurs.danger}
      titre={geste.titre}
      sousTitre="Geste de sécurité"
      onPress={() => router.push({ pathname: '/urgences/[id]', params: { id: geste.id } }, { withAnchor: true })}
    />
  ) : null;
  const numero = resultat.numeroUtile ? <NumeroUrgence key="numero" numero={resultat.numeroUtile} /> : null;
  const sectionPros =
    prosMetier.length > 0 ? (
      <View key="pros" style={styles.pros}>
        <Text style={[styles.titrePros, { color: couleurs.texteDiscret }]}>
          {resultat.verdict === 'vert' ? 'Si tu préfères un pro' : `${LIBELLES_METIER[metier]}s près de toi`}
        </Text>
        {prosMetier.map((pro) => (
          <CartePro key={pro.id} pro={pro} />
        ))}
      </View>
    ) : null;

  const actions =
    resultat.verdict === 'vert' ? [boutonTuto, carteGeste, sectionPros] :
    resultat.verdict === 'orange' ? [carteGeste, numero, sectionPros, boutonTuto] :
    [numero, sectionPros, carteGeste];

  return (
    <View style={styles.bloc}>
      <VerdictBadge verdict={resultat.verdict} />
      <Text style={[styles.conseil, { color: couleurs.texte }]}>{resultat.conseil}</Text>
      {actions}
      <BoutonPrincipal libelle="Recommencer" icone="rotate-ccw" variante="discret" onPress={onRecommencer} />
    </View>
  );
}

const styles = StyleSheet.create({
  bloc: { gap: 12 },
  conseil: { fontSize: 15, lineHeight: 22 },
  pros: { gap: 8 },
  titrePros: { fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.6 },
});
```

- [ ] **Step 2: `EcranDiagnostic.tsx`**

Ajouter `import { metierDeCategorie } from '@/domaine/pro';` et passer `metier={metierDeCategorie(diagnostic.categorie)}` à `<CarteResultat …>` dans le composant `Parcours`.

- [ ] **Step 3: Vérifier et committer**

Run: `npm test` ; types régénérés puis `npx tsc --noEmit`.

```bash
git add src/fonctionnalites/diagnostic
git commit -m "Propose les pros du bon métier sur le résultat du diagnostic"
```

---

### Task 13: Réglages — ville par défaut

**Files:**
- Modify: `src/fonctionnalites/reglages/EcranReglages.tsx`

**Interfaces:**
- Consumes: `RechercheVille`, `libelleLieu`, `useReglages`.

- [ ] **Step 1: Ajouter la ligne « Ville par défaut »** (maquette 3-autres-ecrans, écran « Réglages ») juste avant la carte « À propos et mentions légales » :

```tsx
      <CarteListe
        icone="map-pin"
        couleur={couleurs.accent}
        titre="Ville par défaut"
        sousTitre={reglages.villeParDefaut ? libelleLieu(reglages.villeParDefaut) : 'Utilisée si la localisation est désactivée'}
        onPress={() => setChoixVille((ouvert) => !ouvert)}
      />
      {choixVille ? (
        <RechercheVille
          onChoisir={(lieu) => {
            modifier({ villeParDefaut: lieu });
            setChoixVille(false);
          }}
        />
      ) : null}
```

Ajouter en tête du composant `const [choixVille, setChoixVille] = useState(false);` et les imports `useState` (react), `libelleLieu` (`@/domaine/lieux`), `RechercheVille` (`@/fonctionnalites/pros/components/RechercheVille`).

- [ ] **Step 2: Vérifier et committer**

Run: `npm test` ; types régénérés puis `npx tsc --noEmit` ; vérifier que `EcranReglages.tsx` reste ≤ ~250 lignes.

```bash
git add src/fonctionnalites/reglages/EcranReglages.tsx
git commit -m "Permet de choisir la ville par défaut dans les réglages"
```

---

### Task 14: Vérification finale

**Files:**
- Aucun fichier créé (corrections éventuelles uniquement).

- [ ] **Step 1: Suite complète**

Run : `npm test` (rapporter le nombre, test des couleurs en dur inclus) ; types régénérés puis `npx tsc --noEmit` → 0 erreur ; `npx expo export --platform web --output-dir dist-check` → succès, puis `rm -rf dist-check` et régénérer les types.

- [ ] **Step 2: Tailles**

`find app src -name "*.ts*" ! -name "*.test.*" | xargs wc -l | sort -n | tail -12` → aucun fichier au-dessus des plafonds (composant ~250, écran ~350, hook/lib ~300). Rapporter la liste.

- [ ] **Step 3: Recherche d'éléments oubliés**

`grep -rn "Bientôt disponible" src` → aucun résultat. `grep -rn "accueil/components/FondCarte" src` → aucun résultat.

- [ ] **Step 4: Commit (si des corrections ont été nécessaires)**

```bash
git add -A src
git commit -m "Finalise le chantier B"
```

Après cette tâche, le contrôleur vérifie la version web (listes de pros réelles via Overpass, recherche de ville, états vide et hors connexion) ; André vérifie la carte native sur son téléphone avec `docs/build-android.md`.
