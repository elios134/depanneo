# Chantier A — Design et navigation — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refaire toute l'interface de Dépann'Maison au style SC Fleet Manager (sombre/clair, verre dépoli, barre de navigation flottante à 5 onglets) avec le contenu existant, selon les maquettes validées.

**Architecture:** Les routes Expo Router (`app/`) deviennent des fichiers minces qui rendent des écrans situés dans `src/fonctionnalites/<fonctionnalité>/`. Un thème (tokens sombre/clair) et des réglages (AsyncStorage) sont fournis par deux contextes React. La logique pure (parcours de diagnostic, recherche, réglages, résolution du thème) est dans des fichiers `lib/` testés avec Jest.

**Tech Stack:** Expo SDK 57, React Native 0.86, Expo Router (Tabs + Stack), TypeScript strict, Jest (`jest-expo`), `lucide-react-native` + `react-native-svg`, `expo-blur`, `@react-native-async-storage/async-storage`.

**Spec:** [docs/superpowers/specs/2026-09-30-depannmaison-v2-design.md](../specs/2026-09-30-depannmaison-v2-design.md) — maquettes : [docs/design/maquettes-v2/](../../design/maquettes-v2/)

## Global Constraints

- Tout en français : textes affichés, noms métier, messages de commit (simples, sans jargon). Chaque commit se termine par une ligne `Co-Authored-By:` du modèle qui l'écrit.
- **Les maquettes font foi pour le visuel** (`docs/design/maquettes-v2/1-accueil.html`, `2-parcours-diagnostic.html`, `3-autres-ecrans.html`, `4-icones.html`).
- **Aucune couleur en dur hors de `src/theme/`** (ni `#xxxxxx` ni `rgba(`) : toujours `useTheme().couleurs` ou `teinte()`.
- Fichiers `app/` : aucune logique ni style, ≤ 30 lignes. Composant 80–150 lignes (plafond ~250), écran 150–250 (plafond ~350), hook/lib 100–200 (plafond ~300).
- `lib/` = logique pure sans React, testée. Tests à côté du fichier testé (`x.ts` → `x.test.ts`).
- Imports internes via l'alias `@/` (= `src/`), jamais de `../../` vers `src/`.
- TypeScript `strict` + `noUnusedLocals` + `noUnusedParameters` : `npx tsc --noEmit` doit sortir 0 erreur.
- Dépendances autorisées pour ce chantier : `lucide-react-native`, `react-native-svg`, `expo-blur`, `@react-native-async-storage/async-storage`. Aucune autre.
- Règles de sécurité CLAUDE.md inchangées ; les gestes d'urgence (dont gaz) doivent rester à 1 appui depuis n'importe quel écran (onglet Urgences, tâche 13).
- Vérification de chaque tâche : `npm test` et `npx tsc --noEmit`, après avoir régénéré les types des routes avec `npx expo start`. `npx expo export` sert seulement à vérifier que le bundle web se construit, jamais à régénérer les types.
- Ne jamais committer `dist-check/`, `.expo/`, `node_modules/`, `.superpowers/`.

### Écarts assumés du chantier A (décisions de ce plan)

- Accueil : fond de carte **factice** ; bouton « recentrer » et liste de pros **absents** (ajoutés au chantier B, où ils ont une fonction).
- Accueil : une ligne d'avertissement « Conseils uniquement — ne remplace pas un professionnel. » sous le bouton Diagnostic (règle CLAUDE.md « afficher un avertissement »), en plus de l'écran À propos.
- Réglages : la ligne « Ville par défaut » arrive au chantier B (elle dépend du géocodage). Rayon et localisation sont enregistrés mais n'ont d'effet qu'au chantier B.
- Pendant les tâches 4 à 12, l'appli est dans un état transitoire (anciens écrans V1 sans en-tête, routes pas encore regroupées en onglets). L'état final est atteint à la tâche 13.

---

## File Structure

```
app/                                     (état final, tâche 13)
  _layout.tsx                            providers Réglages + Thème, Stack racine sans en-tête
  (onglets)/_layout.tsx                  Tabs + tabBar={BarreNavigation}
  (onglets)/(accueil)/_layout.tsx        Stack
  (onglets)/(accueil)/index.tsx          → EcranAccueil
  (onglets)/(accueil)/diagnostic/index.tsx → EcranChoixPanne
  (onglets)/(accueil)/diagnostic/[id].tsx  → EcranDiagnostic
  (onglets)/urgences/_layout.tsx, index.tsx, [id].tsx
  (onglets)/tutos/_layout.tsx, index.tsx, [id].tsx
  (onglets)/pros.tsx
  (onglets)/reglages/_layout.tsx, index.tsx, a-propos.tsx
src/
  theme/        tokens.ts, teinte.ts, resoudreTheme.ts, couleurCategorie.ts, ThemeProvider.tsx, couleursEnDur.test.ts
  ui/           Icone.tsx, FondEcran.tsx, Verre.tsx, EnTete.tsx, Pastille.tsx, CarteListe.tsx,
                BoutonPrincipal.tsx, Onglets.tsx, EtapesList.tsx, NumeroUrgence.tsx, VerdictBadge.tsx
  navigation/   BarreNavigation.tsx
  domaine/      types.ts, icones.ts, diagnosticEngine.ts, validateDiagnostic.ts (+ tests)
  donnees/      diagnostics/*.json + index.ts, gestesUrgence.ts, tutos.ts, numerosUtiles.ts (+ tests)
  fonctionnalites/
    accueil/    EcranAccueil.tsx, components/FondCarte.tsx, components/Logo.tsx, components/PanneauAccueil.tsx
    diagnostic/ EcranChoixPanne.tsx, EcranDiagnostic.tsx,
                components/CarteQuestion.tsx, components/CarteResultat.tsx, components/BarreProgression.tsx,
                hooks/useParcoursDiagnostic.ts, lib/parcours.ts, lib/recherche.ts (+ tests)
    urgences/   EcranUrgences.tsx, EcranGeste.tsx
    tutos/      EcranTutos.tsx, EcranTuto.tsx
    pros/       EcranPros.tsx
    reglages/   EcranReglages.tsx, EcranAPropos.tsx, ReglagesProvider.tsx, lib/reglages.ts (+ test)
```

---

### Task 1: Déplacement pur vers `src/`, alias `@/`, TypeScript plus strict, CLAUDE.md

**Files:**
- Move: `lib/types.ts` → `src/domaine/types.ts` ; `lib/diagnosticEngine.ts` → `src/domaine/diagnosticEngine.ts` ; `lib/validateDiagnostic.ts` → `src/domaine/validateDiagnostic.ts`
- Move: `data/diagnostics/` → `src/donnees/diagnostics/` ; `data/gestesUrgence.ts` → `src/donnees/gestesUrgence.ts` ; `data/tutos.ts` → `src/donnees/tutos.ts`
- Move: `components/*.tsx` → `src/ui/` (EtapesList, NumeroUrgence, VerdictBadge)
- Move tests: `__tests__/diagnosticEngine.test.ts` → `src/domaine/diagnosticEngine.test.ts` ; `__tests__/validateDiagnostic.test.ts` → `src/domaine/validateDiagnostic.test.ts` ; `__tests__/diagnostics.data.test.ts` → `src/donnees/diagnostics.data.test.ts` ; `__tests__/gestesEtTutos.data.test.ts` → `src/donnees/gestesEtTutos.data.test.ts`
- Delete: `__tests__/sanity.test.ts`, dossiers vides `lib/`, `data/`, `components/`, `__tests__/`
- Modify: `tsconfig.json`, `package.json` (jest), tous les fichiers de `app/` (imports), `CLAUDE.md`

**Interfaces:**
- Produces: alias `@/…` → `src/…` utilisable dans `app/`, `src/` et Jest. Chemins : `@/domaine/types`, `@/domaine/diagnosticEngine`, `@/domaine/validateDiagnostic`, `@/donnees/diagnostics`, `@/donnees/gestesUrgence`, `@/donnees/tutos`, `@/ui/EtapesList`, `@/ui/NumeroUrgence`, `@/ui/VerdictBadge`.

- [ ] **Step 1: Déplacer les fichiers avec git**

```bash
mkdir -p src/domaine src/donnees src/ui
git mv lib/types.ts src/domaine/types.ts
git mv lib/diagnosticEngine.ts src/domaine/diagnosticEngine.ts
git mv lib/validateDiagnostic.ts src/domaine/validateDiagnostic.ts
git mv data/diagnostics src/donnees/diagnostics
git mv data/gestesUrgence.ts src/donnees/gestesUrgence.ts
git mv data/tutos.ts src/donnees/tutos.ts
git mv components/EtapesList.tsx src/ui/EtapesList.tsx
git mv components/NumeroUrgence.tsx src/ui/NumeroUrgence.tsx
git mv components/VerdictBadge.tsx src/ui/VerdictBadge.tsx
git mv __tests__/diagnosticEngine.test.ts src/domaine/diagnosticEngine.test.ts
git mv __tests__/validateDiagnostic.test.ts src/domaine/validateDiagnostic.test.ts
git mv __tests__/diagnostics.data.test.ts src/donnees/diagnostics.data.test.ts
git mv __tests__/gestesEtTutos.data.test.ts src/donnees/gestesEtTutos.data.test.ts
git rm __tests__/sanity.test.ts
```

- [ ] **Step 2: Ajouter l'alias et les options strictes dans `tsconfig.json`**

```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "types": ["jest"],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": [
    "**/*.ts",
    "**/*.tsx",
    ".expo/types/**/*.ts",
    "expo-env.d.ts"
  ]
}
```

- [ ] **Step 3: Déclarer l'alias pour Jest dans `package.json`**

Remplacer le bloc `"jest"` par :

```json
  "jest": {
    "preset": "jest-expo",
    "moduleNameMapper": {
      "^@/(.*)$": "<rootDir>/src/$1"
    }
  }
```

- [ ] **Step 4: Corriger tous les imports**

Dans `src/`, les imports relatifs internes restent valides sauf ceux qui traversent des dossiers : remplacer chaque import vers `lib/`, `data/`, `components/` par l'alias. Exemples exacts :
- `src/donnees/diagnostics/index.ts` : `import type { Diagnostic } from '../../lib/types';` → `import type { Diagnostic } from '@/domaine/types';`
- `src/donnees/gestesUrgence.ts` et `src/donnees/tutos.ts` : `'../lib/types'` → `'@/domaine/types'`
- `src/ui/VerdictBadge.tsx` : `'../lib/types'` → `'@/domaine/types'`
- tests déplacés : `'../lib/validateDiagnostic'` → `'@/domaine/validateDiagnostic'`, `'../lib/diagnosticEngine'` → `'@/domaine/diagnosticEngine'`, `'../lib/types'` → `'@/domaine/types'`, `'../data/diagnostics'` → `'@/donnees/diagnostics'`, `'../data/gestesUrgence'` → `'@/donnees/gestesUrgence'`, `'../data/tutos'` → `'@/donnees/tutos'`
- fichiers `app/**` : tout import `../components/X`, `../../components/X` → `@/ui/X` ; `../data/…`, `../../data/…` → `@/donnees/…` ; `../lib/…`, `../../lib/…` → `@/domaine/…`

Vérifier qu'il ne reste rien : `grep -rn "lib/\|data/\|components/" app src --include=*.ts --include=*.tsx` ne doit rien afficher (hors chaînes sans rapport).

- [ ] **Step 5: Corriger ce que `noUnusedLocals`/`noUnusedParameters` signalent**

Run: `npx tsc --noEmit`
Expected: 0 erreur. Si une variable/paramètre inutilisé est signalé, le supprimer (ne pas le renommer en `_x`).

- [ ] **Step 6: Mettre à jour `CLAUDE.md`**

Remplacer les sections « L'idée en une phrase », « Fonctionnalités », « Stack technique » et ajouter « Architecture du code » selon ce texte exact (garder « Contexte », « Public visé », « Règles de sécurité », « Règles de travail pour Claude Code » et y ajouter les deux lignes indiquées) :

```markdown
## L'idée en une phrase
Une appli mobile grand public qui aide les gens face à une panne de **plomberie sanitaire** ou d'**électricité basique** à la maison : diagnostic simple, gestes d'urgence, mini-tutos, et les plombiers/électriciens les plus proches sur une carte.

## Fonctionnalités
- **Diagnostic guidé** (22 pannes : 16 plomberie, 6 électricité) → verdict 🟢 je peux réparer / 🟠 je sécurise en attendant / 🔴 j'appelle un pro tout de suite.
- **Urgences** (onglet dédié, 1 appui depuis partout) : couper l'eau, couper le courant, « Odeur de gaz ? » (filet de sécurité : consignes + numéro d'urgence gaz), numéros utiles.
- **Tutos** pas à pas pour les réparations faciles.
- **Carte des pros** (OpenStreetMap) : plombiers et électriciens proches, appel en 1 appui.
- **Réglages** : thème sombre/clair/auto, rayon de recherche, localisation.
- Le diagnostic, les urgences et les tutos **fonctionnent sans réseau**.
- Plus tard : annuaire de pros partenaires, carnet d'entretien, photo analysée par IA.

## Stack technique
- React Native + Expo (Expo Router), TypeScript strict.
- Design : style SC Fleet Manager (sombre, verre dépoli, barre de navigation flottante), icônes Lucide.
- Données des pannes : JSON embarqués. Carte : MapLibre + OpenFreeMap. Pros : Overpass (OpenStreetMap).

## Architecture du code
- `app/` = routes uniquement (fichiers ≤ 30 lignes). Écrans dans `src/fonctionnalites/<nom>/`, partagé (≥ 2 fonctionnalités) dans `src/ui/`, thème dans `src/theme/`, types et moteur dans `src/domaine/`, données dans `src/donnees/`.
- Tailles cibles : composant 80–150 lignes (plafond ~250), écran 150–250 (~350), hook/lib 100–200 (~300).
- Aucune couleur en dur hors de `src/theme/` (un test le vérifie). Logique pure dans `lib/`, testée ; tests à côté du fichier.
- Spec de référence : `docs/superpowers/specs/2026-09-30-depannmaison-v2-design.md`.
```

Et ajouter à la fin de « Règles de travail pour Claude Code » :

```markdown
- Aucun écran ni changement visuel sans maquette validée par André (maquettes dans `docs/design/`).
- Périmètre : plomberie sanitaire + électricité basique ; le gaz se limite au filet de sécurité de l'onglet Urgences.
```

- [ ] **Step 7: Vérifier**

