# Chantier F — Qualité — plan d'implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Lint + vérification automatique GitHub Actions, schémas animés en pause hors écran, Sentry en production, scénarios Maestro de bout en bout.

**Architecture:** Outillage ajouté autour de l'appli existante, sans changement visuel. La logique nouvelle (visibilité d'un schéma, filtrage des données envoyées à Sentry) est pure et testée avec Jest ; le reste est de la configuration.

**Tech Stack:** Expo SDK 57, React Native 0.86, TypeScript strict, Jest (jest-expo), ESLint (eslint-config-expo), GitHub Actions, @sentry/react-native, Maestro.

**Spec:** `docs/superpowers/specs/2026-10-03-chantier-f-qualite-design.md`

## Global Constraints

- Tout en français : noms métier, commentaires, messages de commit (simples, sans jargon), fin de message de commit : ligne vide puis `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- Aucune couleur en dur hors de `src/theme/` (test `src/theme/couleursEnDur.test.ts`).
- Aucun changement visuel.
- `app/` = routes uniquement (fichiers ≤ 30 lignes). Logique pure testée, test à côté du fichier.
- Ne jamais lancer `npx expo export` ni `npx expo prebuild` dans ce chantier ; ne pas toucher au dossier `android/` (ignoré par git) sauf mention explicite.
- Ne jamais modifier la configuration git globale ; ne jamais créer de dépôt distant ni pousser (le contrôleur le fait avec l'accord d'André).
- Installer des paquets avec `npx expo install <paquet>` (versions compatibles SDK 57) ; outils de dev avec `npm install -D`.
- Vérifications : `npx tsc --noEmit`, `npx jest`, et à partir de la Tâche 1 `npx expo lint`.

---

### Task 1: ESLint

**Files:**
- Create: `eslint.config.js`
- Modify: `package.json` (devDependencies `eslint`, `eslint-config-expo` ; script `lint` déjà présent : `expo lint`)
- Modify: tout fichier `src/` / `app/` signalé en **erreur** par le lint (corrections sans changement de comportement)

**Interfaces:** Produces: `npx expo lint` sort en code 0.

- [ ] **Step 1:** installer : `npx expo install eslint eslint-config-expo -- --save-dev` (si la syntaxe échoue : `npm install -D eslint eslint-config-expo` aux versions recommandées par `npx expo install --check`).
- [ ] **Step 2:** créer `eslint.config.js` :

```js
// Configuration ESLint (règles recommandées par Expo).
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['android/*', 'ios/*', '.expo/*', 'dist/*', 'node_modules/*', 'scripts/*'],
  },
]);
```

- [ ] **Step 3:** `npx expo lint` ; corriger toutes les **erreurs** (les avertissements peuvent rester, mais les lister dans le rapport). Ne pas désactiver de règle globalement ; une désactivation locale (`// eslint-disable-next-line <règle>`) n'est acceptée qu'avec un commentaire qui explique pourquoi (ex. `require()` d'une image).
- [ ] **Step 4:** `npx tsc --noEmit`, `npx jest` → verts ; `npx expo lint` → code 0.
- [ ] **Step 5:** commit `Ajoute ESLint et corrige les erreurs signalées`.

---

### Task 2: Vérification automatique GitHub Actions

**Files:**
- Create: `.github/workflows/verification.yml`
- Modify: `README.md` (pastille sous le titre `# Dépannéo`)

**Interfaces:** Consumes: Task 1 (`npx expo lint`).

- [ ] **Step 1:** créer `.github/workflows/verification.yml` :

```yaml
# Vérifie le projet à chaque envoi : types, qualité du code, tests.
name: Vérification

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  verifier:
    runs-on: ubuntu-latest
    timeout-minutes: 15
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - name: Types
        run: npx tsc --noEmit
      - name: Qualité du code
        run: npx expo lint
      - name: Tests
        run: npx jest --ci
```

- [ ] **Step 2:** README, juste sous `# Dépannéo` : `[![Vérification](https://github.com/elios134/depanneo/actions/workflows/verification.yml/badge.svg)](https://github.com/elios134/depanneo/actions/workflows/verification.yml)`.
- [ ] **Step 3:** simuler la CI en local : `npm ci` puis les 3 commandes du workflow → toutes vertes. (Attention : `npm ci` réinstalle `node_modules`, c'est voulu.)
- [ ] **Step 4:** commit `Ajoute la vérification automatique sur GitHub`.

---

### Task 3: Schémas animés en pause hors de l'écran

**Files:**
- Create: `src/ui/schemas/visibilite.ts`, `src/ui/schemas/visibilite.test.ts`
- Create: `src/ui/schemas/ZoneVisible.tsx` (contexte React : zone visible du défilement)
- Modify: `src/ui/FondEcran.tsx` (publie la zone visible quand `defilant`)
- Modify: `src/ui/schemas/SchemaAnime.tsx` (mesure sa position, calcule sa visibilité, la transmet)
- Modify: `src/ui/schemas/SchemaSiphon.tsx`, `SchemaDisjoncteur.tsx`, `SchemaDessine.tsx` (prop `visible` → `useTempsBoucle(duree, !immobile && visible)`)
- Modify: `src/ui/schemas/useTempsBoucle.ts` (`PAS_MS` 33 → 42, commentaire « environ 24 images par seconde »)

**Interfaces:**
- Produces: `estVisible(haut: number, bas: number, debutVue: number, finVue: number): boolean` ; `ZoneVisibleContexte` (valeur `{ debut: number; fin: number } | null`, `null` = pas de défilement connu → toujours visible) ; hook `useZoneVisible()`.

- [ ] **Step 1: tests (doivent échouer)** — `src/ui/schemas/visibilite.test.ts` :

```ts
import { estVisible } from './visibilite';

describe('estVisible', () => {
  it('visible quand le schéma est dans la vue', () => {
    expect(estVisible(100, 200, 0, 800)).toBe(true);
  });
  it('visible quand il dépasse en partie', () => {
    expect(estVisible(750, 900, 0, 800)).toBe(true);
    expect(estVisible(-50, 20, 0, 800)).toBe(true);
  });
  it('caché quand il est entièrement au-dessus ou au-dessous', () => {
    expect(estVisible(900, 1000, 0, 800)).toBe(false);
    expect(estVisible(-200, -10, 0, 800)).toBe(false);
  });
  it('un bord qui touche juste la vue ne compte pas', () => {
    expect(estVisible(800, 900, 0, 800)).toBe(false);
  });
});
```

- [ ] **Step 2:** `npx jest src/ui/schemas/visibilite.test.ts` → FAIL.
- [ ] **Step 3:** `src/ui/schemas/visibilite.ts` :

```ts
/** Un schéma (de `haut` à `bas`) est visible s'il chevauche la vue (de `debutVue` à `finVue`). Coordonnées dans le contenu défilant. */
export function estVisible(haut: number, bas: number, debutVue: number, finVue: number): boolean {
  return bas > debutVue && haut < finVue;
}
```

- [ ] **Step 4:** PASS.
- [ ] **Step 5: contexte** — `src/ui/schemas/ZoneVisible.tsx` : `createContext<{ debut: number; fin: number } | null>(null)`, export `ZoneVisibleContexte` et `useZoneVisible()`. Dans `FondEcran` (mode `defilant`) : état `{ debut: scrollY, fin: scrollY + hauteurVue }` mis à jour par `onScroll` (`scrollEventThrottle={100}`) et `onLayout` du `ScrollView` ; fournir le contexte autour des enfants.
- [ ] **Step 6: SchemaAnime** — `onLayout` sur son cadre donne `y`/`height` relatifs au parent direct, pas au contenu défilant : utiliser une `ref` + `measureLayout` par rapport au conteneur de contenu, ou plus simple et robuste : `measureInWindow` à chaque changement de la zone visible et comparer avec la fenêtre (`0` → hauteur de l'écran via `useWindowDimensions`). Choisir `measureInWindow` : visible = `estVisible(yFenetre, yFenetre + hauteur, 0, hauteurEcran)`. Recalculer quand la valeur du contexte change (le défilement). Sans contexte (`null`) : `visible = true`.
- [ ] **Step 7:** passer `visible` aux trois composants de schéma ; `useTempsBoucle(duree, !immobile && visible)`.
- [ ] **Step 8:** `PAS_MS = 42`.
- [ ] **Step 9:** `npx tsc --noEmit`, `npx expo lint`, `npx jest` → verts.
- [ ] **Step 10:** commit `Met en pause les schémas animés qui ne sont pas à l'écran`.

---

### Task 4: Suivi des plantages avec Sentry (production uniquement)

**Files:**
- Modify: `package.json` (`@sentry/react-native` via `npx expo install @sentry/react-native`)
- Modify: `app.json` (plugin `@sentry/react-native/expo` **sans** organisation/projet/jeton — pas d'envoi de source maps dans ce chantier)
- Create: `src/surveillance/sentry.ts` (initialisation), `src/surveillance/filtre.ts` + `filtre.test.ts` (filtrage pur)
- Modify: `app/_layout.tsx` (appel d'initialisation ; rester ≤ 30 lignes)
- Create: `.env.example` (versionné) : `EXPO_PUBLIC_SENTRY_DSN=`
- Modify: `docs/build-android.md` (section « Suivi des plantages (Sentry) » : créer un compte gratuit sur sentry.io, projet React Native, copier le DSN dans `.env.local`, rebuild release)

**Interfaces:** Produces: `demarrerSurveillance(): void` ; `nettoyerFilAriane<T extends { category?: string; data?: Record<string, unknown> }>(miette: T): T | null`.

- [ ] **Step 1: tests (doivent échouer)** — `src/surveillance/filtre.test.ts` :

```ts
import { nettoyerFilAriane } from './filtre';

describe('nettoyerFilAriane', () => {
  it('supprime les appels réseau vers la recherche de pros et de villes (contiennent la position)', () => {
    expect(nettoyerFilAriane({ category: 'fetch', data: { url: 'https://overpass-api.de/api/interpreter?data=...' } })).toBeNull();
    expect(nettoyerFilAriane({ category: 'xhr', data: { url: 'https://nominatim.openstreetmap.org/search?q=Aubagne' } })).toBeNull();
  });
  it('garde les autres miettes', () => {
    const miette = { category: 'navigation', data: { to: '/tutos' } };
    expect(nettoyerFilAriane(miette)).toBe(miette);
  });
  it('garde un appel réseau sans rapport avec la position', () => {
    const miette = { category: 'fetch', data: { url: 'https://tiles.openfreemap.org/styles/dark' } };
    expect(nettoyerFilAriane(miette)).toBe(miette);
  });
});
```

Avant d'écrire la liste, vérifier dans `src/fonctionnalites/pros/` quels domaines reçoivent la position ou un lieu (serveurs Overpass de `SERVEURS_OVERPASS`, service de recherche de ville) et les mettre tous dans la liste ; adapter les URL des tests aux vrais domaines.

- [ ] **Step 2:** FAIL. **Step 3:** `src/surveillance/filtre.ts` : liste `DOMAINES_AVEC_POSITION` ; pour `category` `fetch`/`xhr`, si `data.url` contient un de ces domaines → `null`, sinon la miette telle quelle. **Step 4:** PASS.
- [ ] **Step 5:** `src/surveillance/sentry.ts` :

```ts
// Suivi des plantages : uniquement en production, et seulement si un DSN est fourni (.env.local).
import * as Sentry from '@sentry/react-native';
import { nettoyerFilAriane } from './filtre';

export function demarrerSurveillance(): void {
  const dsn = process.env.EXPO_PUBLIC_SENTRY_DSN;
  if (__DEV__ || !dsn) return;
  Sentry.init({
    dsn,
    sendDefaultPii: false,
    beforeBreadcrumb: (miette) => nettoyerFilAriane(miette),
  });
}
```

(Adapter le typage de `beforeBreadcrumb` à la version installée de Sentry si nécessaire, sans `any`.)
- [ ] **Step 6:** `app/_layout.tsx` : importer et appeler `demarrerSurveillance()` au niveau du module (avant le composant). Si Jest charge `app/_layout.tsx` quelque part, vérifier que rien ne casse (`__DEV__` est vrai sous Jest).
- [ ] **Step 7:** `app.json` : ajouter `"@sentry/react-native/expo"` à `plugins` (forme simple, sans options d'upload). Vérifier que `.gitignore` ignore `.env*.local` (déjà le cas) et que `.env.example` est bien versionné.
- [ ] **Step 8:** doc dans `docs/build-android.md` (texte simple, étapes numérotées, rappeler qu'aucune donnée personnelle n'est envoyée).
- [ ] **Step 9:** `npx tsc --noEmit`, `npx expo lint`, `npx jest` → verts.
- [ ] **Step 10:** commit `Ajoute le suivi des plantages Sentry en production`.

---

### Task 5: Scénarios de bout en bout Maestro

**Files:**
- Modify: écrans et composants qui ont besoin d'un repère (`testID`) — au minimum : `BoutonPrincipal` (accepter et transmettre une prop optionnelle `testID`), bouton « Diagnostiquer une panne » (`bouton-diagnostiquer`), poignée du panneau (`poignee-panneau`), ligne repliée (`panneau-replie`), `CarteRenvoi` (`carte-renvoi`), liste/cartes de pros de l'accueil et du résultat (`carte-pro`), séparateur Plan B (`separateur-plan-b`)
- Create: `e2e/diagnostic-wc.yaml`, `e2e/gaz.yaml`, `e2e/urgence-eau.yaml`, `e2e/tuto-plan-b.yaml`, `e2e/accueil-panneau.yaml`
- Modify: `package.json` (script `"e2e": "maestro test e2e/"`)
- Modify: `docs/build-android.md` (section « Tests de bout en bout (Maestro) »)

**Interfaces:** Consumes: identifiant d'appli `fr.depanneo.app`.

- [ ] **Step 1:** lire les écrans concernés (`src/fonctionnalites/accueil`, `diagnostic`, `urgences`, `tutos`, `src/ui/CarteRenvoi.tsx`, `src/ui/CartePro.tsx`) et les données (`src/donnees/diagnostics/wc-bouche.json`, `odeur-egout.json`, `src/donnees/gestesUrgence.ts`, `src/donnees/tutos.ts`) pour connaître les textes exacts des questions/réponses à toucher.
- [ ] **Step 2:** ajouter les `testID` (aucun changement visuel).
- [ ] **Step 3:** écrire les 5 scénarios (contenu exigé : voir la spec §2). Chaque fichier commence par :

```yaml
appId: fr.depanneo.app
---
- launchApp:
    clearState: true
```

puis utilise `tapOn` (texte ou `id:` = testID), `assertVisible`, `assertNotVisible`, `scrollUntilVisible`. Si l'appli demande la position au premier lancement, ajouter un `tapOn` optionnel (`optional: true`) sur le refus (« Ne pas autoriser » / « Refuser ») pour ne pas dépendre de la position. `gaz.yaml` doit vérifier `assertNotVisible: { id: "carte-pro" }` sur le résultat rouge et `assertVisible: "0800 47 33 33"` sur la fiche gaz.
- [ ] **Step 4:** valider la syntaxe : si Maestro est installé (`maestro --version`), lancer `maestro test e2e/` contre l'appli installée (`adb devices` doit montrer un appareil) ; sinon, le dire dans le rapport — le contrôleur fera l'essai avec André.
- [ ] **Step 5:** doc `docs/build-android.md` : installer Maestro (une fois, lien officiel https://maestro.mobile.dev), construire et installer l'APK release (`cd android && ./gradlew assembleRelease`, puis `adb install -r app/build/outputs/apk/release/app-release.apk`), lancer `npm run e2e`.
- [ ] **Step 6:** `npx tsc --noEmit`, `npx expo lint`, `npx jest` → verts.
- [ ] **Step 7:** commit `Ajoute les scénarios de bout en bout Maestro`.

---

### Task 6 (contrôleur, avec André): publication et premier passage de la CI

- [ ] Demander à André son accord explicite pour créer le dépôt **public** `elios134/depanneo` et y pousser `main`.
- [ ] `gh repo create elios134/depanneo --public --source . --remote origin --description "Dépannéo — diagnostic et dépannage plomberie / électricité à la maison"` puis `git push -u origin main`.
- [ ] Suivre le premier passage du workflow `Vérification` (`gh run watch`) ; s'il échoue, corriger (cause la plus probable : types de routes Expo, voir spec §1).
- [ ] Avec André : créer le compte Sentry, coller le DSN dans `.env.local`, build release, installer, provoquer une erreur de test temporaire, vérifier sa réception sans donnée personnelle, retirer l'erreur.
- [ ] Avec André : installer Maestro, lancer `npm run e2e` sur son téléphone.