Run: `npm test` → PASS (mêmes tests qu'avant moins `sanity`, soit 28 tests) ; `npx tsc --noEmit` → 0 erreur ; `npx expo export --platform web --output-dir dist-check` → succès, puis `rm -rf dist-check`.

- [ ] **Step 8: Commit**

```bash
git add -A src app tsconfig.json package.json CLAUDE.md
git status --short   # vérifier : aucun dist-check, .expo, node_modules
git commit -m "Range le code dans src/ et met à jour CLAUDE.md pour la V2"
```

---

### Task 2: Modèle de données V2 (catégorie, icônes Lucide, mots-clés) et suppression gaz/chaudière

**Files:**
- Create: `src/domaine/icones.ts`
- Modify: `src/domaine/types.ts`, `src/domaine/validateDiagnostic.ts`, `src/domaine/validateDiagnostic.test.ts`
- Modify: les 6 JSON conservés de `src/donnees/diagnostics/`, `src/donnees/diagnostics/index.ts`, `src/donnees/gestesUrgence.ts`, `src/donnees/tutos.ts`
- Modify: `src/donnees/diagnostics.data.test.ts`, `src/donnees/gestesEtTutos.data.test.ts`
- Delete: `src/donnees/diagnostics/odeur-gaz.json`, `src/donnees/diagnostics/chaudiere-en-panne.json`

**Interfaces:**
- Consumes: types de la tâche 1.
- Produces:
  - `src/domaine/icones.ts` : `export const NOMS_ICONES` (tableau `as const`, liste exacte ci-dessous), `export type NomIcone = (typeof NOMS_ICONES)[number]`, `export function estNomIcone(nom: string): nom is NomIcone`
  - `src/domaine/types.ts` : `export type Categorie = 'plomberie' | 'electricite'` ; `Reponse { texte: string; suite: string; inconnu?: boolean }` ; `Diagnostic { id; titre; categorie: Categorie; icone: NomIcone; motsCles: string[]; etapeInitiale; etapes; resultats }` ; `Tuto { id; titre; categorie: Categorie; icone: NomIcone; duree: string; outil: string; etapes: string[] }` ; `GesteUrgence { id; titre; icone: NomIcone; etapes: string[]; numeroUtile?: string }` ; `Etape`, `Resultat`, `Verdict` inchangés.
  - `export const CATEGORIES: Categorie[] = ['plomberie', 'electricite']` dans `types.ts`.

- [ ] **Step 1: Écrire les nouveaux tests de validation (failing)**

Dans `src/domaine/validateDiagnostic.test.ts` **et** `src/domaine/diagnosticEngine.test.ts`, ajouter `categorie: 'plomberie', icone: 'droplets', motsCles: ['fuite'],` à **chaque** objet `Diagnostic` déjà présent (sinon tsc échoue). Puis ajouter à la fin du `describe` de `validateDiagnostic.test.ts` :

```typescript
  const base = (): Diagnostic => ({
    id: 'test',
    titre: 'Test',
    categorie: 'plomberie',
    icone: 'droplets',
    motsCles: ['fuite'],
    etapeInitiale: 'q1',
    etapes: { q1: { question: 'Q1', reponses: [{ texte: 'A', suite: 'r1' }] } },
    resultats: { r1: { verdict: 'vert', titre: 'OK', conseil: 'ok' } },
  });

  it('refuse une catégorie inconnue', () => {
    const diag = { ...base(), categorie: 'gaz' as unknown as Diagnostic['categorie'] };
    expect(validerDiagnostic(diag).join(' ')).toContain('catégorie');
  });

  it('refuse une icône inconnue', () => {
    const diag = { ...base(), icone: '💧' as unknown as Diagnostic['icone'] };
    expect(validerDiagnostic(diag).join(' ')).toContain('icône');
  });

  it('refuse une liste de mots-clés vide', () => {
    const diag = { ...base(), motsCles: [] };
    expect(validerDiagnostic(diag).join(' ')).toContain('mots-clés');
  });

  it('accepte un diagnostic complet', () => {
    expect(validerDiagnostic(base())).toEqual([]);
  });
```

- [ ] **Step 2: Lancer et constater l'échec**

Run: `npx jest src/domaine/validateDiagnostic.test.ts`
Expected: FAIL (propriétés `categorie`/`icone`/`motsCles` inconnues ou règles absentes).

- [ ] **Step 3: Créer `src/domaine/icones.ts`**

```typescript
export const NOMS_ICONES = [
  'droplets', 'toilet', 'waves', 'heater', 'hourglass', 'rotate-cw', 'circle-x', 'wrench',
  'droplet', 'gauge', 'shower-head', 'wind', 'cylinder', 'droplet-off', 'bath', 'audio-waveform',
  'toggle-left', 'zap-off', 'door-open', 'plug', 'lightbulb-off', 'lightbulb',
  'house', 'triangle-alert', 'book-open', 'map-pin', 'settings', 'stethoscope', 'phone',
  'locate-fixed', 'search', 'rotate-ccw', 'shield-alert', 'hard-hat', 'flame', 'power', 'siren',
  'chevron-right', 'chevron-left', 'x', 'zap',
] as const;

export type NomIcone = (typeof NOMS_ICONES)[number];

export function estNomIcone(nom: string): nom is NomIcone {
  return (NOMS_ICONES as readonly string[]).includes(nom);
}
```

- [ ] **Step 4: Mettre à jour `src/domaine/types.ts`**

```typescript
import type { NomIcone } from './icones';

export type Verdict = 'vert' | 'orange' | 'rouge';

export type Categorie = 'plomberie' | 'electricite';

export const CATEGORIES: Categorie[] = ['plomberie', 'electricite'];

export interface Reponse {
  texte: string;
  suite: string;
  inconnu?: boolean;
}

export interface Etape {
  question: string;
  reponses: Reponse[];
}

export interface Resultat {
  verdict: Verdict;
  titre: string;
  conseil: string;
  tutoId?: string;
  gesteUrgenceId?: string;
  numeroUtile?: string;
}

export interface Diagnostic {
  id: string;
  titre: string;
  categorie: Categorie;
  icone: NomIcone;
  motsCles: string[];
  etapeInitiale: string;
  etapes: Record<string, Etape>;
  resultats: Record<string, Resultat>;
}

export interface GesteUrgence {
  id: string;
  titre: string;
  icone: NomIcone;
  etapes: string[];
  numeroUtile?: string;
}

export interface Tuto {
  id: string;
  titre: string;
  categorie: Categorie;
  icone: NomIcone;
  duree: string;
  outil: string;
  etapes: string[];
}
```

- [ ] **Step 5: Ajouter les règles dans `src/domaine/validateDiagnostic.ts`**

Ajouter les imports `import { estNomIcone } from './icones';` et `CATEGORIES` depuis `./types`, puis juste avant `return erreurs;` :

```typescript
  if (!CATEGORIES.includes(diag.categorie)) {
    erreurs.push(`Diagnostic "${diag.id}": catégorie "${diag.categorie}" invalide`);
  }
  if (typeof diag.icone !== 'string' || !estNomIcone(diag.icone)) {
    erreurs.push(`Diagnostic "${diag.id}": icône "${diag.icone}" inconnue`);
  }
  if (!Array.isArray(diag.motsCles) || diag.motsCles.length === 0) {
    erreurs.push(`Diagnostic "${diag.id}": mots-clés manquants`);
  }
```

- [ ] **Step 6: Lancer le test de validation**

Run: `npx jest src/domaine/validateDiagnostic.test.ts`
Expected: PASS.

- [ ] **Step 7: Supprimer les diagnostics gaz et chaudière, migrer les 6 JSON**

```bash
git rm src/donnees/diagnostics/odeur-gaz.json src/donnees/diagnostics/chaudiere-en-panne.json
```

Dans chacun des 6 JSON restants, **remplacer** la ligne `"icone": …` par les trois lignes indiquées (reste du fichier inchangé) :

| Fichier | Lignes à mettre à la place de `"icone"` |
|---|---|
| `fuite-eau.json` | `"categorie": "plomberie", "icone": "droplets", "motsCles": ["fuite", "eau", "goutte", "plafond", "compteur", "tuyau"],` |
| `wc-bouche.json` | `"categorie": "plomberie", "icone": "toilet", "motsCles": ["wc", "toilettes", "bouché", "cuvette"],` |
| `evier-bouche.json` | `"categorie": "plomberie", "icone": "waves", "motsCles": ["évier", "lavabo", "bouché", "écoulement"],` |
| `pas-eau-chaude.json` | `"categorie": "plomberie", "icone": "heater", "motsCles": ["eau chaude", "chauffe-eau", "ballon", "froide"],` |
| `disjoncteur-saute.json` | `"categorie": "electricite", "icone": "toggle-left", "motsCles": ["disjoncteur", "saute", "tableau", "plombs"],` |
| `plus-de-courant.json` | `"categorie": "electricite", "icone": "zap-off", "motsCles": ["courant", "électricité", "coupure", "noir"],` |

(Écrire chaque clé sur sa propre ligne, JSON valide.)

- [ ] **Step 8: Mettre à jour `src/donnees/diagnostics/index.ts`**

```typescript
import type { Diagnostic } from '@/domaine/types';
import fuiteEau from './fuite-eau.json';
import wcBouche from './wc-bouche.json';
import evierBouche from './evier-bouche.json';
import pasEauChaude from './pas-eau-chaude.json';
import disjoncteurSaute from './disjoncteur-saute.json';
import plusDeCourant from './plus-de-courant.json';

export const diagnostics: Diagnostic[] = [
  fuiteEau as Diagnostic,
  wcBouche as Diagnostic,
  evierBouche as Diagnostic,
  pasEauChaude as Diagnostic,
  disjoncteurSaute as Diagnostic,
  plusDeCourant as Diagnostic,
];
```

- [ ] **Step 9: Ajouter les champs aux gestes et tutos**

`src/donnees/gestesUrgence.ts` : ajouter `icone` à chaque geste et renommer le titre du gaz (étapes et numéro inchangés) :
- `couper-eau` : `icone: 'droplets',`
- `couper-courant` : `icone: 'power',`
- `couper-gaz` : `titre: 'Odeur de gaz ?',` et `icone: 'flame',`

`src/donnees/tutos.ts` : ajouter à chaque tuto (étapes inchangées) :
- `deboucher-evier` : `categorie: 'plomberie', icone: 'waves', duree: '10 min', outil: 'furet',`
- `deboucher-wc` : `categorie: 'plomberie', icone: 'toilet', duree: '5 min', outil: 'ventouse',`
- `changer-joint` : `categorie: 'plomberie', icone: 'wrench', duree: '15 min', outil: 'clé',`
- `reparer-disjoncteur` : `categorie: 'electricite', icone: 'toggle-left', duree: '2 min', outil: 'aucun',`

- [ ] **Step 10: Mettre à jour les tests de données**

`src/donnees/diagnostics.data.test.ts` : remplacer le test « contient exactement 8 diagnostics » par :

```typescript
  it('contient les 6 diagnostics conservés, sans gaz ni chaudière', () => {
    expect(diagnostics.map((d) => d.id).sort()).toEqual([
      'disjoncteur-saute', 'evier-bouche', 'fuite-eau', 'pas-eau-chaude', 'plus-de-courant', 'wc-bouche',
    ]);
  });
```

et **supprimer** le test « le diagnostic "odeur-gaz" aboutit toujours à un verdict rouge » (le test général sur `couper-gaz` est conservé).

`src/donnees/gestesEtTutos.data.test.ts` : ajouter à la fin du `describe` (et `import { estNomIcone } from '@/domaine/icones';` + `import { CATEGORIES } from '@/domaine/types';` en tête) :

```typescript
  it('chaque geste et chaque tuto a une icône connue', () => {
    for (const g of gestesUrgence) expect(estNomIcone(g.icone)).toBe(true);
    for (const t of tutos) expect(estNomIcone(t.icone)).toBe(true);
  });

  it('chaque tuto a une catégorie, une durée et un outil', () => {
    for (const t of tutos) {
      expect(CATEGORIES).toContain(t.categorie);
      expect(t.duree.length).toBeGreaterThan(0);
      expect(t.outil.length).toBeGreaterThan(0);
    }
  });

  it('le geste gaz s\'appelle « Odeur de gaz ? »', () => {
    expect(gestesUrgence.find((g) => g.id === 'couper-gaz')!.titre).toBe('Odeur de gaz ?');
  });
```

- [ ] **Step 11: Vérifier**

Run: `npm test` → PASS ; `npx tsc --noEmit` → 0 erreur ; export web → succès, `rm -rf dist-check`.
Note : l'ancien écran V1 de liste des diagnostics affichera temporairement le nom de l'icône (« droplets ») au lieu d'un emoji ; il est remplacé à la tâche 11. C'est accepté.

- [ ] **Step 12: Commit**

```bash
git add -A src
git commit -m "Passe les données au modèle V2 et retire le gaz et la chaudière des diagnostics"
```

---

### Task 3: Réglages (logique pure + stockage sur le téléphone)

**Files:**
- Create: `src/fonctionnalites/reglages/lib/reglages.ts`, `src/fonctionnalites/reglages/lib/reglages.test.ts`, `src/fonctionnalites/reglages/ReglagesProvider.tsx`
- Modify: `app/_layout.tsx`, `package.json` (dépendance)

**Interfaces:**
- Produces:
  - `export type ModeTheme = 'sombre' | 'clair' | 'auto'`
  - `export type RayonKm = 5 | 10 | 20`
  - `export interface Reglages { theme: ModeTheme; rayonKm: RayonKm; localisation: boolean; villeParDefaut: string | null }`
  - `export const REGLAGES_DEFAUT: Reglages`, `export const CLE_REGLAGES = 'depannmaison.reglages'`
  - `export function lireReglages(brut: string | null): Reglages`, `export function ecrireReglages(r: Reglages): string`
  - `ReglagesProvider` (composant) et `useReglages(): { reglages: Reglages; modifier: (partiel: Partial<Reglages>) => void }`

- [ ] **Step 1: Installer la dépendance**

```bash
npx expo install @react-native-async-storage/async-storage
```

- [ ] **Step 2: Écrire les tests (failing)**

```typescript
// src/fonctionnalites/reglages/lib/reglages.test.ts
import { ecrireReglages, lireReglages, REGLAGES_DEFAUT } from './reglages';

describe('réglages', () => {
  it('renvoie les valeurs par défaut sans données', () => {
    expect(lireReglages(null)).toEqual(REGLAGES_DEFAUT);
  });

  it('a pour défauts : thème sombre, 10 km, localisation activée, pas de ville', () => {
    expect(REGLAGES_DEFAUT).toEqual({ theme: 'sombre', rayonKm: 10, localisation: true, villeParDefaut: null });
  });

  it('renvoie les défauts si le texte stocké est illisible', () => {
    expect(lireReglages('{pas du json')).toEqual(REGLAGES_DEFAUT);
  });

  it('complète un réglage partiel avec les défauts', () => {
    expect(lireReglages(JSON.stringify({ theme: 'clair' }))).toEqual({ ...REGLAGES_DEFAUT, theme: 'clair' });
  });

  it('ignore une valeur invalide et garde le défaut de ce champ', () => {
    const lu = lireReglages(JSON.stringify({ theme: 'rose', rayonKm: 7, localisation: 'oui', villeParDefaut: 42 }));
    expect(lu).toEqual(REGLAGES_DEFAUT);
  });

  it('relit exactement ce qui a été écrit', () => {
    const r = { theme: 'auto' as const, rayonKm: 20 as const, localisation: false, villeParDefaut: 'Marseille' };
    expect(lireReglages(ecrireReglages(r))).toEqual(r);
  });
});
```

- [ ] **Step 3: Lancer et constater l'échec**

Run: `npx jest src/fonctionnalites/reglages`
Expected: FAIL (module `./reglages` introuvable).

- [ ] **Step 4: Implémenter `reglages.ts`**

```typescript
// src/fonctionnalites/reglages/lib/reglages.ts
export type ModeTheme = 'sombre' | 'clair' | 'auto';
export type RayonKm = 5 | 10 | 20;

export interface Reglages {
  theme: ModeTheme;
  rayonKm: RayonKm;
  localisation: boolean;
  villeParDefaut: string | null;
}

export const REGLAGES_DEFAUT: Reglages = {
  theme: 'sombre',
  rayonKm: 10,
  localisation: true,
  villeParDefaut: null,
};

export const CLE_REGLAGES = 'depannmaison.reglages';

const MODES: ModeTheme[] = ['sombre', 'clair', 'auto'];
const RAYONS: RayonKm[] = [5, 10, 20];

export function lireReglages(brut: string | null): Reglages {
  if (!brut) return REGLAGES_DEFAUT;
  let donnees: Record<string, unknown>;
  try {
    const parse: unknown = JSON.parse(brut);
    if (typeof parse !== 'object' || parse === null) return REGLAGES_DEFAUT;
    donnees = parse as Record<string, unknown>;
  } catch {
    return REGLAGES_DEFAUT;
  }
  return {
    theme: MODES.includes(donnees.theme as ModeTheme) ? (donnees.theme as ModeTheme) : REGLAGES_DEFAUT.theme,
    rayonKm: RAYONS.includes(donnees.rayonKm as RayonKm) ? (donnees.rayonKm as RayonKm) : REGLAGES_DEFAUT.rayonKm,
    localisation: typeof donnees.localisation === 'boolean' ? donnees.localisation : REGLAGES_DEFAUT.localisation,
    villeParDefaut:
      typeof donnees.villeParDefaut === 'string' ? donnees.villeParDefaut : REGLAGES_DEFAUT.villeParDefaut,
  };
}

export function ecrireReglages(r: Reglages): string {
  return JSON.stringify(r);
}
```

- [ ] **Step 5: Lancer les tests**

Run: `npx jest src/fonctionnalites/reglages`
Expected: PASS (6 tests).

- [ ] **Step 6: Créer le provider**

```tsx
// src/fonctionnalites/reglages/ReglagesProvider.tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { CLE_REGLAGES, ecrireReglages, lireReglages, REGLAGES_DEFAUT, type Reglages } from './lib/reglages';

interface ContexteReglages {
  reglages: Reglages;
  modifier: (partiel: Partial<Reglages>) => void;
}

const Contexte = createContext<ContexteReglages | null>(null);

export function ReglagesProvider({ children }: { children: ReactNode }) {
  const [reglages, setReglages] = useState<Reglages>(REGLAGES_DEFAUT);

  useEffect(() => {
    AsyncStorage.getItem(CLE_REGLAGES)
      .then((brut) => setReglages(lireReglages(brut)))
      .catch(() => setReglages(REGLAGES_DEFAUT));
  }, []);

  const modifier = (partiel: Partial<Reglages>) => {
    setReglages((actuels) => {
      const nouveaux = { ...actuels, ...partiel };
      AsyncStorage.setItem(CLE_REGLAGES, ecrireReglages(nouveaux)).catch(() => undefined);
      return nouveaux;
    });
  };

  return <Contexte.Provider value={{ reglages, modifier }}>{children}</Contexte.Provider>;
}

export function useReglages(): ContexteReglages {
  const valeur = useContext(Contexte);
  if (!valeur) throw new Error('useReglages doit être utilisé dans ReglagesProvider');
  return valeur;
}
```

- [ ] **Step 7: Brancher le provider dans `app/_layout.tsx`**

Envelopper le `<Stack>` existant (ses `Stack.Screen` restent identiques) :

```tsx
import { Stack } from 'expo-router';
import { ReglagesProvider } from '@/fonctionnalites/reglages/ReglagesProvider';

export default function RootLayout() {
  return (
    <ReglagesProvider>
      <Stack>
        <Stack.Screen name="index" options={{ title: 'Dépann\'Maison' }} />
        <Stack.Screen name="diagnostics/index" options={{ title: 'Diagnostiquer une panne' }} />
        <Stack.Screen name="diagnostics/[id]" options={{ title: 'Diagnostic' }} />
        <Stack.Screen name="urgences/[id]" options={{ title: 'Geste d\'urgence' }} />
        <Stack.Screen name="tutos/[id]" options={{ title: 'Tuto' }} />
      </Stack>
    </ReglagesProvider>
  );
}
```

- [ ] **Step 8: Vérifier et committer**

Run: `npm test`, `npx tsc --noEmit`, export web → tout vert ; `rm -rf dist-check`.

```bash
git add src/fonctionnalites/reglages app/_layout.tsx package.json package-lock.json
git commit -m "Ajoute les réglages enregistrés sur le téléphone"
```

---

### Task 4: Thème sombre/clair et composant `Icone`

**Files:**
- Create: `src/theme/tokens.ts`, `src/theme/teinte.ts`, `src/theme/teinte.test.ts`, `src/theme/resoudreTheme.ts`, `src/theme/resoudreTheme.test.ts`, `src/theme/couleurCategorie.ts`, `src/theme/ThemeProvider.tsx`, `src/ui/Icone.tsx`
- Modify: `app/_layout.tsx`, `package.json`

**Interfaces:**
- Consumes: `useReglages()` et `ModeTheme` (tâche 3), `NomIcone` (tâche 2), `Categorie` (tâche 2).
- Produces:
  - `export type NomTheme = 'sombre' | 'clair'` ; `export interface Couleurs` (champs listés ci-dessous) ; `export const COULEURS: Record<NomTheme, Couleurs>`
  - `export function teinte(hex: string, alpha: number): string` (`'#2ee9a5', 0.13` → `'rgba(46,233,165,0.13)'`)
  - `export function resoudreTheme(mode: ModeTheme, systeme: string | null | undefined): NomTheme`
  - `export function couleurCategorie(c: Couleurs, categorie: Categorie): string`
  - `ThemeProvider`, `useTheme(): { nom: NomTheme; couleurs: Couleurs }`
  - `<Icone nom={NomIcone} couleur={string} taille?={number} epaisseur?={number} />`

- [ ] **Step 1: Installer les dépendances**

```bash
npx expo install lucide-react-native react-native-svg
```

- [ ] **Step 2: Écrire les tests (failing)**

```typescript
// src/theme/teinte.test.ts
import { teinte } from './teinte';

describe('teinte', () => {
  it('convertit une couleur hexadécimale en rgba', () => {
    expect(teinte('#2ee9a5', 0.13)).toBe('rgba(46,233,165,0.13)');
  });
  it('accepte les majuscules', () => {
    expect(teinte('#4FA3FF', 0.5)).toBe('rgba(79,163,255,0.5)');
  });
});
```

```typescript
// src/theme/resoudreTheme.test.ts
import { resoudreTheme } from './resoudreTheme';

describe('resoudreTheme', () => {
  it('respecte un choix explicite', () => {
    expect(resoudreTheme('sombre', 'light')).toBe('sombre');
    expect(resoudreTheme('clair', 'dark')).toBe('clair');
  });
  it('suit le téléphone en mode auto', () => {
    expect(resoudreTheme('auto', 'dark')).toBe('sombre');
    expect(resoudreTheme('auto', 'light')).toBe('clair');
  });
  it('prend le sombre en mode auto si le téléphone ne dit rien', () => {
    expect(resoudreTheme('auto', null)).toBe('sombre');
  });
});
```

- [ ] **Step 3: Lancer et constater l'échec**

Run: `npx jest src/theme`
Expected: FAIL (modules introuvables).

- [ ] **Step 4: Implémenter `teinte.ts` et `resoudreTheme.ts`**

```typescript
// src/theme/teinte.ts
export function teinte(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}
```

```typescript
// src/theme/resoudreTheme.ts
import type { ModeTheme } from '@/fonctionnalites/reglages/lib/reglages';
import type { NomTheme } from './tokens';

export function resoudreTheme(mode: ModeTheme, systeme: string | null | undefined): NomTheme {
  if (mode === 'sombre' || mode === 'clair') return mode;
  return systeme === 'light' ? 'clair' : 'sombre';
}
```

- [ ] **Step 5: Créer `tokens.ts` (valeurs exactes de la spec §3)**

```typescript
// src/theme/tokens.ts
export type NomTheme = 'sombre' | 'clair';

export interface Couleurs {
  fond: string;
  halo1: string;
  halo2: string;
  texte: string;
  texteDiscret: string;
  carte: string;
  bordure: string;
  verre: string;
  ombre: string;
  accent: string;
  surAccent: string;
  plomberie: string;
  electricite: string;
  danger: string;
  dangerTexte: string;
  verdictVert: string;
  verdictOrange: string;
  verdictRouge: string;
  carteSol: string;
  carteRoute: string;
  carteRouteGrande: string;
  carteBloc: string;
  carteParc: string;
  carteEau: string;
  flou: 'dark' | 'light';
}

export const COULEURS: Record<NomTheme, Couleurs> = {
  sombre: {
    fond: '#0a0a0f',
    halo1: 'rgba(79,163,255,0.16)',
    halo2: 'rgba(139,92,246,0.12)',
    texte: 'rgba(255,255,255,0.9)',
    texteDiscret: 'rgba(255,255,255,0.5)',
    carte: 'rgba(255,255,255,0.03)',
    bordure: 'rgba(255,255,255,0.10)',
    verre: 'rgba(18,18,26,0.82)',
    ombre: '#000000',
    accent: '#4FA3FF',
    surAccent: '#ffffff',
    plomberie: '#2ee9a5',
    electricite: '#f5a623',
    danger: '#ef4444',
    dangerTexte: '#fca5a5',
    verdictVert: '#2ee9a5',
    verdictOrange: '#f5a623',
    verdictRouge: '#ef4444',
    carteSol: '#11141c',
    carteRoute: '#1c2230',
    carteRouteGrande: '#252c3d',
    carteBloc: '#151a25',
    carteParc: '#12251d',
    carteEau: '#10213a',
    flou: 'dark',
  },
  clair: {
    fond: '#f5f7fb',
    halo1: 'rgba(79,163,255,0.18)',
    halo2: 'rgba(139,92,246,0.10)',
    texte: '#0f172a',
    texteDiscret: 'rgba(15,23,42,0.5)',
    carte: '#ffffff',
    bordure: 'rgba(15,23,42,0.08)',
    verre: 'rgba(255,255,255,0.88)',
    ombre: '#0f172a',
    accent: '#4FA3FF',
    surAccent: '#ffffff',
    plomberie: '#10b981',
    electricite: '#d97706',
    danger: '#dc2626',
    dangerTexte: '#dc2626',
    verdictVert: '#2ee9a5',
    verdictOrange: '#f5a623',
    verdictRouge: '#ef4444',
    carteSol: '#e8edf3',
    carteRoute: '#ffffff',
    carteRouteGrande: '#ffffff',
    carteBloc: '#dde3ea',
    carteParc: '#d3ead9',
    carteEau: '#cfe0f5',
    flou: 'light',
  },
};
```

- [ ] **Step 6: Créer `couleurCategorie.ts` et `ThemeProvider.tsx`**

```typescript
// src/theme/couleurCategorie.ts
import type { Categorie } from '@/domaine/types';
import type { Couleurs } from './tokens';

export function couleurCategorie(c: Couleurs, categorie: Categorie): string {
  return categorie === 'plomberie' ? c.plomberie : c.electricite;
}
```

```tsx
// src/theme/ThemeProvider.tsx
import { StatusBar } from 'expo-status-bar';
import { createContext, useContext, type ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import { useReglages } from '@/fonctionnalites/reglages/ReglagesProvider';
import { resoudreTheme } from './resoudreTheme';
import { COULEURS, type Couleurs, type NomTheme } from './tokens';

interface ContexteTheme {
  nom: NomTheme;
  couleurs: Couleurs;
}

const Contexte = createContext<ContexteTheme | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { reglages } = useReglages();
  const systeme = useColorScheme();
  const nom = resoudreTheme(reglages.theme, systeme);
  return (
    <Contexte.Provider value={{ nom, couleurs: COULEURS[nom] }}>
      <StatusBar style={nom === 'sombre' ? 'light' : 'dark'} />
      {children}
    </Contexte.Provider>
  );
}

export function useTheme(): ContexteTheme {
  const valeur = useContext(Contexte);
  if (!valeur) throw new Error('useTheme doit être utilisé dans ThemeProvider');
  return valeur;
}
```

- [ ] **Step 7: Créer `src/ui/Icone.tsx`**

Le `Record<NomIcone, LucideIcon>` oblige TypeScript à vérifier que chaque nom de `NOMS_ICONES` a son composant. Si un nom d'export n'existe pas dans la version installée de `lucide-react-native`, chercher le nom équivalent dans `node_modules/lucide-react-native/dist/lucide-react-native.d.ts` et le signaler dans le rapport.

```tsx
// src/ui/Icone.tsx
import {
  AudioWaveform, Bath, BookOpen, ChevronLeft, ChevronRight, CircleX, Cylinder, DoorOpen, Droplet,
  DropletOff, Droplets, Flame, Gauge, HardHat, Heater, Hourglass, House, Lightbulb, LightbulbOff,
  LocateFixed, MapPin, Phone, Plug, Power, RotateCcw, RotateCw, Search, Settings, ShieldAlert,
  ShowerHead, Siren, Stethoscope, Toilet, ToggleLeft, TriangleAlert, Waves, Wind, Wrench, X, Zap,
  ZapOff, type LucideIcon,
} from 'lucide-react-native';
import type { NomIcone } from '@/domaine/icones';

const COMPOSANTS: Record<NomIcone, LucideIcon> = {
  droplets: Droplets, toilet: Toilet, waves: Waves, heater: Heater, hourglass: Hourglass,
  'rotate-cw': RotateCw, 'circle-x': CircleX, wrench: Wrench, droplet: Droplet, gauge: Gauge,
  'shower-head': ShowerHead, wind: Wind, cylinder: Cylinder, 'droplet-off': DropletOff, bath: Bath,
  'audio-waveform': AudioWaveform, 'toggle-left': ToggleLeft, 'zap-off': ZapOff, 'door-open': DoorOpen,
  plug: Plug, 'lightbulb-off': LightbulbOff, lightbulb: Lightbulb, house: House,
  'triangle-alert': TriangleAlert, 'book-open': BookOpen, 'map-pin': MapPin, settings: Settings,
  stethoscope: Stethoscope, phone: Phone, 'locate-fixed': LocateFixed, search: Search,
  'rotate-ccw': RotateCcw, 'shield-alert': ShieldAlert, 'hard-hat': HardHat, flame: Flame,
  power: Power, siren: Siren, 'chevron-right': ChevronRight, 'chevron-left': ChevronLeft, x: X, zap: Zap,
};

interface Props {
  nom: NomIcone;
  couleur: string;
  taille?: number;
  epaisseur?: number;
}

export function Icone({ nom, couleur, taille = 20, epaisseur = 2 }: Props) {
  const Composant = COMPOSANTS[nom];
  return <Composant color={couleur} size={taille} strokeWidth={epaisseur} />;
}
```

- [ ] **Step 8: Brancher le thème et masquer les en-têtes par défaut**

Tous les nouveaux écrans affichent leur propre en-tête (`EnTete`, tâche 5). Remplacer `app/_layout.tsx` par :

```tsx
import { Stack } from 'expo-router';
import { ReglagesProvider } from '@/fonctionnalites/reglages/ReglagesProvider';
import { ThemeProvider } from '@/theme/ThemeProvider';

export default function RootLayout() {
  return (
    <ReglagesProvider>
      <ThemeProvider>
        <Stack screenOptions={{ headerShown: false }} />
      </ThemeProvider>
    </ReglagesProvider>
  );
}
```

(Les anciens écrans V1 perdent temporairement leur en-tête : accepté, ils sont remplacés aux tâches 6 à 12.)

- [ ] **Step 9: Vérifier et committer**

Run: `npx jest src/theme` → PASS ; `npm test`, `npx tsc --noEmit`, export web → vert ; `rm -rf dist-check`.

```bash
git add src/theme src/ui/Icone.tsx app/_layout.tsx package.json package-lock.json
git commit -m "Ajoute le thème sombre/clair et les icônes Lucide"
```

---

### Task 5: Kit de composants partagés

**Files:**
- Create: `src/ui/FondEcran.tsx`, `src/ui/Verre.tsx`, `src/ui/EnTete.tsx`, `src/ui/Pastille.tsx`, `src/ui/CarteListe.tsx`, `src/ui/BoutonPrincipal.tsx`, `src/ui/Onglets.tsx`
- Modify (restyle complet): `src/ui/EtapesList.tsx`, `src/ui/NumeroUrgence.tsx`, `src/ui/VerdictBadge.tsx`
- Modify: `package.json`

**Interfaces:**
- Consumes: `useTheme()`, `teinte()`, `Icone`, `NomIcone`, `Verdict`.
- Produces (props exactes) :
  - `<FondEcran defilant?={boolean} children />` — fond + halos, marges sûres en haut, marge basse de 110 px pour la barre flottante ; `defilant` (défaut `true`) enveloppe le contenu dans un `ScrollView`.
  - `<Verre style? children />` — panneau de verre (flou + couleur `verre` + bordure).
  - `<EnTete titre={string} sousTitre?={string} action?={'retour' | 'fermer'} />` — `action` affiche un bouton rond qui appelle `router.back()`.
  - `<Pastille icone={NomIcone} couleur={string} taille?={number} />` (défaut 34).
  - `<CarteListe icone={NomIcone} couleur={string} titre={string} sousTitre?={string} onPress?={() => void} droite?={ReactNode} danger?={boolean} grande?={boolean} />` — si `onPress` et pas de `droite`, affiche un chevron.
  - `<BoutonPrincipal libelle={string} icone?={NomIcone} onPress={() => void} variante?={'accent' | 'danger' | 'discret'} />`
  - `<Onglets<T extends string | number> options={{ valeur: T; libelle: string }[]} valeur={T} onChange={(v: T) => void} />`
  - `<EtapesList etapes={string[]} />`, `<NumeroUrgence numero={string} />`, `<VerdictBadge verdict={Verdict} />` (mêmes props qu'avant).

- [ ] **Step 1: Installer `expo-blur`**

```bash
npx expo install expo-blur
```

- [ ] **Step 2: Créer `FondEcran.tsx`**

```tsx
// src/ui/FondEcran.tsx
import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';
import { useTheme } from '@/theme/ThemeProvider';

export const MARGE_BARRE = 110;

export function FondEcran({ children, defilant = true }: { children: ReactNode; defilant?: boolean }) {
  const { couleurs } = useTheme();
  const { top } = useSafeAreaInsets();
  const contenuStyle = { paddingTop: top + 12, paddingBottom: MARGE_BARRE, paddingHorizontal: 16, gap: 12 };
  return (
    <View style={[styles.racine, { backgroundColor: couleurs.fond }]}>
      <Svg style={StyleSheet.absoluteFill}>
        <Defs>
          <RadialGradient id="halo1" cx="15%" cy="60%" r="60%">
            <Stop offset="0" stopColor={couleurs.halo1} />
            <Stop offset="1" stopColor={couleurs.fond} stopOpacity="0" />
          </RadialGradient>
          <RadialGradient id="halo2" cx="85%" cy="10%" r="50%">
            <Stop offset="0" stopColor={couleurs.halo2} />
            <Stop offset="1" stopColor={couleurs.fond} stopOpacity="0" />
          </RadialGradient>
        </Defs>
        <Rect width="100%" height="100%" fill="url(#halo1)" />
        <Rect width="100%" height="100%" fill="url(#halo2)" />
      </Svg>
      {defilant ? (
        <ScrollView contentContainerStyle={contenuStyle}>{children}</ScrollView>
      ) : (
        <View style={[styles.racine, contenuStyle]}>{children}</View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  racine: { flex: 1 },
});
```

- [ ] **Step 3: Créer `Verre.tsx` et `Pastille.tsx`**

```tsx
// src/ui/Verre.tsx
import { BlurView } from 'expo-blur';
import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';

export function Verre({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  const { couleurs } = useTheme();
  return (
    <View style={[styles.base, { borderColor: couleurs.bordure, shadowColor: couleurs.ombre }, style]}>
      <BlurView intensity={40} tint={couleurs.flou} style={StyleSheet.absoluteFill} />
      <View style={[StyleSheet.absoluteFill, { backgroundColor: couleurs.verre }]} />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    overflow: 'hidden',
    borderWidth: 1,
    shadowOpacity: 0.35,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
});
```

```tsx
// src/ui/Pastille.tsx
import { View } from 'react-native';
import type { NomIcone } from '@/domaine/icones';
import { teinte } from '@/theme/teinte';
import { Icone } from './Icone';

export function Pastille({ icone, couleur, taille = 34 }: { icone: NomIcone; couleur: string; taille?: number }) {
  return (
    <View
      style={{
        width: taille,
        height: taille,
        borderRadius: taille / 2,
        backgroundColor: teinte(couleur, 0.13),
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Icone nom={icone} couleur={couleur} taille={Math.round(taille * 0.5)} />
    </View>
  );
}
```

- [ ] **Step 4: Créer `EnTete.tsx`**

```tsx
// src/ui/EnTete.tsx
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { Icone } from './Icone';
import { Verre } from './Verre';

interface Props {
  titre: string;
  sousTitre?: string;
  action?: 'retour' | 'fermer';
}

export function EnTete({ titre, sousTitre, action }: Props) {
  const { couleurs } = useTheme();
  return (
    <View style={styles.ligne}>
      {action ? (
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel={action === 'retour' ? 'Retour' : 'Fermer'}
        >
          <Verre style={styles.bouton}>
            <Icone nom={action === 'retour' ? 'chevron-left' : 'x'} couleur={couleurs.texte} taille={18} />
          </Verre>
        </Pressable>
      ) : null}
      <View style={styles.textes}>
        <Text style={[action ? styles.titrePetit : styles.titre, { color: couleurs.texte }]}>{titre}</Text>
        {sousTitre ? <Text style={[styles.sousTitre, { color: couleurs.texteDiscret }]}>{sousTitre}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  ligne: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 4 },
  bouton: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  textes: { flex: 1, gap: 2 },
  titre: { fontSize: 24, fontWeight: '800' },
  titrePetit: { fontSize: 17, fontWeight: '700' },
  sousTitre: { fontSize: 13 },
});
```

- [ ] **Step 5: Créer `CarteListe.tsx`**

```tsx
// src/ui/CarteListe.tsx
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { NomIcone } from '@/domaine/icones';
import { teinte } from '@/theme/teinte';
import { useTheme } from '@/theme/ThemeProvider';
import { Icone } from './Icone';
import { Pastille } from './Pastille';

interface Props {
  icone: NomIcone;
  couleur: string;
  titre: string;
  sousTitre?: string;
  onPress?: () => void;
  droite?: ReactNode;
  danger?: boolean;
  grande?: boolean;
}

export function CarteListe({ icone, couleur, titre, sousTitre, onPress, droite, danger, grande }: Props) {
  const { couleurs } = useTheme();
  const fond = danger ? teinte(couleurs.danger, 0.12) : couleurs.carte;
  const bordure = danger ? teinte(couleurs.danger, 0.45) : couleurs.bordure;
  const couleurTitre = danger ? couleurs.dangerTexte : couleurs.texte;
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      style={[styles.carte, grande && styles.grande, { backgroundColor: fond, borderColor: bordure }]}
    >
      <Pastille icone={icone} couleur={couleur} taille={grande ? 40 : 34} />
      <View style={styles.textes}>
        <Text style={[styles.titre, { color: couleurTitre }]}>{titre}</Text>
        {sousTitre ? <Text style={[styles.sousTitre, { color: couleurs.texteDiscret }]}>{sousTitre}</Text> : null}
      </View>
      {droite ?? (onPress ? <Icone nom="chevron-right" couleur={couleurs.texteDiscret} taille={18} /> : null)}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  carte: { flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderRadius: 14, padding: 12 },
  grande: { paddingVertical: 16 },
  textes: { flex: 1, gap: 2 },
  titre: { fontSize: 15, fontWeight: '600' },
  sousTitre: { fontSize: 12.5 },
});
```

- [ ] **Step 6: Créer `BoutonPrincipal.tsx` et `Onglets.tsx`**

```tsx
// src/ui/BoutonPrincipal.tsx
import { Pressable, StyleSheet, Text } from 'react-native';
import type { NomIcone } from '@/domaine/icones';
import { useTheme } from '@/theme/ThemeProvider';
import { Icone } from './Icone';

interface Props {
  libelle: string;
  icone?: NomIcone;
  onPress: () => void;
  variante?: 'accent' | 'danger' | 'discret';
}

export function BoutonPrincipal({ libelle, icone, onPress, variante = 'accent' }: Props) {
  const { couleurs } = useTheme();
  const plein = variante !== 'discret';
  const fond = variante === 'accent' ? couleurs.accent : variante === 'danger' ? couleurs.danger : couleurs.carte;
  const texte = plein ? couleurs.surAccent : couleurs.texte;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={[
        styles.bouton,
        { backgroundColor: fond, borderColor: plein ? fond : couleurs.bordure, shadowColor: fond },
        plein && styles.ombre,
      ]}
    >
      {icone ? <Icone nom={icone} couleur={texte} taille={18} /> : null}
      <Text style={[styles.libelle, { color: texte }]}>{libelle}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  bouton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 16,
    borderWidth: 1,
    paddingVertical: 15,
    paddingHorizontal: 16,
  },
  ombre: { shadowOpacity: 0.35, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, elevation: 6 },
  libelle: { fontSize: 16, fontWeight: '700' },
});
```

```tsx
// src/ui/Onglets.tsx
import { Pressable, StyleSheet, Text } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { Verre } from './Verre';

interface Props<T extends string | number> {
  options: { valeur: T; libelle: string }[];
  valeur: T;
  onChange: (valeur: T) => void;
}

export function Onglets<T extends string | number>({ options, valeur, onChange }: Props<T>) {
  const { couleurs } = useTheme();
  return (
    <Verre style={styles.barre}>
      {options.map((option) => {
        const actif = option.valeur === valeur;
        return (
          <Pressable
            key={String(option.valeur)}
            onPress={() => onChange(option.valeur)}
            accessibilityRole="tab"
            accessibilityState={{ selected: actif }}
            style={[styles.onglet, actif && { backgroundColor: couleurs.accent }]}
          >
            <Text style={[styles.libelle, { color: actif ? couleurs.surAccent : couleurs.texteDiscret }]}>
              {option.libelle}
            </Text>
          </Pressable>
        );
      })}
    </Verre>
  );
}

const styles = StyleSheet.create({
  barre: { flexDirection: 'row', gap: 4, padding: 4, borderRadius: 14 },
  onglet: { flex: 1, alignItems: 'center', paddingVertical: 9, borderRadius: 10 },
  libelle: { fontSize: 13, fontWeight: '600' },
});
```

- [ ] **Step 7: Restyler `EtapesList`, `NumeroUrgence`, `VerdictBadge` (remplacement complet)**

```tsx
// src/ui/EtapesList.tsx
import { StyleSheet, Text, View } from 'react-native';
import { teinte } from '@/theme/teinte';
import { useTheme } from '@/theme/ThemeProvider';

export function EtapesList({ etapes }: { etapes: string[] }) {
  const { couleurs } = useTheme();
  return (
    <View style={styles.liste}>
      {etapes.map((etape, index) => (
        <View key={index} style={[styles.ligne, { backgroundColor: couleurs.carte, borderColor: couleurs.bordure }]}>
          <View style={[styles.numero, { backgroundColor: teinte(couleurs.accent, 0.18) }]}>
            <Text style={[styles.numeroTexte, { color: couleurs.accent }]}>{index + 1}</Text>
          </View>
          <Text style={[styles.texte, { color: couleurs.texte }]}>{etape}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  liste: { gap: 10 },
  ligne: { flexDirection: 'row', gap: 12, borderWidth: 1, borderRadius: 14, padding: 12 },
  numero: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  numeroTexte: { fontWeight: '700', fontSize: 14 },
  texte: { flex: 1, fontSize: 15, lineHeight: 21 },
});
```

```tsx
// src/ui/NumeroUrgence.tsx
import { Linking } from 'react-native';
import { BoutonPrincipal } from './BoutonPrincipal';

export function NumeroUrgence({ numero }: { numero: string }) {
  return (
    <BoutonPrincipal
      libelle={`Appeler le ${numero}`}
      icone="phone"
      variante="danger"
      onPress={() => Linking.openURL('tel:' + numero.replace(/\s/g, ''))}
    />
  );
}
```

```tsx
// src/ui/VerdictBadge.tsx
import { StyleSheet, Text, View } from 'react-native';
import type { NomIcone } from '@/domaine/icones';
import type { Verdict } from '@/domaine/types';
import type { Couleurs } from '@/theme/tokens';
import { teinte } from '@/theme/teinte';
import { useTheme } from '@/theme/ThemeProvider';
import { Pastille } from './Pastille';

const CONFIG: Record<Verdict, { icone: NomIcone; libelle: string; detail: string; couleur: keyof Couleurs }> = {
  vert: { icone: 'wrench', libelle: 'Tu peux réparer', detail: 'Réparation simple, sans danger', couleur: 'verdictVert' },
  orange: {
    icone: 'shield-alert',
    libelle: 'Sécurise en attendant',
    detail: 'Mets en sécurité, puis appelle un pro',
    couleur: 'verdictOrange',
  },
  rouge: {
    icone: 'hard-hat',
    libelle: 'Appelle un pro tout de suite',
    detail: 'Ne répare pas toi-même',
    couleur: 'verdictRouge',
  },
};

export function VerdictBadge({ verdict }: { verdict: Verdict }) {
  const { couleurs } = useTheme();
  const config = CONFIG[verdict];
  const couleur = couleurs[config.couleur] as string;
  return (
    <View style={[styles.badge, { backgroundColor: teinte(couleur, 0.12), borderColor: teinte(couleur, 0.4) }]}>
      <Pastille icone={config.icone} couleur={couleur} taille={44} />
      <View style={styles.textes}>
        <Text style={[styles.libelle, { color: couleur }]}>{config.libelle}</Text>
        <Text style={[styles.detail, { color: couleurs.texteDiscret }]}>{config.detail}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderRadius: 18, padding: 14 },
  textes: { flex: 1, gap: 2 },
  libelle: { fontSize: 17, fontWeight: '700' },
  detail: { fontSize: 12.5 },
});
```

- [ ] **Step 8: Vérifier et committer**

Run: `npm test`, `npx tsc --noEmit`, export web → vert ; `rm -rf dist-check`.

```bash
git add src/ui package.json package-lock.json
git commit -m "Ajoute le kit de composants au style SC Fleet"
```

---

### Task 6: Écrans Urgences (liste + détail d'un geste)

**Files:**
- Create: `src/donnees/numerosUtiles.ts`, `src/fonctionnalites/urgences/EcranUrgences.tsx`, `src/fonctionnalites/urgences/EcranGeste.tsx`, `app/urgences/index.tsx`
- Modify (remplacement complet): `app/urgences/[id].tsx`
- Test: `src/donnees/gestesEtTutos.data.test.ts` (ajout)

**Interfaces:**
- Consumes: `gestesUrgence`, kit UI (tâche 5), `useTheme`.
- Produces: `export interface NumeroUtile { libelle: string; numero: string; detail?: string }`, `export const numerosUtiles: NumeroUtile[]` ; `EcranUrgences()`, `EcranGeste({ id }: { id: string })`. Routes `/urgences` et `/urgences/[id]`.

- [ ] **Step 1: Test des numéros utiles (failing)**

Ajouter dans `src/donnees/gestesEtTutos.data.test.ts` (+ `import { numerosUtiles } from './numerosUtiles';`) :

```typescript
  it('liste les numéros utiles gaz et 112', () => {
    expect(numerosUtiles.map((n) => n.numero)).toEqual(['0800 47 33 33', '112']);
  });
```

Run: `npx jest src/donnees` → FAIL (module introuvable).

- [ ] **Step 2: Créer `numerosUtiles.ts`**

```typescript
// src/donnees/numerosUtiles.ts
export interface NumeroUtile {
  libelle: string;
  numero: string;
  detail?: string;
}

export const numerosUtiles: NumeroUtile[] = [
  { libelle: 'Urgence gaz', numero: '0800 47 33 33', detail: 'gratuit 24h/24' },
  { libelle: 'Urgences', numero: '112' },
];
```

Run: `npx jest src/donnees` → PASS.

- [ ] **Step 3: Créer `EcranUrgences.tsx`**

Maquette : `3-autres-ecrans.html`, écran « Urgences ». Couleurs : `couper-eau` → `accent`, `couper-courant` → `electricite`, `couper-gaz` → `danger` + carte `danger`. Sous-titre : `Sors et appelle le <numero>` si le geste a un `numeroUtile`, sinon `<n> étapes`.

```tsx
// src/fonctionnalites/urgences/EcranUrgences.tsx
import { router } from 'expo-router';
import { Linking, StyleSheet, Text } from 'react-native';
import type { GesteUrgence } from '@/domaine/types';
import { gestesUrgence } from '@/donnees/gestesUrgence';
import { numerosUtiles } from '@/donnees/numerosUtiles';
import type { Couleurs } from '@/theme/tokens';
import { useTheme } from '@/theme/ThemeProvider';
import { CarteListe } from '@/ui/CarteListe';
import { EnTete } from '@/ui/EnTete';
import { FondEcran } from '@/ui/FondEcran';

function couleurGeste(c: Couleurs, id: string): string {
  if (id === 'couper-gaz') return c.danger;
  if (id === 'couper-courant') return c.electricite;
  return c.accent;
}

function sousTitreGeste(geste: GesteUrgence): string {
  return geste.numeroUtile ? `Sors et appelle le ${geste.numeroUtile}` : `${geste.etapes.length} étapes`;
}

export function EcranUrgences() {
  const { couleurs } = useTheme();
  return (
    <FondEcran>
      <EnTete titre="Urgences" sousTitre="Les bons gestes en attendant le pro." />
      {gestesUrgence.map((geste) => (
        <CarteListe
          key={geste.id}
          grande
          icone={geste.icone}
          couleur={couleurGeste(couleurs, geste.id)}
          titre={geste.titre}
          sousTitre={sousTitreGeste(geste)}
          danger={geste.id === 'couper-gaz'}
          onPress={() => router.push({ pathname: '/urgences/[id]', params: { id: geste.id } })}
        />
      ))}
      <Text style={[styles.section, { color: couleurs.texteDiscret }]}>Numéros utiles</Text>
      {numerosUtiles.map((n) => (
        <CarteListe
          key={n.numero}
          icone={n.numero === '112' ? 'siren' : 'phone'}
          couleur={couleurs.danger}
          titre={n.libelle}
          sousTitre={n.detail ? `${n.numero} · ${n.detail}` : n.numero}
          onPress={() => Linking.openURL('tel:' + n.numero.replace(/\s/g, ''))}
        />
      ))}
    </FondEcran>
  );
}

const styles = StyleSheet.create({
  section: { fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.6, marginTop: 8 },
});
```

- [ ] **Step 4: Créer `EcranGeste.tsx`**

```tsx
// src/fonctionnalites/urgences/EcranGeste.tsx
import { StyleSheet, Text } from 'react-native';
import { gestesUrgence } from '@/donnees/gestesUrgence';
import { useTheme } from '@/theme/ThemeProvider';
import { EnTete } from '@/ui/EnTete';
import { EtapesList } from '@/ui/EtapesList';
import { FondEcran } from '@/ui/FondEcran';
import { NumeroUrgence } from '@/ui/NumeroUrgence';

export function EcranGeste({ id }: { id: string }) {
  const { couleurs } = useTheme();
  const geste = gestesUrgence.find((g) => g.id === id);
  if (!geste) {
    return (
      <FondEcran>
        <EnTete titre="Geste d'urgence" action="retour" />
        <Text style={[styles.texte, { color: couleurs.texte }]}>Geste d'urgence introuvable.</Text>
      </FondEcran>
    );
  }
  return (
    <FondEcran>
      <EnTete titre={geste.titre} action="retour" />
      <EtapesList etapes={geste.etapes} />
      {geste.numeroUtile ? <NumeroUrgence numero={geste.numeroUtile} /> : null}
    </FondEcran>
  );
}

const styles = StyleSheet.create({
  texte: { fontSize: 15 },
});
```

- [ ] **Step 5: Routes minces**

```tsx
// app/urgences/index.tsx
import { EcranUrgences } from '@/fonctionnalites/urgences/EcranUrgences';

export default function RouteUrgences() {
  return <EcranUrgences />;
}
```

```tsx
// app/urgences/[id].tsx
import { useLocalSearchParams } from 'expo-router';
import { EcranGeste } from '@/fonctionnalites/urgences/EcranGeste';

export default function RouteGeste() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <EcranGeste id={id} />;
}
```

- [ ] **Step 6: Vérifier et committer**

Run: `npm test`, export web puis `npx tsc --noEmit` → vert ; `rm -rf dist-check`.

```bash
git add src/donnees/numerosUtiles.ts src/donnees/gestesEtTutos.data.test.ts src/fonctionnalites/urgences app/urgences
git commit -m "Refait les écrans Urgences au nouveau design"
```

---

### Task 7: Écrans Tutos (liste + détail)

**Files:**
- Create: `src/fonctionnalites/tutos/EcranTutos.tsx`, `src/fonctionnalites/tutos/EcranTuto.tsx`, `app/tutos/index.tsx`
- Modify (remplacement complet): `app/tutos/[id].tsx`

**Interfaces:**
- Consumes: `tutos`, `Categorie`, `couleurCategorie`, kit UI.
- Produces: `EcranTutos()`, `EcranTuto({ id }: { id: string })`. Routes `/tutos` et `/tutos/[id]`.

- [ ] **Step 1: Créer `EcranTutos.tsx`** (maquette `3-autres-ecrans.html`, écran « Tutos »)

```tsx
// src/fonctionnalites/tutos/EcranTutos.tsx
import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import type { Categorie } from '@/domaine/types';
import { tutos } from '@/donnees/tutos';
import { couleurCategorie } from '@/theme/couleurCategorie';
import { useTheme } from '@/theme/ThemeProvider';
import { CarteListe } from '@/ui/CarteListe';
import { EnTete } from '@/ui/EnTete';
import { FondEcran } from '@/ui/FondEcran';
import { Onglets } from '@/ui/Onglets';

export function EcranTutos() {
  const { couleurs } = useTheme();
  const [categorie, setCategorie] = useState<Categorie>('plomberie');
  const liste = tutos.filter((t) => t.categorie === categorie);
  return (
    <FondEcran>
      <EnTete titre="Tutos" sousTitre="Réparations simples, pas à pas." />
      <Onglets
        options={[
          { valeur: 'plomberie', libelle: 'Plomberie' },
          { valeur: 'electricite', libelle: 'Électricité' },
        ]}
        valeur={categorie}
        onChange={setCategorie}
      />
      {liste.map((tuto) => (
        <CarteListe
          key={tuto.id}
          icone={tuto.icone}
          couleur={couleurCategorie(couleurs, tuto.categorie)}
          titre={tuto.titre}
          sousTitre={`${tuto.duree} · ${tuto.outil}`}
          onPress={() => router.push({ pathname: '/tutos/[id]', params: { id: tuto.id } })}
        />
      ))}
      {liste.length === 0 ? (
        <Text style={[styles.vide, { color: couleurs.texteDiscret }]}>Aucun tuto pour l'instant.</Text>
      ) : null}
    </FondEcran>
  );
}

const styles = StyleSheet.create({
  vide: { fontSize: 14, textAlign: 'center', marginTop: 12 },
});
```

- [ ] **Step 2: Créer `EcranTuto.tsx`**

```tsx
// src/fonctionnalites/tutos/EcranTuto.tsx
import { StyleSheet, Text } from 'react-native';
import { tutos } from '@/donnees/tutos';
import { useTheme } from '@/theme/ThemeProvider';
import { EnTete } from '@/ui/EnTete';
import { EtapesList } from '@/ui/EtapesList';
import { FondEcran } from '@/ui/FondEcran';

export function EcranTuto({ id }: { id: string }) {
  const { couleurs } = useTheme();
  const tuto = tutos.find((t) => t.id === id);
  if (!tuto) {
    return (
      <FondEcran>
        <EnTete titre="Tuto" action="retour" />
        <Text style={[styles.texte, { color: couleurs.texte }]}>Tuto introuvable.</Text>
      </FondEcran>
    );
  }
  return (
    <FondEcran>
      <EnTete titre={tuto.titre} sousTitre={`${tuto.duree} · ${tuto.outil}`} action="retour" />
      <EtapesList etapes={tuto.etapes} />
    </FondEcran>
  );
}

const styles = StyleSheet.create({
  texte: { fontSize: 15 },
});
```

- [ ] **Step 3: Routes minces**

```tsx
// app/tutos/index.tsx
import { EcranTutos } from '@/fonctionnalites/tutos/EcranTutos';

export default function RouteTutos() {
  return <EcranTutos />;
}
```

```tsx
// app/tutos/[id].tsx
import { useLocalSearchParams } from 'expo-router';
import { EcranTuto } from '@/fonctionnalites/tutos/EcranTuto';

export default function RouteTuto() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <EcranTuto id={id} />;
}
```

- [ ] **Step 4: Vérifier et committer**

Run: `npm test`, export web puis `npx tsc --noEmit` → vert ; `rm -rf dist-check`.

```bash
git add src/fonctionnalites/tutos app/tutos
git commit -m "Refait les écrans Tutos au nouveau design"
```

---

### Task 8: Écrans Réglages et À propos

**Files:**
- Create: `src/fonctionnalites/reglages/EcranReglages.tsx`, `src/fonctionnalites/reglages/EcranAPropos.tsx`, `app/reglages/index.tsx`, `app/reglages/a-propos.tsx`

**Interfaces:**
- Consumes: `useReglages()`, `ModeTheme`, `RayonKm`, kit UI, `expo-constants` (déjà installé).
- Produces: `EcranReglages()`, `EcranAPropos()`. Routes `/reglages` et `/reglages/a-propos`.

- [ ] **Step 1: Créer `EcranReglages.tsx`** (maquette `3-autres-ecrans.html`, écran « Réglages » ; sans la ligne « Ville par défaut », ajoutée au chantier B)

```tsx
// src/fonctionnalites/reglages/EcranReglages.tsx
import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { StyleSheet, Switch, Text, View } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { CarteListe } from '@/ui/CarteListe';
import { EnTete } from '@/ui/EnTete';
import { FondEcran } from '@/ui/FondEcran';
import { Onglets } from '@/ui/Onglets';
import { useReglages } from './ReglagesProvider';
import type { ModeTheme, RayonKm } from './lib/reglages';

function Bloc({ titre, description, children }: { titre: string; description: string; children: ReactNode }) {
  const { couleurs } = useTheme();
  return (
    <View style={[styles.bloc, { backgroundColor: couleurs.carte, borderColor: couleurs.bordure }]}>
      <Text style={[styles.titre, { color: couleurs.texte }]}>{titre}</Text>
      <Text style={[styles.description, { color: couleurs.texteDiscret }]}>{description}</Text>
      {children}
    </View>
  );
}

export function EcranReglages() {
  const { couleurs } = useTheme();
  const { reglages, modifier } = useReglages();
  return (
    <FondEcran>
      <EnTete titre="Réglages" />
      <Bloc titre="Thème" description="Apparence de l'appli">
        <Onglets<ModeTheme>
          options={[
            { valeur: 'sombre', libelle: 'Sombre' },
            { valeur: 'clair', libelle: 'Clair' },
            { valeur: 'auto', libelle: 'Auto' },
          ]}
          valeur={reglages.theme}
          onChange={(theme) => modifier({ theme })}
        />
      </Bloc>
      <Bloc titre="Rayon de recherche" description="Distance max des pros">
        <Onglets<RayonKm>
          options={[
            { valeur: 5, libelle: '5 km' },
            { valeur: 10, libelle: '10 km' },
            { valeur: 20, libelle: '20 km' },
          ]}
          valeur={reglages.rayonKm}
          onChange={(rayonKm) => modifier({ rayonKm })}
        />
      </Bloc>
      <View style={[styles.bloc, styles.ligne, { backgroundColor: couleurs.carte, borderColor: couleurs.bordure }]}>
        <View style={styles.flex}>
          <Text style={[styles.titre, { color: couleurs.texte }]}>Localisation</Text>
          <Text style={[styles.description, { color: couleurs.texteDiscret }]}>Utiliser ma position</Text>
        </View>
        <Switch
          value={reglages.localisation}
          onValueChange={(localisation) => modifier({ localisation })}
          trackColor={{ true: couleurs.accent, false: couleurs.bordure }}
          thumbColor={couleurs.surAccent}
        />
      </View>
      <CarteListe
        icone="settings"
        couleur={couleurs.accent}
        titre="À propos et mentions légales"
        sousTitre="Avertissement, crédits, version"
        onPress={() => router.push('/reglages/a-propos')}
      />
    </FondEcran>
  );
}

const styles = StyleSheet.create({
  bloc: { borderWidth: 1, borderRadius: 14, padding: 12, gap: 4 },
  ligne: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  flex: { flex: 1, gap: 2 },
  titre: { fontSize: 15, fontWeight: '600' },
  description: { fontSize: 12.5, marginBottom: 6 },
});
```

- [ ] **Step 2: Créer `EcranAPropos.tsx`**

```tsx
// src/fonctionnalites/reglages/EcranAPropos.tsx
import Constants from 'expo-constants';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { EnTete } from '@/ui/EnTete';
import { FondEcran } from '@/ui/FondEcran';

const SECTIONS = [
  {
    titre: 'Avertissement',
    texte:
      "Dépann'Maison donne des conseils, mais ne remplace pas un professionnel. En cas de doute ou de danger, appelle un pro. Pour une odeur de gaz, sors du logement et appelle le 0800 47 33 33.",
  },
  {
    titre: 'Crédits',
    texte: 'Carte : OpenFreeMap © OpenMapTiles. Données © les contributeurs OpenStreetMap. Icônes : Lucide.',
  },
];

export function EcranAPropos() {
  const { couleurs } = useTheme();
  return (
    <FondEcran>
      <EnTete titre="À propos" action="retour" />
      {SECTIONS.map((s) => (
        <View key={s.titre} style={[styles.bloc, { backgroundColor: couleurs.carte, borderColor: couleurs.bordure }]}>
          <Text style={[styles.titre, { color: couleurs.texte }]}>{s.titre}</Text>
          <Text style={[styles.texte, { color: couleurs.texteDiscret }]}>{s.texte}</Text>
        </View>
      ))}
      <Text style={[styles.version, { color: couleurs.texteDiscret }]}>
        Version {Constants.expoConfig?.version ?? '?'}
      </Text>
    </FondEcran>
  );
}

const styles = StyleSheet.create({
  bloc: { borderWidth: 1, borderRadius: 14, padding: 14, gap: 6 },
  titre: { fontSize: 15, fontWeight: '700' },
  texte: { fontSize: 14, lineHeight: 20 },
  version: { fontSize: 12, textAlign: 'center', marginTop: 8 },
});
```

- [ ] **Step 3: Routes minces**

```tsx
// app/reglages/index.tsx
import { EcranReglages } from '@/fonctionnalites/reglages/EcranReglages';

export default function RouteReglages() {
  return <EcranReglages />;
}
```

```tsx
// app/reglages/a-propos.tsx
import { EcranAPropos } from '@/fonctionnalites/reglages/EcranAPropos';

export default function RouteAPropos() {
  return <EcranAPropos />;
}
```

- [ ] **Step 4: Vérifier et committer**

Run: `npm test`, export web puis `npx tsc --noEmit` → vert ; `rm -rf dist-check`.

```bash
git add src/fonctionnalites/reglages app/reglages
git commit -m "Ajoute les écrans Réglages et À propos"
```

---

### Task 9: Écran Pros (état « Bientôt disponible »)

**Files:**
- Create: `src/fonctionnalites/pros/EcranPros.tsx`, `app/pros.tsx`

**Interfaces:**
- Produces: `EcranPros()`, route `/pros`.

- [ ] **Step 1: Créer l'écran**

```tsx
// src/fonctionnalites/pros/EcranPros.tsx
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { EnTete } from '@/ui/EnTete';
import { FondEcran } from '@/ui/FondEcran';
import { Pastille } from '@/ui/Pastille';

export function EcranPros() {
  const { couleurs } = useTheme();
  return (
    <FondEcran>
      <EnTete titre="Pros près de toi" />
      <View style={[styles.bloc, { backgroundColor: couleurs.carte, borderColor: couleurs.bordure }]}>
        <Pastille icone="map-pin" couleur={couleurs.accent} taille={52} />
        <Text style={[styles.titre, { color: couleurs.texte }]}>Bientôt disponible</Text>
        <Text style={[styles.texte, { color: couleurs.texteDiscret }]}>
          La carte des plombiers et électriciens proches de chez toi arrive dans la prochaine version.
        </Text>
      </View>
    </FondEcran>
  );
}

const styles = StyleSheet.create({
  bloc: { borderWidth: 1, borderRadius: 18, padding: 24, gap: 10, alignItems: 'center' },
  titre: { fontSize: 17, fontWeight: '700' },
  texte: { fontSize: 14, lineHeight: 20, textAlign: 'center' },
});
```

- [ ] **Step 2: Route mince**

```tsx
// app/pros.tsx
import { EcranPros } from '@/fonctionnalites/pros/EcranPros';

export default function RoutePros() {
  return <EcranPros />;
}
```

- [ ] **Step 3: Vérifier et committer**

Run: `npm test`, export web puis `npx tsc --noEmit` → vert ; `rm -rf dist-check`.

```bash
git add src/fonctionnalites/pros app/pros.tsx
git commit -m "Ajoute l'écran Pros en attendant la carte"
```

---

### Task 10: Logique du parcours de diagnostic et recherche des pannes

**Files:**
- Create: `src/fonctionnalites/diagnostic/lib/parcours.ts`, `src/fonctionnalites/diagnostic/lib/parcours.test.ts`, `src/fonctionnalites/diagnostic/lib/recherche.ts`, `src/fonctionnalites/diagnostic/lib/recherche.test.ts`, `src/fonctionnalites/diagnostic/hooks/useParcoursDiagnostic.ts`

**Interfaces:**
- Consumes: `Diagnostic`, `Categorie`, `Etape`, `Resultat` ; `estResultat`, `getEtape`, `getResultat` (`@/domaine/diagnosticEngine`).
- Produces:
  - `export interface EtatParcours { historique: string[] }` (dernier élément = étape ou résultat courant)
  - `demarrer(diag: Diagnostic): EtatParcours`, `repondre(etat: EtatParcours, suite: string): EtatParcours`, `precedente(etat: EtatParcours): EtatParcours`, `etapeCourante(etat: EtatParcours): string`, `peutRevenir(etat: EtatParcours): boolean`, `profondeurMax(diag: Diagnostic, id: string): number`, `progression(diag: Diagnostic, etat: EtatParcours): number` (0 à 1)
  - `normaliser(texte: string): string`, `filtrerPannes(pannes: Diagnostic[], categorie: Categorie, recherche: string): Diagnostic[]`
  - `useParcoursDiagnostic(diag: Diagnostic)` → `{ etape: Etape | null; resultat: Resultat | null; numeroQuestion: number; progression: number; peutRevenir: boolean; repondre: (suite: string) => void; precedente: () => void; recommencer: () => void }`

- [ ] **Step 1: Tests du parcours (failing)**

```typescript
// src/fonctionnalites/diagnostic/lib/parcours.test.ts
import type { Diagnostic } from '@/domaine/types';
import { demarrer, etapeCourante, peutRevenir, precedente, profondeurMax, progression, repondre } from './parcours';

const diag: Diagnostic = {
  id: 'test',
  titre: 'Test',
  categorie: 'plomberie',
  icone: 'droplets',
  motsCles: ['test'],
  etapeInitiale: 'q1',
  etapes: {
    q1: { question: 'Q1', reponses: [{ texte: 'A', suite: 'q2' }, { texte: 'B', suite: 'r1' }] },
    q2: { question: 'Q2', reponses: [{ texte: 'A', suite: 'r2' }, { texte: 'B', suite: 'q3' }] },
    q3: { question: 'Q3', reponses: [{ texte: 'A', suite: 'r3' }] },
  },
  resultats: {
    r1: { verdict: 'vert', titre: 'R1', conseil: 'c' },
    r2: { verdict: 'orange', titre: 'R2', conseil: 'c' },
    r3: { verdict: 'rouge', titre: 'R3', conseil: 'c' },
  },
};

describe('parcours de diagnostic', () => {
  it('démarre sur l’étape initiale', () => {
    expect(etapeCourante(demarrer(diag))).toBe('q1');
  });

  it('avance quand on répond', () => {
    expect(etapeCourante(repondre(demarrer(diag), 'q2'))).toBe('q2');
  });

  it('revient à la question précédente', () => {
    const etat = repondre(demarrer(diag), 'q2');
    expect(etapeCourante(precedente(etat))).toBe('q1');
  });

  it('ne revient pas avant la première question', () => {
    const etat = demarrer(diag);
    expect(peutRevenir(etat)).toBe(false);
    expect(precedente(etat)).toEqual(etat);
  });

  it('calcule la profondeur maximale restante', () => {
    expect(profondeurMax(diag, 'q1')).toBe(3);
    expect(profondeurMax(diag, 'q2')).toBe(2);
    expect(profondeurMax(diag, 'q3')).toBe(1);
    expect(profondeurMax(diag, 'r1')).toBe(0);
  });

  it('calcule la progression', () => {
    let etat = demarrer(diag);
    expect(progression(diag, etat)).toBe(0);
    etat = repondre(etat, 'q2');
    expect(progression(diag, etat)).toBeCloseTo(1 / 3);
    etat = repondre(etat, 'q3');
    expect(progression(diag, etat)).toBeCloseTo(2 / 3);
    etat = repondre(etat, 'r3');
    expect(progression(diag, etat)).toBe(1);
  });
});
```

Run: `npx jest src/fonctionnalites/diagnostic` → FAIL (module introuvable).

- [ ] **Step 2: Implémenter `parcours.ts`**

```typescript
// src/fonctionnalites/diagnostic/lib/parcours.ts
import { estResultat } from '@/domaine/diagnosticEngine';
import type { Diagnostic } from '@/domaine/types';

export interface EtatParcours {
  historique: string[];
}

export function demarrer(diag: Diagnostic): EtatParcours {
  return { historique: [diag.etapeInitiale] };
}

export function repondre(etat: EtatParcours, suite: string): EtatParcours {
  return { historique: [...etat.historique, suite] };
}

export function peutRevenir(etat: EtatParcours): boolean {
  return etat.historique.length > 1;
}

export function precedente(etat: EtatParcours): EtatParcours {
  return peutRevenir(etat) ? { historique: etat.historique.slice(0, -1) } : etat;
}

export function etapeCourante(etat: EtatParcours): string {
  return etat.historique[etat.historique.length - 1];
}

export function profondeurMax(diag: Diagnostic, id: string, dejaVus: Set<string> = new Set()): number {
  if (estResultat(diag, id) || dejaVus.has(id)) return 0;
  const etape = diag.etapes[id];
  if (!etape) return 0;
  const vus = new Set(dejaVus).add(id);
  return 1 + Math.max(0, ...etape.reponses.map((r) => profondeurMax(diag, r.suite, vus)));
}

export function progression(diag: Diagnostic, etat: EtatParcours): number {
  const courant = etapeCourante(etat);
  if (estResultat(diag, courant)) return 1;
  const repondues = etat.historique.length - 1;
  return repondues / (repondues + profondeurMax(diag, courant));
}
```

Run: `npx jest src/fonctionnalites/diagnostic/lib/parcours.test.ts` → PASS.

- [ ] **Step 3: Tests de la recherche (failing)**

```typescript
// src/fonctionnalites/diagnostic/lib/recherche.test.ts
import type { Diagnostic } from '@/domaine/types';
import { filtrerPannes, normaliser } from './recherche';

const panne = (id: string, titre: string, categorie: Diagnostic['categorie'], motsCles: string[]): Diagnostic => ({
  id, titre, categorie, motsCles, icone: 'droplets', etapeInitiale: 'r', etapes: {},
  resultats: { r: { verdict: 'vert', titre: 't', conseil: 'c' } },
});

const pannes = [
  panne('evier', 'Évier bouché', 'plomberie', ['lavabo']),
  panne('wc', 'WC bouché', 'plomberie', ['toilettes']),
  panne('disj', 'Disjoncteur qui saute', 'electricite', ['tableau']),
];

describe('recherche des pannes', () => {
  it('normalise accents et majuscules', () => {
    expect(normaliser('  Évier ')).toBe('evier');
  });

  it('filtre par catégorie sans recherche', () => {
    expect(filtrerPannes(pannes, 'electricite', '').map((p) => p.id)).toEqual(['disj']);
  });

  it('cherche sans tenir compte des accents', () => {
    expect(filtrerPannes(pannes, 'plomberie', 'evier').map((p) => p.id)).toEqual(['evier']);
  });

  it('cherche dans les mots-clés', () => {
    expect(filtrerPannes(pannes, 'plomberie', 'toilettes').map((p) => p.id)).toEqual(['wc']);
  });

  it('cherche dans toutes les catégories quand on tape un mot', () => {
    expect(filtrerPannes(pannes, 'plomberie', 'tableau').map((p) => p.id)).toEqual(['disj']);
  });

  it('renvoie une liste vide si rien ne correspond', () => {
    expect(filtrerPannes(pannes, 'plomberie', 'piscine')).toEqual([]);
  });
});
```

Run: `npx jest src/fonctionnalites/diagnostic/lib/recherche.test.ts` → FAIL.

- [ ] **Step 4: Implémenter `recherche.ts`**

```typescript
// src/fonctionnalites/diagnostic/lib/recherche.ts
import type { Categorie, Diagnostic } from '@/domaine/types';

export function normaliser(texte: string): string {
  return texte.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
}

export function filtrerPannes(pannes: Diagnostic[], categorie: Categorie, recherche: string): Diagnostic[] {
  const q = normaliser(recherche);
  if (!q) return pannes.filter((p) => p.categorie === categorie);
  return pannes.filter((p) => [p.titre, ...p.motsCles].some((t) => normaliser(t).includes(q)));
}
```

Run: `npx jest src/fonctionnalites/diagnostic` → PASS.

- [ ] **Step 5: Créer le hook**

```typescript
// src/fonctionnalites/diagnostic/hooks/useParcoursDiagnostic.ts
import { useState } from 'react';
import { estResultat, getEtape, getResultat } from '@/domaine/diagnosticEngine';
import type { Diagnostic, Etape, Resultat } from '@/domaine/types';
import { demarrer, etapeCourante, peutRevenir, precedente, progression, repondre } from '../lib/parcours';

export function useParcoursDiagnostic(diag: Diagnostic) {
  const [etat, setEtat] = useState(() => demarrer(diag));
  const courant = etapeCourante(etat);
  const fini = estResultat(diag, courant);
  const etape: Etape | null = fini ? null : getEtape(diag, courant);
  const resultat: Resultat | null = fini ? getResultat(diag, courant) : null;
  return {
    etape,
    resultat,
    numeroQuestion: etat.historique.length,
    progression: progression(diag, etat),
    peutRevenir: peutRevenir(etat),
    repondre: (suite: string) => setEtat((e) => repondre(e, suite)),
    precedente: () => setEtat((e) => precedente(e)),
    recommencer: () => setEtat(demarrer(diag)),
  };
}
```

- [ ] **Step 6: Vérifier et committer**

Run: `npm test`, `npx tsc --noEmit` → vert.

```bash
git add src/fonctionnalites/diagnostic
git commit -m "Ajoute la logique du parcours de diagnostic et la recherche des pannes"
```

---

### Task 11: Écrans du parcours de diagnostic

**Files:**
- Create: `src/fonctionnalites/diagnostic/components/BarreProgression.tsx`, `src/fonctionnalites/diagnostic/components/CarteQuestion.tsx`, `src/fonctionnalites/diagnostic/components/CarteResultat.tsx`, `src/fonctionnalites/diagnostic/EcranChoixPanne.tsx`, `src/fonctionnalites/diagnostic/EcranDiagnostic.tsx`, `app/diagnostic/index.tsx`, `app/diagnostic/[id].tsx`
- Delete: `app/diagnostics/index.tsx`, `app/diagnostics/[id].tsx`
- Modify: `app/index.tsx` (lien `/diagnostics` → `/diagnostic`)

**Interfaces:**
- Consumes: `useParcoursDiagnostic`, `filtrerPannes`, `diagnostics`, `tutos`, `gestesUrgence`, `couleurCategorie`, kit UI.
- Produces: `EcranChoixPanne()`, `EcranDiagnostic({ id }: { id: string })`. Routes `/diagnostic` et `/diagnostic/[id]`.

- [ ] **Step 1: `BarreProgression.tsx` et `CarteQuestion.tsx`** (maquette `2-parcours-diagnostic.html`, écran 2)

```tsx
// src/fonctionnalites/diagnostic/components/BarreProgression.tsx
import { StyleSheet, View } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';

export function BarreProgression({ valeur }: { valeur: number }) {
  const { couleurs } = useTheme();
  return (
    <View style={[styles.fond, { backgroundColor: couleurs.bordure }]}>
      <View style={[styles.plein, { width: `${Math.round(valeur * 100)}%`, backgroundColor: couleurs.accent }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  fond: { height: 6, borderRadius: 3, overflow: 'hidden' },
  plein: { height: '100%', borderRadius: 3 },
});
```

```tsx
// src/fonctionnalites/diagnostic/components/CarteQuestion.tsx
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { Etape } from '@/domaine/types';
import { useTheme } from '@/theme/ThemeProvider';

export function CarteQuestion({ etape, onRepondre }: { etape: Etape; onRepondre: (suite: string) => void }) {
  const { couleurs } = useTheme();
  return (
    <View style={styles.bloc}>
      <Text style={[styles.question, { color: couleurs.texte }]}>{etape.question}</Text>
      {etape.reponses.map((reponse) => (
        <Pressable
          key={reponse.texte}
          accessibilityRole="button"
          onPress={() => onRepondre(reponse.suite)}
          style={[
            styles.reponse,
            { backgroundColor: couleurs.carte, borderColor: couleurs.bordure },
            reponse.inconnu && styles.pointille,
          ]}
        >
          <Text style={[styles.texte, { color: reponse.inconnu ? couleurs.texteDiscret : couleurs.texte }]}>
            {reponse.texte}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  bloc: { gap: 10 },
  question: { fontSize: 22, fontWeight: '700', lineHeight: 29, marginBottom: 6 },
  reponse: { borderWidth: 1, borderRadius: 14, paddingVertical: 15, paddingHorizontal: 14 },
  pointille: { borderStyle: 'dashed' },
  texte: { fontSize: 15, fontWeight: '600' },
});
```

- [ ] **Step 2: `CarteResultat.tsx`** (maquette écrans 3a/3b ; ordre selon le verdict, spec §5)

```tsx
// src/fonctionnalites/diagnostic/components/CarteResultat.tsx
import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import type { Resultat } from '@/domaine/types';
import { gestesUrgence } from '@/donnees/gestesUrgence';
import { tutos } from '@/donnees/tutos';
import { useTheme } from '@/theme/ThemeProvider';
import { BoutonPrincipal } from '@/ui/BoutonPrincipal';
import { CarteListe } from '@/ui/CarteListe';
import { NumeroUrgence } from '@/ui/NumeroUrgence';
import { VerdictBadge } from '@/ui/VerdictBadge';

export function CarteResultat({ resultat, onRecommencer }: { resultat: Resultat; onRecommencer: () => void }) {
  const { couleurs } = useTheme();
  const tuto = tutos.find((t) => t.id === resultat.tutoId);
  const geste = gestesUrgence.find((g) => g.id === resultat.gesteUrgenceId);

  const boutonTuto = tuto ? (
    <BoutonPrincipal
      key="tuto"
      libelle={`Voir le tuto (${tuto.duree})`}
      icone="book-open"
      onPress={() => router.push({ pathname: '/tutos/[id]', params: { id: tuto.id } })}
    />
  ) : null;
  const carteGeste = geste ? (
    <CarteListe
      key="geste"
      icone={geste.icone}
      couleur={couleurs.danger}
      titre={geste.titre}
      sousTitre="Geste de sécurité"
      onPress={() => router.push({ pathname: '/urgences/[id]', params: { id: geste.id } })}
    />
  ) : null;
  const numero = resultat.numeroUtile ? <NumeroUrgence key="numero" numero={resultat.numeroUtile} /> : null;

  const actions =
    resultat.verdict === 'vert' ? [boutonTuto, carteGeste] :
    resultat.verdict === 'orange' ? [carteGeste, numero, boutonTuto] :
    [numero, carteGeste, boutonTuto];

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
});
```

- [ ] **Step 3: `EcranChoixPanne.tsx`** (maquette écran 1)

```tsx
// src/fonctionnalites/diagnostic/EcranChoixPanne.tsx
import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, TextInput } from 'react-native';
import type { Categorie } from '@/domaine/types';
import { diagnostics } from '@/donnees/diagnostics';
import { couleurCategorie } from '@/theme/couleurCategorie';
import { useTheme } from '@/theme/ThemeProvider';
import { CarteListe } from '@/ui/CarteListe';
import { EnTete } from '@/ui/EnTete';
import { FondEcran } from '@/ui/FondEcran';
import { Icone } from '@/ui/Icone';
import { Onglets } from '@/ui/Onglets';
import { Verre } from '@/ui/Verre';
import { filtrerPannes } from './lib/recherche';

export function EcranChoixPanne() {
  const { couleurs } = useTheme();
  const [categorie, setCategorie] = useState<Categorie>('plomberie');
  const [recherche, setRecherche] = useState('');
  const liste = filtrerPannes(diagnostics, categorie, recherche);
  return (
    <FondEcran>
      <EnTete titre="Quelle panne ?" action="retour" />
      <Onglets
        options={[
          { valeur: 'plomberie', libelle: 'Plomberie' },
          { valeur: 'electricite', libelle: 'Électricité' },
        ]}
        valeur={categorie}
        onChange={setCategorie}
      />
      <Verre style={styles.recherche}>
        <Icone nom="search" couleur={couleurs.texteDiscret} taille={16} />
        <TextInput
          value={recherche}
          onChangeText={setRecherche}
          placeholder="Chercher : « fuite », « WC »…"
          placeholderTextColor={couleurs.texteDiscret}
          style={[styles.champ, { color: couleurs.texte }]}
        />
      </Verre>
      {liste.map((panne) => (
        <CarteListe
          key={panne.id}
          icone={panne.icone}
          couleur={couleurCategorie(couleurs, panne.categorie)}
          titre={panne.titre}
          onPress={() => router.push({ pathname: '/diagnostic/[id]', params: { id: panne.id } })}
        />
      ))}
      {liste.length === 0 ? (
        <Text style={[styles.vide, { color: couleurs.texteDiscret }]}>Aucune panne trouvée.</Text>
      ) : null}
    </FondEcran>
  );
}

const styles = StyleSheet.create({
  recherche: { flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 12, paddingHorizontal: 12 },
  champ: { flex: 1, fontSize: 14, paddingVertical: 11 },
  vide: { fontSize: 14, textAlign: 'center', marginTop: 12 },
});
```

- [ ] **Step 4: `EcranDiagnostic.tsx`** (maquette écrans 2 et 3)

```tsx
// src/fonctionnalites/diagnostic/EcranDiagnostic.tsx
import { Pressable, StyleSheet, Text } from 'react-native';
import type { Diagnostic } from '@/domaine/types';
import { diagnostics } from '@/donnees/diagnostics';
import { useTheme } from '@/theme/ThemeProvider';
import { EnTete } from '@/ui/EnTete';
import { FondEcran } from '@/ui/FondEcran';
import { BarreProgression } from './components/BarreProgression';
import { CarteQuestion } from './components/CarteQuestion';
import { CarteResultat } from './components/CarteResultat';
import { useParcoursDiagnostic } from './hooks/useParcoursDiagnostic';

function Parcours({ diagnostic }: { diagnostic: Diagnostic }) {
  const { couleurs } = useTheme();
  const parcours = useParcoursDiagnostic(diagnostic);
  if (parcours.resultat) {
    return (
      <FondEcran>
        <EnTete titre="Résultat" action="fermer" />
        <CarteResultat resultat={parcours.resultat} onRecommencer={parcours.recommencer} />
      </FondEcran>
    );
  }
  return (
    <FondEcran>
      <EnTete titre={diagnostic.titre} action="fermer" />
      <BarreProgression valeur={parcours.progression} />
      <Text style={[styles.numero, { color: couleurs.texteDiscret }]}>Question {parcours.numeroQuestion}</Text>
      {parcours.etape ? <CarteQuestion etape={parcours.etape} onRepondre={parcours.repondre} /> : null}
      {parcours.peutRevenir ? (
        <Pressable onPress={parcours.precedente} accessibilityRole="button">
          <Text style={[styles.precedente, { color: couleurs.accent }]}>← Question précédente</Text>
        </Pressable>
      ) : null}
    </FondEcran>
  );
}

export function EcranDiagnostic({ id }: { id: string }) {
  const { couleurs } = useTheme();
  const diagnostic = diagnostics.find((d) => d.id === id);
  if (!diagnostic) {
    return (
      <FondEcran>
        <EnTete titre="Diagnostic" action="retour" />
        <Text style={{ color: couleurs.texte }}>Diagnostic introuvable.</Text>
      </FondEcran>
    );
  }
  return <Parcours key={diagnostic.id} diagnostic={diagnostic} />;
}

const styles = StyleSheet.create({
  numero: { fontSize: 12.5 },
  precedente: { fontSize: 14, textAlign: 'center', marginTop: 12 },
});
```

(`key={diagnostic.id}` remet le parcours à zéro si l'écran est réutilisé pour une autre panne.)

- [ ] **Step 5: Routes, suppression des anciennes, lien de l'ancien accueil**

```tsx
// app/diagnostic/index.tsx
import { EcranChoixPanne } from '@/fonctionnalites/diagnostic/EcranChoixPanne';

export default function RouteChoixPanne() {
  return <EcranChoixPanne />;
}
```

```tsx
// app/diagnostic/[id].tsx
import { useLocalSearchParams } from 'expo-router';
import { EcranDiagnostic } from '@/fonctionnalites/diagnostic/EcranDiagnostic';

export default function RouteDiagnostic() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <EcranDiagnostic id={id} />;
}
```

```bash
git rm app/diagnostics/index.tsx "app/diagnostics/[id].tsx"
```

Dans `app/index.tsx` (ancien accueil V1, remplacé à la tâche 12), remplacer la chaîne `'/diagnostics'` par `'/diagnostic'`.

- [ ] **Step 6: Vérifier et committer**

Run: `npm test`, export web puis `npx tsc --noEmit` → vert ; `rm -rf dist-check`.

```bash
git add -A src/fonctionnalites/diagnostic app/diagnostic app/diagnostics app/index.tsx
git commit -m "Refait le parcours de diagnostic avec progression et retour arrière"
```

---

### Task 12: Écran d'accueil (carte factice, logo, panneau)

**Files:**
- Create: `src/fonctionnalites/accueil/EcranAccueil.tsx`, `src/fonctionnalites/accueil/components/FondCarte.tsx`, `src/fonctionnalites/accueil/components/Logo.tsx`, `src/fonctionnalites/accueil/components/PanneauAccueil.tsx`
- Modify (remplacement complet): `app/index.tsx`

**Interfaces:**
- Consumes: kit UI, `useTheme`, `MARGE_BARRE` (`@/ui/FondEcran`).
- Produces: `EcranAccueil()`, route `/`.

- [ ] **Step 1: `FondCarte.tsx`** — fond de carte factice (routes, blocs, parc, rivière, point bleu), maquette `1-accueil.html`

```tsx
// src/fonctionnalites/accueil/components/FondCarte.tsx
import { StyleSheet, View, type DimensionValue } from 'react-native';
import { teinte } from '@/theme/teinte';
import { useTheme } from '@/theme/ThemeProvider';

type Forme = { left: DimensionValue; top: DimensionValue; width: DimensionValue; height: DimensionValue };

const GRANDES_ROUTES: Forme[] = [
  { left: 0, top: '42%', width: '100%', height: 10 },
  { left: '42%', top: 0, width: 10, height: '100%' },
];
const ROUTES: Forme[] = [
  { left: 0, top: '14%', width: '100%', height: 6 },
  { left: '72%', top: 0, width: 6, height: '100%' },
  { left: '13%', top: 0, width: 6, height: '100%' },
  { left: 0, top: '66%', width: '100%', height: 6 },
];
const BLOCS: Forme[] = [
  { left: '18%', top: '17%', width: '20%', height: '8%' },
  { left: '76%', top: '17%', width: '17%', height: '10%' },
  { left: '18%', top: '46%', width: '20%', height: '9%' },
  { left: '48%', top: '70%', width: '20%', height: '8%' },
];

export function FondCarte() {
  const { couleurs } = useTheme();
  const rect = (formes: Forme[], couleur: string, rayon = 0) =>
    formes.map((f, i) => <View key={i} style={[styles.abs, f, { backgroundColor: couleur, borderRadius: rayon }]} />);
  return (
    <View style={[StyleSheet.absoluteFill, { backgroundColor: couleurs.carteSol }]} pointerEvents="none">
      <View style={[styles.abs, styles.riviere, { backgroundColor: couleurs.carteEau }]} />
      {rect(ROUTES, couleurs.carteRoute)}
      {rect(GRANDES_ROUTES, couleurs.carteRouteGrande)}
      {rect(BLOCS, couleurs.carteBloc, 4)}
      <View style={[styles.abs, styles.parc, { backgroundColor: couleurs.carteParc }]} />
      <View style={[styles.abs, styles.halo, { backgroundColor: teinte(couleurs.accent, 0.12) }]} />
      <View style={[styles.abs, styles.haloProche, { backgroundColor: teinte(couleurs.accent, 0.25) }]} />
      <View style={[styles.abs, styles.point, { backgroundColor: couleurs.accent, borderColor: couleurs.surAccent }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  abs: { position: 'absolute' },
  riviere: { left: '-10%', top: '26%', width: '120%', height: 26, transform: [{ rotate: '-12deg' }] },
  parc: { left: '48%', top: '32%', width: '20%', height: '8%', borderRadius: 10 },
  halo: { left: '42%', top: '42%', width: 60, height: 60, borderRadius: 30, marginLeft: -25, marginTop: -25 },
  haloProche: { left: '42%', top: '42%', width: 36, height: 36, borderRadius: 18, marginLeft: -13, marginTop: -13 },
  point: { left: '42%', top: '42%', width: 16, height: 16, borderRadius: 8, borderWidth: 3, marginLeft: -3, marginTop: -3 },
});
```

- [ ] **Step 2: `Logo.tsx`** — pictogramme maison + clé (mêmes tracés que la maquette), dans un carré de verre

```tsx
// src/fonctionnalites/accueil/components/Logo.tsx
import { StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from '@/theme/ThemeProvider';
import { Verre } from '@/ui/Verre';

export function Logo() {
  const { couleurs } = useTheme();
  return (
    <Verre style={[styles.cadre, { shadowColor: couleurs.accent }]}>
      <Svg viewBox="0 0 24 24" width={22} height={22} fill="none" stroke={couleurs.accent} strokeWidth={2}
        strokeLinecap="round" strokeLinejoin="round">
        <Path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z" />
        <Path d="M14.5 11.5a2.5 2.5 0 0 0-3.4 3.2l-2.6 2.6a.9.9 0 0 0 1.3 1.3l2.6-2.6a2.5 2.5 0 0 0 3.2-3.4l-1.4 1.4-1.1-1.1z" />
      </Svg>
    </Verre>
  );
}

const styles = StyleSheet.create({
  cadre: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
});
```

- [ ] **Step 3: `PanneauAccueil.tsx`**

```tsx
// src/fonctionnalites/accueil/components/PanneauAccueil.tsx
import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { BoutonPrincipal } from '@/ui/BoutonPrincipal';
import { Verre } from '@/ui/Verre';

export function PanneauAccueil() {
  const { couleurs } = useTheme();
  return (
    <Verre style={styles.panneau}>
      <View style={[styles.poignee, { backgroundColor: couleurs.bordure }]} />
      <BoutonPrincipal libelle="Diagnostiquer une panne" icone="stethoscope" onPress={() => router.push('/diagnostic')} />
      <Text style={[styles.avertissement, { color: couleurs.texteDiscret }]}>
        Conseils uniquement — ne remplace pas un professionnel.
      </Text>
    </Verre>
  );
}

const styles = StyleSheet.create({
  panneau: { borderRadius: 24, padding: 12, gap: 10 },
  poignee: { width: 38, height: 4, borderRadius: 2, alignSelf: 'center' },
  avertissement: { fontSize: 11.5, textAlign: 'center' },
});
```

- [ ] **Step 4: `EcranAccueil.tsx`**

```tsx
// src/fonctionnalites/accueil/EcranAccueil.tsx
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/theme/ThemeProvider';
import { MARGE_BARRE } from '@/ui/FondEcran';
import { FondCarte } from './components/FondCarte';
import { Logo } from './components/Logo';
import { PanneauAccueil } from './components/PanneauAccueil';

export function EcranAccueil() {
  const { couleurs } = useTheme();
  const { top } = useSafeAreaInsets();
  return (
    <View style={[styles.racine, { backgroundColor: couleurs.carteSol }]}>
      <FondCarte />
      <View style={[styles.logo, { top: top + 12 }]}>
        <Logo />
      </View>
      <View style={[styles.panneau, { bottom: MARGE_BARRE - 20 }]}>
        <PanneauAccueil />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  racine: { flex: 1 },
  logo: { position: 'absolute', left: 16 },
  panneau: { position: 'absolute', left: 10, right: 10 },
});
```

- [ ] **Step 5: Remplacer `app/index.tsx`**

```tsx
// app/index.tsx
import { EcranAccueil } from '@/fonctionnalites/accueil/EcranAccueil';

export default function RouteAccueil() {
  return <EcranAccueil />;
}
```

- [ ] **Step 6: Vérifier et committer**

Run: `npm test`, export web puis `npx tsc --noEmit` → vert ; `rm -rf dist-check`.

```bash
git add src/fonctionnalites/accueil app/index.tsx
git commit -m "Refait l'accueil avec la carte et le panneau Diagnostic"
```

---

### Task 13: Navigation par onglets et barre flottante

**Files:**
- Create: `src/navigation/BarreNavigation.tsx`, `app/(onglets)/_layout.tsx`, `app/(onglets)/(accueil)/_layout.tsx`, `app/(onglets)/urgences/_layout.tsx`, `app/(onglets)/tutos/_layout.tsx`, `app/(onglets)/reglages/_layout.tsx`
- Move (git mv, contenu inchangé) : `app/index.tsx` → `app/(onglets)/(accueil)/index.tsx` ; `app/diagnostic/` → `app/(onglets)/(accueil)/diagnostic/` ; `app/urgences/index.tsx` et `app/urgences/[id].tsx` → `app/(onglets)/urgences/` ; `app/tutos/index.tsx` et `app/tutos/[id].tsx` → `app/(onglets)/tutos/` ; `app/pros.tsx` → `app/(onglets)/pros.tsx` ; `app/reglages/index.tsx` et `app/reglages/a-propos.tsx` → `app/(onglets)/reglages/`
- Modify: `app/_layout.tsx`

**Interfaces:**
- Consumes: `Tabs` d'`expo-router`, `Verre`, `Icone`, `useTheme`, `teinte`.
- Produces: `BarreNavigation(props)` (props = celles que `Tabs` passe à `tabBar`). Les URL ne changent pas (les groupes entre parenthèses n'apparaissent pas dans l'URL).

- [ ] **Step 1: Déplacer les routes**

```bash
mkdir -p "app/(onglets)/(accueil)" "app/(onglets)/urgences" "app/(onglets)/tutos" "app/(onglets)/reglages"
git mv app/index.tsx "app/(onglets)/(accueil)/index.tsx"
git mv app/diagnostic "app/(onglets)/(accueil)/diagnostic"
git mv app/urgences/index.tsx "app/(onglets)/urgences/index.tsx"
git mv "app/urgences/[id].tsx" "app/(onglets)/urgences/[id].tsx"
git mv app/tutos/index.tsx "app/(onglets)/tutos/index.tsx"
git mv "app/tutos/[id].tsx" "app/(onglets)/tutos/[id].tsx"
git mv app/pros.tsx "app/(onglets)/pros.tsx"
git mv app/reglages/index.tsx "app/(onglets)/reglages/index.tsx"
git mv app/reglages/a-propos.tsx "app/(onglets)/reglages/a-propos.tsx"
```

Les imports utilisent `@/`, ils restent valides. Vérifier qu'il ne reste que `app/_layout.tsx` et `app/(onglets)/` dans `app/`.

- [ ] **Step 2: Piles (Stack) de chaque onglet**

Créer ces 4 fichiers avec ce contenu identique (seul le nom de la fonction change : `LayoutAccueil`, `LayoutUrgences`, `LayoutTutos`, `LayoutReglages`) :

```tsx
// app/(onglets)/(accueil)/_layout.tsx
import { Stack } from 'expo-router';

export default function LayoutAccueil() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
```

```tsx
// app/(onglets)/urgences/_layout.tsx
import { Stack } from 'expo-router';

export default function LayoutUrgences() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
```

```tsx
// app/(onglets)/tutos/_layout.tsx
import { Stack } from 'expo-router';

export default function LayoutTutos() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
```

```tsx
// app/(onglets)/reglages/_layout.tsx
import { Stack } from 'expo-router';

export default function LayoutReglages() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
```

- [ ] **Step 3: `BarreNavigation.tsx`** (maquette `1-accueil.html` : pilule de verre centrée en bas, onglet actif fond `accent`, Urgences teinté rouge pâle, Tutos en pilule avec texte)

```tsx
// src/navigation/BarreNavigation.tsx
import type { Tabs } from 'expo-router';
import type { ComponentProps } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NomIcone } from '@/domaine/icones';
import { useTheme } from '@/theme/ThemeProvider';
import { Icone } from '@/ui/Icone';
import { Verre } from '@/ui/Verre';

type PropsBarre = Parameters<NonNullable<ComponentProps<typeof Tabs>['tabBar']>>[0];

const ONGLETS: Record<string, { icone: NomIcone; libelle: string; pilule?: boolean; danger?: boolean }> = {
  '(accueil)': { icone: 'house', libelle: 'Accueil' },
  urgences: { icone: 'triangle-alert', libelle: 'Urgences', danger: true },
  tutos: { icone: 'book-open', libelle: 'Tutos', pilule: true },
  pros: { icone: 'map-pin', libelle: 'Pros' },
  reglages: { icone: 'settings', libelle: 'Réglages' },
};

export function BarreNavigation({ state, navigation }: PropsBarre) {
  const { couleurs } = useTheme();
  const { bottom } = useSafeAreaInsets();
  return (
    <View style={[styles.conteneur, { bottom: bottom + 12 }]} pointerEvents="box-none">
      <Verre style={styles.barre}>
        {state.routes.map((route, index) => {
          const onglet = ONGLETS[route.name];
          if (!onglet) return null;
          const actif = state.index === index;
          const couleur = actif ? couleurs.surAccent : onglet.danger ? couleurs.dangerTexte : couleurs.texteDiscret;
          const aller = () => {
            const evenement = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
            if (!actif && !evenement.defaultPrevented) navigation.navigate(route.name);
          };
          return (
            <Pressable
              key={route.key}
              onPress={aller}
              accessibilityRole="tab"
              accessibilityLabel={onglet.libelle}
              accessibilityState={{ selected: actif }}
              style={[styles.bouton, onglet.pilule && styles.pilule, actif && { backgroundColor: couleurs.accent }]}
            >
              <Icone nom={onglet.icone} couleur={couleur} taille={onglet.pilule ? 16 : 20} />
              {onglet.pilule ? <Text style={[styles.texte, { color: couleur }]}>{onglet.libelle}</Text> : null}
            </Pressable>
          );
        })}
      </Verre>
    </View>
  );
}

const styles = StyleSheet.create({
  conteneur: { position: 'absolute', left: 0, right: 0, alignItems: 'center' },
  barre: { flexDirection: 'row', gap: 4, padding: 6, borderRadius: 26 },
  bouton: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  pilule: { width: 'auto', flexDirection: 'row', gap: 6, paddingHorizontal: 14 },
  texte: { fontSize: 13, fontWeight: '600' },
});
```

Note : si `navigation.navigate(route.name)` est refusé par TypeScript (typage des routes), utiliser `navigation.navigate(route.name, route.params)` ; ne pas ajouter de dépendance (`@react-navigation/bottom-tabs` n'est **pas** autorisé).

- [ ] **Step 4: Layout des onglets**

```tsx
// app/(onglets)/_layout.tsx
import { Tabs } from 'expo-router';
import { BarreNavigation } from '@/navigation/BarreNavigation';

export default function LayoutOnglets() {
  return (
    <Tabs tabBar={(props) => <BarreNavigation {...props} />} screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="(accueil)" />
      <Tabs.Screen name="urgences" />
      <Tabs.Screen name="tutos" />
      <Tabs.Screen name="pros" />
      <Tabs.Screen name="reglages" />
    </Tabs>
  );
}
```

- [ ] **Step 5: Layout racine final**

```tsx
// app/_layout.tsx
import { Stack } from 'expo-router';
import { ReglagesProvider } from '@/fonctionnalites/reglages/ReglagesProvider';
import { ThemeProvider } from '@/theme/ThemeProvider';

export default function RootLayout() {
  return (
    <ReglagesProvider>
      <ThemeProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(onglets)" />
        </Stack>
      </ThemeProvider>
    </ReglagesProvider>
  );
}
```

- [ ] **Step 6: Vérifier**

Run: export web (sans avertissement « extraneous route ») puis `npx tsc --noEmit` → 0 erreur ; `npm test` → vert ; `rm -rf dist-check`.
Vérifier dans le rapport que les URL `/`, `/diagnostic`, `/diagnostic/fuite-eau`, `/urgences`, `/urgences/couper-gaz`, `/tutos`, `/tutos/deboucher-wc`, `/pros`, `/reglages`, `/reglages/a-propos` figurent dans la liste des routes générées par l'export.

- [ ] **Step 7: Commit**

```bash
git add -A app src/navigation
git commit -m "Ajoute la barre de navigation flottante à 5 onglets"
```

---

### Task 14: Garde-fou « aucune couleur en dur » et vérification finale

**Files:**
- Create: `src/theme/couleursEnDur.test.ts`
- Modify: tout fichier signalé par le test (remplacer la couleur par un token existant de `Couleurs` ou `teinte()`)

**Interfaces:**
- Consumes: tout le code de `src/` et `app/`.

- [ ] **Step 1: Écrire le test**

```typescript
// src/theme/couleursEnDur.test.ts
import { readdirSync, readFileSync, statSync } from 'fs';
import { join, relative } from 'path';

const RACINE = join(__dirname, '..', '..');
const DOSSIERS = ['src', 'app'];
const EXCLU = join(RACINE, 'src', 'theme');
const COULEUR = /#[0-9a-fA-F]{3,8}\b|rgba?\(/;

function fichiers(dossier: string): string[] {
  return readdirSync(dossier).flatMap((nom) => {
    const chemin = join(dossier, nom);
    if (statSync(chemin).isDirectory()) return chemin.startsWith(EXCLU) ? [] : fichiers(chemin);
    return /\.(ts|tsx)$/.test(nom) && !/\.test\.(ts|tsx)$/.test(nom) ? [chemin] : [];
  });
}

describe('couleurs', () => {
  it("aucune couleur n'est écrite en dur hors de src/theme", () => {
    const fautes = DOSSIERS.flatMap((d) => fichiers(join(RACINE, d)))
      .flatMap((f) =>
        readFileSync(f, 'utf8')
          .split('\n')
          .map((ligne, i) => ({ ligne, i }))
          .filter(({ ligne }) => COULEUR.test(ligne))
          .map(({ i }) => `${relative(RACINE, f)}:${i + 1}`),
      );
    expect(fautes).toEqual([]);
  });
});
```

- [ ] **Step 2: Lancer et corriger**

Run: `npx jest src/theme/couleursEnDur.test.ts`
Expected: PASS. Si des lignes sont listées, remplacer chaque couleur par le token équivalent de `useTheme().couleurs` (ou `teinte(token, alpha)`), sans ajouter de nouveau token sauf nécessité (le signaler alors dans le rapport), puis relancer jusqu'à PASS.

- [ ] **Step 3: Vérification finale complète**

Run, dans l'ordre :
- `npm test` → tous les tests PASS (rapporter le nombre)
- `npx expo export --platform web --output-dir dist-check` → succès, sans avertissement de route
- `npx tsc --noEmit` → 0 erreur
- `rm -rf dist-check`
- Contrôle des tailles : `find app src -name "*.ts*" ! -name "*.test.*" | xargs wc -l | sort -n | tail -15` → aucun fichier `app/` > 30 lignes, aucun composant > 250, aucun écran > 350. Rapporter la liste.
- `git status --short` → propre après commit.

- [ ] **Step 4: Commit**

```bash
git add -A src app
git commit -m "Ajoute le test qui interdit les couleurs en dur"
```

Après cette tâche, le contrôleur vérifie visuellement la version web (thème sombre puis clair, viewport mobile) contre les 4 maquettes, puis André teste sur son téléphone avec Expo Go.
