# Chantier C — Contenu des 22 pannes, renvois et schémas animés — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Passer de 6 à 22 pannes (16 plomberie, 6 électricité) et de 4 à 16 tutos, ajouter les « renvois » (un résultat ouvre un autre diagnostic ou la fiche « Odeur de gaz ? ») et deux schémas animés dans les tutos (`siphon`, `disjoncteur`).

**Architecture:** Le contenu reste embarqué (JSON pour les pannes, `tutos.ts` pour les tutos) et validé par des tests de données. Un résultat gagne un champ optionnel `renvoi` (validé : la cible doit exister) affiché par une petite carte `CarteRenvoi` dans `CarteResultat`. Une étape de tuto peut être un texte ou `{ texte, schema }` ; `EtapesList` affiche alors `SchemaAnime`, un dessin `react-native-svg` dont les positions sont calculées par des fonctions pures (testées) à partir d'un temps qui tourne en boucle (`requestAnimationFrame`), immobile si l'utilisateur a demandé de réduire les animations.

**Tech Stack:** Expo SDK 57, React Native 0.86, Expo Router, TypeScript strict, Jest (`jest-expo`), `react-native-svg` 15.15 (déjà installé), `AccessibilityInfo` de React Native.

**Spec:** [docs/superpowers/specs/2026-09-30-depannmaison-v2-design.md](../specs/2026-09-30-depannmaison-v2-design.md) §1, §2, §6, §8, §9, §12 — contenu source : [docs/contenu/pannes-v2.md](../../contenu/pannes-v2.md) (22 arbres, tutos, « Décisions d'André (01/10) ») — maquette validée : [8-renvois-schemas.html](../../design/maquettes-v2/8-renvois-schemas.html) (renvoi diagnostic, renvoi gaz, tuto avec schéma siphon, tuto avec schéma disjoncteur) et [2-parcours-diagnostic.html](../../design/maquettes-v2/2-parcours-diagnostic.html) (liste qui défile : 16 plomberie, 6 électricité).

## Global Constraints

- Tout en français : textes, noms métier, commentaires, messages de commit (simples, sans jargon), terminés par la ligne `Co-Authored-By:` du modèle qui écrit.
- Textes de l'appli : tutoiement, mots simples, aucune connaissance technique supposée, sécurité d'abord.
- Règles de sécurité CLAUDE.md : jamais de tableau électrique ouvert, d'intervention gaz ou de travail en hauteur → toujours un pro. Tout ce qui touche au gaz = verdict 🔴 + numéro d'urgence gaz `0800 47 33 33` + renvoi vers Urgences › « Odeur de gaz ? » (`couper-gaz`). Pas de tuto sur un verdict rouge.
- Les maquettes font foi pour le visuel. Aucun écran ni changement visuel hors maquette 8 / maquettes déjà validées.
- Aucune couleur en dur hors de `src/theme/` (le test `src/theme/couleursEnDur.test.ts` cherche `#` + 3 à 8 chiffres hexadécimaux et `rgba(` / `rgb(` dans `src/` et `app/`). Les schémas reçoivent les couleurs du thème (`useTheme()`).
- Aucune nouvelle dépendance. **Ne pas importer `react-native-reanimated`** (présent seulement comme dépendance indirecte : l'utiliser demanderait de l'ajouter au `package.json`, un plugin Babel et un nouveau build natif).
- `app/` : routes minces, rien à y changer. Composant 80–150 lignes (plafond ~250), écran 150–250 (~350), hook/lib 100–200 (~300). `lib/` pur et testé, tests à côté du fichier. Imports via `@/`.
- Vérification : `npx jest`, puis types des routes régénérés avec `rm -f .expo/types/router.d.ts && timeout 60 npx expo start --web --port 8099`, puis `npx tsc --noEmit` (0 erreur). **Ne jamais utiliser `npx expo export`.** Ne jamais lancer de serveur sur les ports 8081 ou 8082. Aucun processus Expo laissé actif.
- Ne jamais committer `dist-check/`, `.expo/`, `node_modules/`, `.superpowers/`, `/android`, `/ios`.

### Décisions de ce plan

- **Format des étapes :** `type EtapeTuto = string | { texte: string; schema: NomSchema }`. Les tutos et gestes existants restent des listes de textes ; seules les étapes avec schéma deviennent des objets. `EtapesList` accepte `readonly EtapeTuto[]`, donc les gestes d'urgence (`string[]`) passent sans changement.
- **Renvoi :** `Resultat.renvoi?: Renvoi` avec `type Renvoi = { type: 'diagnostic'; id: string } | { type: 'urgence'; id: string }`. Carte placée juste après le conseil, avant toute autre action (maquette 8). Diagnostic : pastille `stethoscope` bleue (`accent`), titre = titre du diagnostic cible, sous-titre « Continuer avec ce diagnostic », ouvre `/diagnostic/[id]` (nouvel écran, le parcours démarre à la 1re question). Urgence : pastille = icône du geste (`flame`), couleur `danger`, titre = titre du geste (« Odeur de gaz ? »), sous-titre « Consignes et numéro d'urgence » (ou « Consignes de sécurité » si le geste n'a pas de numéro), ouvre `/urgences/[id]`. Bordure de la carte teintée à 40 % de la couleur (maquette 8) via une nouvelle prop `couleurBordure` de `CarteListe`.
- **Gaz :** le résultat gaz (panne 12) porte `renvoi: { type: 'urgence', id: 'couper-gaz' }` + `numeroUtile: "0800 47 33 33"`, sans `gesteUrgenceId` (sinon deux cartes « Odeur de gaz ? »). Le bouton d'appel du numéro s'affiche sous la carte de renvoi (règle CLAUDE.md, petit ajout par rapport à la maquette 8). Sur un verdict rouge avec renvoi vers Urgences, **les pros ne sont pas proposés** (un plombier n'est pas le bon interlocuteur pour le gaz).
- **Schémas :** dessins `react-native-svg` dont les attributs (`y`, `cy`, `opacity`) sont recalculés ~30 fois par seconde à partir d'un temps `t ∈ [0, 1[` (hook `useTempsBoucle`, `requestAnimationFrame`). Choisi plutôt que `Animated` car animer des attributs SVG avec `Animated` n'est pas fiable sur le web ; ici rien ne dépend de la plateforme. Si « réduire les animations » est activé (`AccessibilityInfo.isReduceMotionEnabled`), le schéma est figé sur son état final (siphon plein ; levier en haut + coche).
- **Titres des résultats** (champ obligatoire mais non affiché, le badge de verdict le remplace) : vert « Tu peux réparer ça toi-même », orange « Sécurise en attendant un pro », rouge « Appelle un pro tout de suite ».
- **Conversion fidèle au brouillon**, avec ces arbitrages : panne 12 « Oui, ou je ne suis pas sûr » séparée en « Oui » + « Je ne suis pas sûr » (pointillé), les deux vers le gaz ; panne 17 « Non / je ne sais pas » séparée en « Non » + « Je ne sais pas » (les deux vers Q3) ; panne 22 « Je ne sais pas / pas sûr » devient « Non, ou je ne suis pas sûr » (réponse normale, mène au tuto ampoule) ; conseils « R-piece » (pannes 20 et 21) repris de la maquette 8 ; conseils ampoule (pannes 21, 22) précisent « disjoncteur de la pièce coupé » (décision 4). Toute réponse dont le texte commence par « Je ne sais pas » porte `"inconnu": true` (testé), ainsi que « Je ne le trouve pas » et « Je ne suis pas sûr ».
- **Écran « Quelle panne ? » :** aucun changement. `FondEcran` défile déjà et les onglets Plomberie / Électricité filtrent ; la maquette 2 prévoit une liste qui défile (16 / 6). Un test vérifie les comptes.

---

## File Structure

```
src/domaine/
  etapes.ts (+ etapes.test.ts)          NOMS_SCHEMAS, NomSchema, EtapeTuto, estNomSchema(), texteEtape(), schemaEtape()
  types.ts                              + Renvoi, Resultat.renvoi ; Tuto.etapes: EtapeTuto[] (tâche 3)
  validateDiagnostic.ts (+ test)        + contrôle du renvoi ; validerRenvois()
src/ui/
  CarteListe.tsx                        + prop couleurBordure
  EtapesList.tsx                        étapes texte ou { texte, schema }
  schemas/animation.ts (+ test)         interpoler(), adoucir(), phaseBoucle(), imageSiphon(), imageDisjoncteur()
  schemas/useTempsBoucle.ts             temps en boucle (requestAnimationFrame)
  schemas/useMouvementReduit.ts         « réduire les animations »
  schemas/SchemaSiphon.tsx
  schemas/SchemaDisjoncteur.tsx
  schemas/SchemaAnime.tsx               cadre + choix du schéma + description accessible
src/fonctionnalites/diagnostic/
  lib/renvoi.ts (+ renvoi.test.ts)      decrireRenvoi(), prosVisibles()
  components/CarteRenvoi.tsx
  components/CarteResultat.tsx          affiche le renvoi en premier
src/donnees/
  tutos.ts                              16 tutos
  diagnostics/*.json + index.ts         22 pannes
  diagnostics.data.test.ts              22 ids, renvois, gaz, « Je ne sais pas », comptes
  gestesEtTutos.data.test.ts            16 tutos, schémas, sécurité ampoule, tutos utilisés
docs/ + CLAUDE.md                       spec §6 §8 §9, brouillon, CLAUDE.md
```

Identifiants des 22 pannes (ordre d'affichage = numéro du brouillon) :

| # | id | icône | # | id | icône |
|---|---|---|---|---|---|
| 1 | `fuite-eau` | `droplets` | 12 | `odeur-egout` | `wind` |
| 2 | `wc-bouche` | `toilet` | 13 | `groupe-securite-goutte` | `cylinder` |
| 3 | `evier-bouche` | `waves` | 14 | `fuite-pied-wc` | `droplet-off` |
| 4 | `pas-eau-chaude` | `heater` | 15 | `flexible-douche-fuit` | `bath` |
| 5 | `wc-lent-a-remplir` | `hourglass` | 16 | `bruit-tuyaux` | `audio-waveform` |
| 6 | `chasse-coule` | `rotate-cw` | 17 | `disjoncteur-saute` | `toggle-left` |
| 7 | `chasse-ne-marche-plus` | `circle-x` | 18 | `plus-de-courant` | `zap-off` |
| 8 | `robinet-dur` | `wrench` | 19 | `courant-une-piece` | `door-open` |
| 9 | `robinet-goutte` | `droplet` | 20 | `prise-hs` | `plug` |
| 10 | `pression-faible` | `gauge` | 21 | `lumiere-hs` | `lightbulb-off` |
| 11 | `douche-ecoule-mal` | `shower-head` | 22 | `ampoule-clignote` | `lightbulb` |

Identifiants des tutos : existants `deboucher-evier`, `deboucher-wc`, `changer-joint`, `reparer-disjoncteur` ; nouveaux `nettoyer-siphon`, `detartrer-flotteur`, `regler-flotteur`, `changer-joint-clapet`, `raccrocher-tringle`, `detartrer-tete-robinet`, `detartrer-mousseur`, `nettoyer-bonde`, `remplir-siphon`, `entretenir-groupe-securite`, `changer-flexible-douche`, `changer-ampoule`.

---

### Task 1: Domaine — étapes à schéma, renvois et leur validation

**Files:**
- Create: `src/domaine/etapes.ts`
- Create: `src/domaine/etapes.test.ts`
- Modify: `src/domaine/types.ts:20-27` (ajout `Renvoi`, `Resultat.renvoi`)
- Modify: `src/domaine/validateDiagnostic.ts` (fichier entier)
- Modify: `src/domaine/validateDiagnostic.test.ts` (ajout de tests à la fin)
- Modify: `src/donnees/diagnostics.data.test.ts` (fichier entier)

**Interfaces:**
- Consumes: `Diagnostic`, `Resultat`, `CATEGORIES` (`src/domaine/types.ts`), `estNomIcone` (`src/domaine/icones.ts`).
- Produces:
  - `src/domaine/etapes.ts` : `NOMS_SCHEMAS = ['siphon', 'disjoncteur'] as const` ; `type NomSchema` ; `type EtapeTuto = string | { texte: string; schema: NomSchema }` ; `estNomSchema(nom: string): nom is NomSchema` ; `texteEtape(etape: EtapeTuto): string` ; `schemaEtape(etape: EtapeTuto): NomSchema | undefined`.
  - `src/domaine/types.ts` : `type Renvoi = { type: 'diagnostic'; id: string } | { type: 'urgence'; id: string }` ; `Resultat.renvoi?: Renvoi`.
  - `src/domaine/validateDiagnostic.ts` : `validerDiagnostic(diag)` contrôle aussi le renvoi (type connu, id non vide, pas vers lui-même) ; `validerRenvois(diags: Diagnostic[], idsUrgences: string[]): string[]`.

- [ ] **Step 1: Écrire les tests qui échouent**

Créer `src/domaine/etapes.test.ts` :

```ts
import { estNomSchema, schemaEtape, texteEtape } from '@/domaine/etapes';

describe('étapes de tuto', () => {
  it('lit le texte d\'une étape simple', () => {
    expect(texteEtape('Coupe l\'eau.')).toBe('Coupe l\'eau.');
  });

  it('lit le texte d\'une étape avec schéma', () => {
    expect(texteEtape({ texte: 'Fais couler l\'eau.', schema: 'siphon' })).toBe('Fais couler l\'eau.');
  });

  it('une étape simple n\'a pas de schéma', () => {
    expect(schemaEtape('Coupe l\'eau.')).toBeUndefined();
  });

  it('donne le schéma d\'une étape avec schéma', () => {
    expect(schemaEtape({ texte: 'Remonte le levier.', schema: 'disjoncteur' })).toBe('disjoncteur');
  });

  it('reconnaît les noms de schémas', () => {
    expect(estNomSchema('siphon')).toBe(true);
    expect(estNomSchema('disjoncteur')).toBe(true);
    expect(estNomSchema('robinet')).toBe(false);
  });
});
```

Dans `src/domaine/validateDiagnostic.test.ts`, remplacer **la toute dernière ligne** du fichier (le `});` qui ferme `describe('validerDiagnostic', …)`) par le bloc suivant (il ajoute 4 tests à ce `describe`, le ferme, puis ouvre et ferme `describe('validerRenvois', …)`) :

```ts
  it('accepte un renvoi vers un autre diagnostic', () => {
    const diag = base();
    diag.resultats = { r1: { verdict: 'vert', titre: 'OK', conseil: 'ok', renvoi: { type: 'diagnostic', id: 'autre' } } };
    expect(validerDiagnostic(diag)).toEqual([]);
  });

  it('refuse un renvoi de type inconnu', () => {
    const diag = base();
    diag.resultats = {
      r1: { verdict: 'vert', titre: 'OK', conseil: 'ok', renvoi: { type: 'tuto', id: 'x' } as unknown as Resultat['renvoi'] },
    };
    expect(validerDiagnostic(diag).join(' ')).toContain('renvoi');
  });

  it('refuse un renvoi sans identifiant', () => {
    const diag = base();
    diag.resultats = { r1: { verdict: 'vert', titre: 'OK', conseil: 'ok', renvoi: { type: 'urgence', id: '' } } };
    expect(validerDiagnostic(diag).join(' ')).toContain('renvoi');
  });

  it('refuse un renvoi d\'un diagnostic vers lui-même', () => {
    const diag = base();
    diag.resultats = { r1: { verdict: 'vert', titre: 'OK', conseil: 'ok', renvoi: { type: 'diagnostic', id: 'test' } } };
    expect(validerDiagnostic(diag).join(' ')).toContain('lui-même');
  });
});

describe('validerRenvois', () => {
  const avecRenvoi = (id: string, renvoi: Resultat['renvoi']): Diagnostic => ({
    id,
    titre: id,
    categorie: 'plomberie',
    icone: 'droplets',
    motsCles: ['x'],
    etapeInitiale: 'r1',
    etapes: {},
    resultats: { r1: { verdict: 'vert', titre: 'OK', conseil: 'ok', renvoi } },
  });

  it('accepte des renvois vers un diagnostic et une urgence qui existent', () => {
    const diags = [avecRenvoi('a', { type: 'diagnostic', id: 'b' }), avecRenvoi('b', { type: 'urgence', id: 'couper-gaz' })];
    expect(validerRenvois(diags, ['couper-gaz'])).toEqual([]);
  });

  it('détecte un renvoi vers un diagnostic qui n\'existe pas', () => {
    const erreurs = validerRenvois([avecRenvoi('a', { type: 'diagnostic', id: 'fantome' })], []);
    expect(erreurs.join(' ')).toContain('fantome');
  });

  it('détecte un renvoi vers une urgence qui n\'existe pas', () => {
    const erreurs = validerRenvois([avecRenvoi('a', { type: 'urgence', id: 'couper-tout' })], ['couper-gaz']);
    expect(erreurs.join(' ')).toContain('couper-tout');
  });

  it('ignore les résultats sans renvoi', () => {
    expect(validerRenvois([avecRenvoi('a', undefined)], [])).toEqual([]);
  });
});
```

En haut de `src/domaine/validateDiagnostic.test.ts`, remplacer la première ligne par :

```ts
import { validerDiagnostic, validerRenvois } from '@/domaine/validateDiagnostic';
```

Remplacer **tout** `src/donnees/diagnostics.data.test.ts` par :

```ts
import { validerDiagnostic, validerRenvois } from '@/domaine/validateDiagnostic';
import { diagnostics } from '@/donnees/diagnostics';
import { gestesUrgence } from '@/donnees/gestesUrgence';

// Liste complétée lot par lot au chantier C (22 pannes à la fin).
const IDS_ATTENDUS = [
  'disjoncteur-saute', 'evier-bouche', 'fuite-eau', 'pas-eau-chaude', 'plus-de-courant', 'wc-bouche',
];

const tousLesResultats = () =>
  diagnostics.flatMap((d) => Object.entries(d.resultats).map(([id, r]) => ({ diag: d.id, id, r })));

describe('données de diagnostics', () => {
  it('contient les diagnostics attendus, sans gaz ni chaudière', () => {
    expect(diagnostics.map((d) => d.id).sort()).toEqual([...IDS_ATTENDUS].sort());
  });

  it.each(diagnostics.map((d) => [d.id, d] as const))(
    'le diagnostic "%s" ne contient aucune branche orpheline',
    (_id, diag) => {
      expect(validerDiagnostic(diag)).toEqual([]);
    }
  );

  it('chaque renvoi pointe vers un diagnostic ou un geste existant', () => {
    expect(validerRenvois(diagnostics, gestesUrgence.map((g) => g.id))).toEqual([]);
  });

  it('tout résultat qui renvoie vers le geste "couper-gaz" est rouge avec un numéro utile', () => {
    for (const { r } of tousLesResultats()) {
      if (r.gesteUrgenceId === 'couper-gaz') {
        expect(r.verdict).toBe('rouge');
        expect(Boolean(r.numeroUtile)).toBe(true);
      }
    }
  });

  it('tout résultat qui parle de gaz renvoie vers « Odeur de gaz ? »', () => {
    for (const { diag, id, r } of tousLesResultats()) {
      if (/gaz/i.test(r.conseil)) {
        const cible = r.renvoi?.type === 'urgence' ? r.renvoi.id : r.gesteUrgenceId;
        expect(`${diag}/${id} → ${cible}`).toBe(`${diag}/${id} → couper-gaz`);
      }
    }
  });

  it('un résultat rouge qui renvoie vers « Odeur de gaz ? » donne le numéro d\'urgence gaz', () => {
    for (const { diag, id, r } of tousLesResultats()) {
      if (r.verdict === 'rouge' && r.renvoi?.type === 'urgence' && r.renvoi.id === 'couper-gaz') {
        expect(`${diag}/${id} → ${r.numeroUtile}`).toBe(`${diag}/${id} → 0800 47 33 33`);
      }
    }
  });

  it('chaque réponse « Je ne sais pas » est affichée en pointillé (inconnu)', () => {
    for (const d of diagnostics) {
      for (const [etapeId, etape] of Object.entries(d.etapes)) {
        for (const reponse of etape.reponses) {
          if (reponse.texte.startsWith('Je ne sais pas')) {
            expect(`${d.id}/${etapeId} ${reponse.inconnu}`).toBe(`${d.id}/${etapeId} true`);
          }
        }
      }
    }
  });
});
```

- [ ] **Step 2: Lancer les tests pour vérifier qu'ils échouent**

Run: `npx jest src/domaine src/donnees/diagnostics.data.test.ts`
Expected: FAIL — `Cannot find module '@/domaine/etapes'` et `validerRenvois is not a function` (ou erreur de type `renvoi` inconnu).

- [ ] **Step 3: Écrire le code**

Créer `src/domaine/etapes.ts` :

```ts
// Une étape de tuto : un texte, ou un texte accompagné d'un petit schéma animé.
export const NOMS_SCHEMAS = ['siphon', 'disjoncteur'] as const;

export type NomSchema = (typeof NOMS_SCHEMAS)[number];

export type EtapeTuto = string | { texte: string; schema: NomSchema };

export function estNomSchema(nom: string): nom is NomSchema {
  return (NOMS_SCHEMAS as readonly string[]).includes(nom);
}

export function texteEtape(etape: EtapeTuto): string {
  return typeof etape === 'string' ? etape : etape.texte;
}

export function schemaEtape(etape: EtapeTuto): NomSchema | undefined {
  return typeof etape === 'string' ? undefined : etape.schema;
}
```

Dans `src/domaine/types.ts`, remplacer le bloc `export interface Resultat { … }` par :

```ts
/** Bouton sur un résultat : ouvre un autre diagnostic (depuis le début) ou un geste de l'onglet Urgences. */
export type Renvoi = { type: 'diagnostic'; id: string } | { type: 'urgence'; id: string };

export interface Resultat {
  verdict: Verdict;
  titre: string;
  conseil: string;
  tutoId?: string;
  gesteUrgenceId?: string;
  numeroUtile?: string;
  renvoi?: Renvoi;
}
```

Remplacer **tout** `src/domaine/validateDiagnostic.ts` par :

```ts
import { estNomIcone } from './icones';
import type { Diagnostic, Resultat, Verdict } from './types';
import { CATEGORIES } from './types';

const aClePropre = (obj: object, cle: string): boolean =>
  Object.prototype.hasOwnProperty.call(obj, cle);

const VERDICTS_VALIDES: Verdict[] = ['vert', 'orange', 'rouge'];
const TYPES_RENVOI: string[] = ['diagnostic', 'urgence'];

function erreurRenvoi(diag: Diagnostic, resultat: Resultat): string | null {
  const renvoi = resultat.renvoi;
  if (renvoi === undefined) return null;
  if (!TYPES_RENVOI.includes(renvoi.type) || typeof renvoi.id !== 'string' || renvoi.id.length === 0) {
    return 'renvoi invalide (type "diagnostic" ou "urgence" et id obligatoires)';
  }
  if (renvoi.type === 'diagnostic' && renvoi.id === diag.id) {
    return 'renvoi vers lui-même';
  }
  return null;
}

export function validerDiagnostic(diag: Diagnostic): string[] {
  const erreurs: string[] = [];

  const etapeInitialeExiste =
    aClePropre(diag.etapes, diag.etapeInitiale) || aClePropre(diag.resultats, diag.etapeInitiale);
  if (!etapeInitialeExiste) {
    erreurs.push(`etapeInitiale "${diag.etapeInitiale}" introuvable dans "${diag.id}"`);
  }

  for (const [etapeId, etape] of Object.entries(diag.etapes)) {
    for (const reponse of etape.reponses) {
      const cible = reponse.suite;
      const cibleExiste = aClePropre(diag.etapes, cible) || aClePropre(diag.resultats, cible);
      if (!cibleExiste) {
        erreurs.push(
          `Diagnostic "${diag.id}", étape "${etapeId}": la réponse "${reponse.texte}" pointe vers "${cible}" qui n'existe pas`
        );
      }
    }
  }

  for (const [resultatId, resultat] of Object.entries(diag.resultats)) {
    if (!VERDICTS_VALIDES.includes(resultat.verdict)) {
      erreurs.push(
        `Diagnostic "${diag.id}", résultat "${resultatId}": verdict "${resultat.verdict}" invalide`
      );
    }
    if (resultat.verdict === 'rouge' && resultat.tutoId) {
      erreurs.push(
        `Diagnostic "${diag.id}", résultat "${resultatId}": un verdict rouge ne doit pas proposer de tuto`
      );
    }
    if (typeof resultat.titre !== 'string' || resultat.titre.length === 0) {
      erreurs.push(`Diagnostic "${diag.id}", résultat "${resultatId}": titre manquant`);
    }
    if (typeof resultat.conseil !== 'string' || resultat.conseil.length === 0) {
      erreurs.push(`Diagnostic "${diag.id}", résultat "${resultatId}": conseil manquant`);
    }
    const renvoi = erreurRenvoi(diag, resultat);
    if (renvoi) {
      erreurs.push(`Diagnostic "${diag.id}", résultat "${resultatId}": ${renvoi}`);
    }
  }

  if (!CATEGORIES.includes(diag.categorie)) {
    erreurs.push(`Diagnostic "${diag.id}": catégorie "${diag.categorie}" invalide`);
  }
  if (typeof diag.icone !== 'string' || !estNomIcone(diag.icone)) {
    erreurs.push(`Diagnostic "${diag.id}": icône "${diag.icone}" inconnue`);
  }
  if (!Array.isArray(diag.motsCles) || diag.motsCles.length === 0) {
    erreurs.push(`Diagnostic "${diag.id}": mots-clés manquants`);
  }

  return erreurs;
}

/** Vérifie que chaque renvoi vise un diagnostic ou un geste d'urgence qui existe vraiment. */
export function validerRenvois(diags: Diagnostic[], idsUrgences: string[]): string[] {
  const idsDiagnostics = new Set(diags.map((d) => d.id));
  const urgences = new Set(idsUrgences);
  const erreurs: string[] = [];
  for (const diag of diags) {
    for (const [resultatId, resultat] of Object.entries(diag.resultats)) {
      const renvoi = resultat.renvoi;
      if (!renvoi) continue;
      const existe = renvoi.type === 'diagnostic' ? idsDiagnostics.has(renvoi.id) : urgences.has(renvoi.id);
      if (!existe) {
        erreurs.push(
          `Diagnostic "${diag.id}", résultat "${resultatId}": renvoi vers ${renvoi.type} "${renvoi.id}" introuvable`
        );
      }
    }
  }
  return erreurs;
}
```

- [ ] **Step 4: Lancer les tests pour vérifier qu'ils passent**

Run: `npx jest`
Expected: PASS (tous les fichiers, dont `couleursEnDur.test.ts`).

Run: `npx tsc --noEmit`
Expected: aucune erreur.

- [ ] **Step 5: Commit**

```bash
git add src/domaine/etapes.ts src/domaine/etapes.test.ts src/domaine/types.ts src/domaine/validateDiagnostic.ts src/domaine/validateDiagnostic.test.ts src/donnees/diagnostics.data.test.ts
git commit -m "Prépare les renvois entre résultats et les étapes de tuto avec schéma, avec leurs contrôles"
```

---

### Task 2: Moteur des schémas animés (calculs purs)

**Files:**
- Create: `src/ui/schemas/animation.ts`
- Create: `src/ui/schemas/animation.test.ts`

**Interfaces:**
- Consumes: rien.
- Produces (`src/ui/schemas/animation.ts`) :
  - `type Cle = readonly [number, number]` (instant entre 0 et 1, valeur)
  - `adoucir(x: number): number` (accélère puis ralentit)
  - `interpoler(t: number, cles: readonly Cle[], doux?: boolean): number`
  - `phaseBoucle(ecouleMs: number, dureeMs: number): number` (dans `[0, 1[`)
  - `DUREE_SIPHON_MS = 4000`, `DUREE_DISJONCTEUR_MS = 3000`
  - `interface ImageSiphon { decalageEau: number; gouttes: { decalage: number; opacite: number }[] }`
  - `imageSiphon(t: number, immobile: boolean): ImageSiphon`
  - `interface ImageDisjoncteur { decalageLevier: number; opaciteFleche: number; opaciteCoche: number }`
  - `imageDisjoncteur(t: number, immobile: boolean): ImageDisjoncteur`

Les valeurs reprennent les animations CSS de la maquette 8 : eau qui monte de 60 à 0 entre 0 et 70 % de 4 s ; deux gouttes (période 1 s, décalées de 0,5 s) qui tombent de 60 et s'effacent après 80 % ; levier immobile jusqu'à 25 % puis monte de 32 jusqu'à 55 % de 3 s ; flèche visible de 35 à 55 % ; coche visible de 65 à 95 %.

- [ ] **Step 1: Écrire les tests qui échouent**

Créer `src/ui/schemas/animation.test.ts` :

```ts
import { adoucir, imageDisjoncteur, imageSiphon, interpoler, phaseBoucle } from './animation';

describe('interpoler', () => {
  const cles = [[0, 0], [0.5, 10], [1, 10]] as const;

  it('donne la première valeur avant le début', () => {
    expect(interpoler(-1, cles)).toBe(0);
  });

  it('donne la dernière valeur après la fin', () => {
    expect(interpoler(2, cles)).toBe(10);
  });

  it('interpole en ligne droite entre deux clés', () => {
    expect(interpoler(0.25, cles)).toBeCloseTo(5);
  });

  it('reste sur un palier', () => {
    expect(interpoler(0.75, cles)).toBe(10);
  });

  it('adoucit le mouvement si demandé (lent au début)', () => {
    expect(interpoler(0.1, cles, true)).toBeLessThan(interpoler(0.1, cles));
  });
});

describe('adoucir et phaseBoucle', () => {
  it('adoucir garde les extrémités et le milieu', () => {
    expect(adoucir(0)).toBe(0);
    expect(adoucir(0.5)).toBeCloseTo(0.5);
    expect(adoucir(1)).toBe(1);
  });

  it('phaseBoucle repart à zéro à chaque tour', () => {
    expect(phaseBoucle(0, 4000)).toBe(0);
    expect(phaseBoucle(1000, 4000)).toBeCloseTo(0.25);
    expect(phaseBoucle(4500, 4000)).toBeCloseTo(0.125);
  });
});

describe('imageSiphon', () => {
  it('commence siphon vide (eau en bas)', () => {
    expect(imageSiphon(0, false).decalageEau).toBe(60);
  });

  it('est plein à 70 % du tour', () => {
    expect(imageSiphon(0.7, false).decalageEau).toBeCloseTo(0);
  });

  it('fait tomber deux gouttes décalées d\'un demi-temps', () => {
    const { gouttes } = imageSiphon(0, false);
    expect(gouttes).toHaveLength(2);
    expect(gouttes[0].decalage).toBeCloseTo(0);
    expect(gouttes[1].decalage).toBeCloseTo(30);
  });

  it('efface la goutte en fin de chute', () => {
    // t = 0.225 → 4 × 0.225 = 0.9 : goutte 1 à 90 % de sa chute
    expect(imageSiphon(0.225, false).gouttes[0].opacite).toBeCloseTo(0.5);
  });

  it('immobile : siphon plein, sans goutte', () => {
    expect(imageSiphon(0.3, true)).toEqual({ decalageEau: 0, gouttes: [] });
  });
});

describe('imageDisjoncteur', () => {
  it('commence levier en bas, sans flèche ni coche', () => {
    expect(imageDisjoncteur(0, false)).toEqual({ decalageLevier: 0, opaciteFleche: 0, opaciteCoche: 0 });
  });

  it('montre la flèche pendant la montée', () => {
    expect(imageDisjoncteur(0.45, false).opaciteFleche).toBe(1);
  });

  it('levier en haut et coche visible à 80 %', () => {
    const image = imageDisjoncteur(0.8, false);
    expect(image.decalageLevier).toBe(-32);
    expect(image.opaciteCoche).toBe(1);
    expect(image.opaciteFleche).toBe(0);
  });

  it('immobile : levier en haut et coche visible', () => {
    expect(imageDisjoncteur(0, true)).toEqual({ decalageLevier: -32, opaciteFleche: 0, opaciteCoche: 1 });
  });
});
```

- [ ] **Step 2: Lancer les tests pour vérifier qu'ils échouent**

Run: `npx jest src/ui/schemas`
Expected: FAIL — `Cannot find module './animation'`.

- [ ] **Step 3: Écrire le code**

Créer `src/ui/schemas/animation.ts` :

```ts
// Calculs purs des schémas animés : pour un instant t (entre 0 et 1, un tour de boucle),
// on calcule où sont l'eau, les gouttes, le levier… Les composants n'ont plus qu'à dessiner.

/** [instant entre 0 et 1, valeur à cet instant] */
export type Cle = readonly [number, number];

export const DUREE_SIPHON_MS = 4000;
export const DUREE_DISJONCTEUR_MS = 3000;

/** Accélère au début et ralentit à la fin (comme « ease-in-out »). */
export function adoucir(x: number): number {
  return x * x * (3 - 2 * x);
}

export function interpoler(t: number, cles: readonly Cle[], doux = false): number {
  if (t <= cles[0][0]) return cles[0][1];
  for (let i = 1; i < cles.length; i++) {
    const [t1, v1] = cles[i];
    if (t <= t1) {
      const [t0, v0] = cles[i - 1];
      const x = t1 === t0 ? 1 : (t - t0) / (t1 - t0);
      return v0 + (v1 - v0) * (doux ? adoucir(x) : x);
    }
  }
  return cles[cles.length - 1][1];
}

export function phaseBoucle(ecouleMs: number, dureeMs: number): number {
  return (ecouleMs % dureeMs) / dureeMs;
}

export interface ImageSiphon {
  decalageEau: number;
  gouttes: { decalage: number; opacite: number }[];
}

const CLES_EAU: readonly Cle[] = [[0, 60], [0.7, 0], [1, 0]];
const CLES_GOUTTE: readonly Cle[] = [[0, 1], [0.8, 1], [1, 0]];

export function imageSiphon(t: number, immobile: boolean): ImageSiphon {
  if (immobile) return { decalageEau: 0, gouttes: [] };
  // Une goutte tombe en 1 s : 4 chutes par tour de 4 s ; la 2e goutte part une demi-seconde après.
  const goutte = (p: number) => ({ decalage: 60 * p, opacite: interpoler(p, CLES_GOUTTE) });
  return {
    decalageEau: interpoler(t, CLES_EAU, true),
    gouttes: [goutte((t * 4) % 1), goutte((t * 4 + 0.5) % 1)],
  };
}

export interface ImageDisjoncteur {
  decalageLevier: number;
  opaciteFleche: number;
  opaciteCoche: number;
}

const CLES_LEVIER: readonly Cle[] = [[0, 0], [0.25, 0], [0.55, -32], [1, -32]];
const CLES_FLECHE: readonly Cle[] = [[0, 0], [0.2, 0], [0.35, 1], [0.55, 1], [0.7, 0], [1, 0]];
const CLES_COCHE: readonly Cle[] = [[0, 0], [0.55, 0], [0.65, 1], [0.95, 1], [1, 0]];

export function imageDisjoncteur(t: number, immobile: boolean): ImageDisjoncteur {
  if (immobile) return { decalageLevier: -32, opaciteFleche: 0, opaciteCoche: 1 };
  return {
    decalageLevier: interpoler(t, CLES_LEVIER, true),
    opaciteFleche: interpoler(t, CLES_FLECHE),
    opaciteCoche: interpoler(t, CLES_COCHE),
  };
}
```

- [ ] **Step 4: Lancer les tests pour vérifier qu'ils passent**

Run: `npx jest src/ui/schemas`
Expected: PASS (16 tests).

- [ ] **Step 5: Commit**

```bash
git add src/ui/schemas/animation.ts src/ui/schemas/animation.test.ts
git commit -m "Ajoute les calculs des schémas animés (siphon qui se remplit, disjoncteur qui remonte)"
```

---

### Task 3: Schémas animés dans les étapes de tuto

**Files:**
- Create: `src/ui/schemas/useTempsBoucle.ts`
- Create: `src/ui/schemas/useMouvementReduit.ts`
- Create: `src/ui/schemas/SchemaSiphon.tsx`
- Create: `src/ui/schemas/SchemaDisjoncteur.tsx`
- Create: `src/ui/schemas/SchemaAnime.tsx`
- Modify: `src/ui/EtapesList.tsx` (fichier entier)
- Modify: `src/domaine/types.ts` (`Tuto.etapes`)
- Modify: `src/donnees/tutos.ts` (entrée `reparer-disjoncteur`)
- Modify: `src/donnees/gestesEtTutos.data.test.ts` (ajout d'un test)

**Interfaces:**
- Consumes: `EtapeTuto`, `NomSchema`, `texteEtape`, `schemaEtape` (tâche 1) ; `DUREE_SIPHON_MS`, `DUREE_DISJONCTEUR_MS`, `imageSiphon`, `imageDisjoncteur`, `phaseBoucle` (tâche 2) ; `useTheme()` → `couleurs` (`accent`, `carte`, `bordure`, `texteDiscret`, `fond`, `verdictVert`) ; `teinte(hex, alpha)`.
- Produces:
  - `useTempsBoucle(dureeMs: number, actif: boolean): number`
  - `useMouvementReduit(): boolean`
  - `SchemaSiphon({ immobile }: { immobile: boolean })`, `SchemaDisjoncteur({ immobile }: { immobile: boolean })`
  - `SchemaAnime({ nom }: { nom: NomSchema })`
  - `EtapesList({ etapes }: { etapes: readonly EtapeTuto[] })`
  - `Tuto.etapes: EtapeTuto[]`

- [ ] **Step 1: Écrire le test qui échoue**

Dans `src/donnees/gestesEtTutos.data.test.ts`, ajouter en haut :

```ts
import { schemaEtape } from '@/domaine/etapes';
```

et, à l'intérieur du `describe`, après le test « contient les 4 mini-tutos attendus » :

```ts
  it('« Réarmer un disjoncteur » montre le schéma du disjoncteur', () => {
    const tuto = tutos.find((t) => t.id === 'reparer-disjoncteur')!;
    expect(tuto.etapes.map(schemaEtape)).toContain('disjoncteur');
  });
```

- [ ] **Step 2: Lancer le test pour vérifier qu'il échoue**

Run: `npx jest src/donnees/gestesEtTutos.data.test.ts`
Expected: FAIL — `expect(received).toContain(expected)` (aucune étape n'a de schéma).

- [ ] **Step 3: Écrire le code**

Dans `src/domaine/types.ts`, ajouter l'import en haut :

```ts
import type { EtapeTuto } from './etapes';
```

et dans `export interface Tuto`, remplacer `etapes: string[];` par :

```ts
  etapes: EtapeTuto[];
```

(`GesteUrgence.etapes` reste `string[]`.)

Créer `src/ui/schemas/useTempsBoucle.ts` :

```ts
import { useEffect, useState } from 'react';
import { phaseBoucle } from './animation';

const PAS_MS = 33; // environ 30 images par seconde : fluide et peu coûteux

/** Temps qui tourne en boucle, entre 0 et 1, sur `dureeMs`. Reste à 0 si `actif` est faux. */
export function useTempsBoucle(dureeMs: number, actif: boolean): number {
  const [t, setT] = useState(0);
  useEffect(() => {
    if (!actif) return undefined;
    const debut = Date.now();
    let dernier = 0;
    let id = 0;
    const boucle = () => {
      const maintenant = Date.now();
      if (maintenant - dernier >= PAS_MS) {
        dernier = maintenant;
        setT(phaseBoucle(maintenant - debut, dureeMs));
      }
      id = requestAnimationFrame(boucle);
    };
    id = requestAnimationFrame(boucle);
    return () => cancelAnimationFrame(id);
  }, [dureeMs, actif]);
  return t;
}
```

Créer `src/ui/schemas/useMouvementReduit.ts` :

```ts
import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

/** Vrai si l'utilisateur a demandé à son téléphone (ou navigateur) de réduire les animations. */
export function useMouvementReduit(): boolean {
  const [reduit, setReduit] = useState(false);
  useEffect(() => {
    let monte = true;
    AccessibilityInfo.isReduceMotionEnabled()
      .then((valeur) => {
        if (monte) setReduit(valeur);
      })
      .catch(() => undefined);
    // Sur le web, addEventListener peut ne rien renvoyer : d'où le « ?. ».
    const abonnement = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduit);
    return () => {
      monte = false;
      abonnement?.remove();
    };
  }, []);
  return reduit;
}
```

Créer `src/ui/schemas/SchemaSiphon.tsx` :

```tsx
// src/ui/schemas/SchemaSiphon.tsx — l'eau remplit le coude du siphon et bloque les odeurs (maquette 8).
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, ClipPath, Defs, G, Path, Rect, Text as SvgText } from 'react-native-svg';
import { useTheme } from '@/theme/ThemeProvider';
import { DUREE_SIPHON_MS, imageSiphon } from './animation';
import { useTempsBoucle } from './useTempsBoucle';

const TUYAU = 'M70 10 V70 a30 30 0 0 0 60 0 V10 h-16 V70 a14 14 0 0 1 -28 0 V10 Z';

export function SchemaSiphon({ immobile }: { immobile: boolean }) {
  const { couleurs } = useTheme();
  const t = useTempsBoucle(DUREE_SIPHON_MS, !immobile);
  const image = imageSiphon(t, immobile);
  return (
    <View style={styles.zone}>
      <Svg width="100%" height="100%" viewBox="0 0 220 120">
        <Defs>
          <ClipPath id="interieur-siphon">
            <Path d={TUYAU} />
          </ClipPath>
        </Defs>
        <Path d={TUYAU} fill={couleurs.carte} stroke={couleurs.texteDiscret} strokeWidth={2} />
        <Path d="M130 26 H200 M130 42 H200" stroke={couleurs.texteDiscret} strokeWidth={2} />
        <G clipPath="url(#interieur-siphon)">
          <Rect x={60} y={40 + image.decalageEau} width={80} height={80} fill={couleurs.accent} opacity={0.75} />
        </G>
        {image.gouttes.map((goutte, i) => (
          <Circle key={i} cx={78} cy={goutte.decalage} r={3.5} fill={couleurs.accent} opacity={goutte.opacite} />
        ))}
        <SvgText x={150} y={100} fill={couleurs.texteDiscret} fontSize={10}>
          l’eau bloque
        </SvgText>
        <SvgText x={150} y={112} fill={couleurs.texteDiscret} fontSize={10}>
          les odeurs
        </SvgText>
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  zone: { width: '100%', aspectRatio: 220 / 120 },
});
```

Créer `src/ui/schemas/SchemaDisjoncteur.tsx` :

```tsx
// src/ui/schemas/SchemaDisjoncteur.tsx — le levier remonte de 0 à I, puis une coche (maquette 8).
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, G, Path, Rect, Text as SvgText } from 'react-native-svg';
import { useTheme } from '@/theme/ThemeProvider';
import { DUREE_DISJONCTEUR_MS, imageDisjoncteur } from './animation';
import { useTempsBoucle } from './useTempsBoucle';

export function SchemaDisjoncteur({ immobile }: { immobile: boolean }) {
  const { couleurs } = useTheme();
  const t = useTempsBoucle(DUREE_DISJONCTEUR_MS, !immobile);
  const image = imageDisjoncteur(t, immobile);
  return (
    <View style={styles.zone}>
      <Svg width="100%" height="100%" viewBox="0 0 220 120">
        <Rect x={80} y={8} width={60} height={104} rx={8} fill={couleurs.carte} stroke={couleurs.texteDiscret} strokeWidth={2} />
        <Rect x={100} y={28} width={20} height={64} rx={4} fill={couleurs.bordure} />
        <Rect x={96} y={62 + image.decalageLevier} width={28} height={26} rx={5} fill={couleurs.accent} />
        <SvgText x={146} y={24} fill={couleurs.texteDiscret} fontSize={9}>
          I = marche
        </SvgText>
        <SvgText x={146} y={106} fill={couleurs.texteDiscret} fontSize={9}>
          0 = coupé
        </SvgText>
        <Path
          d="M40 86 V40 m-9 9 l9 -9 l9 9"
          fill="none"
          stroke={couleurs.verdictVert}
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={image.opaciteFleche}
        />
        <G opacity={image.opaciteCoche}>
          <Circle cx={175} cy={60} r={14} fill={couleurs.verdictVert} fillOpacity={0.13} />
          <Path
            d="M168 60 l5 5 l9 -10"
            fill="none"
            stroke={couleurs.verdictVert}
            strokeWidth={3}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </G>
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  zone: { width: '100%', aspectRatio: 220 / 120 },
});
```

Créer `src/ui/schemas/SchemaAnime.tsx` :

```tsx
// src/ui/schemas/SchemaAnime.tsx — cadre du schéma sous une étape de tuto.
import { StyleSheet, View } from 'react-native';
import type { NomSchema } from '@/domaine/etapes';
import { teinte } from '@/theme/teinte';
import { useTheme } from '@/theme/ThemeProvider';
import { SchemaDisjoncteur } from './SchemaDisjoncteur';
import { SchemaSiphon } from './SchemaSiphon';
import { useMouvementReduit } from './useMouvementReduit';

const DESCRIPTIONS: Record<NomSchema, string> = {
  siphon: 'Schéma : l\'eau remplit le coude du siphon et bloque les odeurs.',
  disjoncteur: 'Schéma : le levier du disjoncteur remonte de 0 (coupé) à I (marche).',
};

export function SchemaAnime({ nom }: { nom: NomSchema }) {
  const { couleurs } = useTheme();
  const immobile = useMouvementReduit();
  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel={DESCRIPTIONS[nom]}
      style={[styles.cadre, { backgroundColor: teinte(couleurs.fond, 0.5), borderColor: couleurs.bordure }]}
    >
      {nom === 'siphon' ? <SchemaSiphon immobile={immobile} /> : <SchemaDisjoncteur immobile={immobile} />}
    </View>
  );
}

const styles = StyleSheet.create({
  cadre: { borderWidth: 1, borderRadius: 10, padding: 6 },
});
```

Remplacer **tout** `src/ui/EtapesList.tsx` par :

```tsx
// src/ui/EtapesList.tsx
import { StyleSheet, Text, View } from 'react-native';
import { schemaEtape, texteEtape, type EtapeTuto } from '@/domaine/etapes';
import { teinte } from '@/theme/teinte';
import { useTheme } from '@/theme/ThemeProvider';
import { SchemaAnime } from './schemas/SchemaAnime';

export function EtapesList({ etapes }: { etapes: readonly EtapeTuto[] }) {
  const { couleurs } = useTheme();
  return (
    <View style={styles.liste}>
      {etapes.map((etape, index) => {
        const schema = schemaEtape(etape);
        return (
          <View key={index} style={[styles.ligne, { backgroundColor: couleurs.carte, borderColor: couleurs.bordure }]}>
            <View style={[styles.numero, { backgroundColor: teinte(couleurs.accent, 0.18) }]}>
              <Text style={[styles.numeroTexte, { color: couleurs.accent }]}>{index + 1}</Text>
            </View>
            <View style={styles.corps}>
              <Text style={[styles.texte, { color: couleurs.texte }]}>{texteEtape(etape)}</Text>
              {schema ? <SchemaAnime nom={schema} /> : null}
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  liste: { gap: 10 },
  ligne: { flexDirection: 'row', gap: 12, borderWidth: 1, borderRadius: 14, padding: 12 },
  numero: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  numeroTexte: { fontWeight: '700', fontSize: 14 },
  corps: { flex: 1, gap: 10 },
  texte: { fontSize: 15, lineHeight: 21 },
});
```

Dans `src/donnees/tutos.ts`, remplacer l'entrée `reparer-disjoncteur` (de `{ id: 'reparer-disjoncteur',` jusqu'à son `},`) par (étapes reprises de la maquette 8, plus une consigne de sécurité) :

```ts
  {
    id: 'reparer-disjoncteur',
    titre: 'Réarmer un disjoncteur',
    categorie: 'electricite',
    icone: 'toggle-left',
    duree: '2 min',
    outil: 'aucun',
    etapes: [
      'Si le tableau électrique est mouillé, chaud ou sent le brûlé, n\'y touche pas : appelle un électricien.',
      'Avec les mains sèches, ouvre la porte du tableau électrique (ne démonte jamais le capot).',
      'Si tu sais quel appareil a fait sauter le disjoncteur, débranche-le d\'abord.',
      {
        texte: 'Repère le disjoncteur en position basse et remonte-le d\'un coup franc.',
        schema: 'disjoncteur',
      },
      'S\'il redescend tout de suite, ne force pas : débranche les appareils de la pièce et appelle un électricien s\'il re-saute.',
    ],
  },
```

- [ ] **Step 4: Lancer les tests et le typage**

Run: `npx jest`
Expected: PASS (dont `couleursEnDur.test.ts` : aucune couleur écrite dans `src/ui/schemas/`).

Run: `npx tsc --noEmit`
Expected: aucune erreur.

- [ ] **Step 5: Vérifier dans le navigateur**

Lancer en arrière-plan : `npx expo start --web --port 8099` (jamais 8081/8082). Ouvrir `http://localhost:8099/tutos/reparer-disjoncteur` dans le panneau navigateur.
Expected : l'étape 4 montre, sous son texte, un cadre avec le disjoncteur dont le levier bleu remonte, la flèche verte puis la coche apparaissent, en boucle (comparer avec la 4e maquette de `8-renvois-schemas.html`). Passer en thème clair (Réglages) : le schéma reste lisible. Ouvrir `http://localhost:8099/urgences/couper-eau` : les étapes du geste s'affichent comme avant. Arrêter ensuite le serveur Expo.

- [ ] **Step 6: Commit**

```bash
git add src/ui/schemas src/ui/EtapesList.tsx src/domaine/types.ts src/donnees/tutos.ts src/donnees/gestesEtTutos.data.test.ts
git commit -m "Affiche un petit schéma animé sous certaines étapes de tuto (disjoncteur), figé si les animations sont réduites"
```

---

### Task 4: Les 12 nouveaux tutos

**Files:**
- Modify: `src/donnees/tutos.ts` (ajout de 12 entrées à la fin du tableau)
- Modify: `src/donnees/gestesEtTutos.data.test.ts`

**Interfaces:**
- Consumes: `Tuto` (`etapes: EtapeTuto[]`), `schemaEtape`, `texteEtape`, `estNomSchema` (tâche 1), icônes existantes (`NOMS_ICONES`).
- Produces: les 16 ids de tutos listés dans « File Structure » ; utilisés par les `tutoId` des tâches 6 à 10.

- [ ] **Step 1: Écrire les tests qui échouent**

Dans `src/donnees/gestesEtTutos.data.test.ts`, remplacer la ligne d'import ajoutée à la tâche 3 par :

```ts
import { estNomSchema, schemaEtape, texteEtape } from '@/domaine/etapes';
```

Remplacer le test « contient les 4 mini-tutos attendus » par :

```ts
  it('contient les 16 tutos attendus', () => {
    const ids = tutos.map((t) => t.id).sort();
    expect(ids).toEqual([
      'changer-ampoule', 'changer-flexible-douche', 'changer-joint', 'changer-joint-clapet',
      'deboucher-evier', 'deboucher-wc', 'detartrer-flotteur', 'detartrer-mousseur',
      'detartrer-tete-robinet', 'entretenir-groupe-securite', 'nettoyer-bonde', 'nettoyer-siphon',
      'raccrocher-tringle', 'regler-flotteur', 'remplir-siphon', 'reparer-disjoncteur',
    ]);
  });

  it('chaque étape de tuto a un texte et un schéma connu s\'il y en a un', () => {
    for (const t of tutos) {
      expect(t.etapes.length).toBeGreaterThan(0);
      for (const e of t.etapes) {
        expect(texteEtape(e).length).toBeGreaterThan(0);
        const schema = schemaEtape(e);
        if (schema !== undefined) expect(estNomSchema(schema)).toBe(true);
      }
    }
  });

  it('« Remplir un siphon » montre le schéma du siphon', () => {
    const tuto = tutos.find((t) => t.id === 'remplir-siphon')!;
    expect(tuto.etapes.map(schemaEtape)).toContain('siphon');
  });

  it('« Changer une ampoule » commence par la sécurité (pro, disjoncteur, escabeau)', () => {
    const textes = tutos.find((t) => t.id === 'changer-ampoule')!.etapes.map(texteEtape);
    expect(textes[0]).toContain('électricien');
    expect(textes[1]).toContain('disjoncteur');
    expect(textes.join(' ')).toContain('escabeau stable');
  });
```

- [ ] **Step 2: Lancer les tests pour vérifier qu'ils échouent**

Run: `npx jest src/donnees/gestesEtTutos.data.test.ts`
Expected: FAIL — la liste ne contient que 4 tutos ; `remplir-siphon` et `changer-ampoule` introuvables.

- [ ] **Step 3: Écrire les tutos**

Dans `src/donnees/tutos.ts`, ajouter ces 12 entrées juste avant le `];` final :

```ts
  {
    id: 'nettoyer-siphon',
    titre: 'Nettoyer un siphon',
    categorie: 'plomberie',
    icone: 'waves',
    duree: '10 min',
    outil: 'seau',
    etapes: [
      'Si tu as versé un produit déboucheur, ne démonte pas le siphon : l\'eau qui tomberait peut brûler la peau. Appelle un plombier.',
      'Mets un seau ou une bassine sous le siphon (le coude sous l\'évier) et une serpillière autour.',
      'Mets des gants. Dévisse à la main la grosse bague du siphon (ou le bouchon tout en bas). L\'eau sale tombe dans le seau : c\'est normal.',
      'Vide le siphon dans les WC, puis nettoie-le avec une vieille brosse à dents et de l\'eau chaude.',
      'Vérifie que le joint (la rondelle en caoutchouc) est bien en place, puis revisse à la main, sans outil.',
      'Fais couler l\'eau une minute et regarde sous l\'évier : si ça goutte, resserre un peu la bague à la main.',
    ],
  },
  {
    id: 'detartrer-flotteur',
    titre: 'Détartrer le robinet flotteur',
    categorie: 'plomberie',
    icone: 'hourglass',
    duree: '20 min',
    outil: 'vinaigre blanc',
    etapes: [
      'Ferme le petit robinet d\'arrivée d\'eau des WC (dans le sens des aiguilles d\'une montre), puis tire la chasse pour vider le réservoir.',
      'Soulève le couvercle du réservoir et pose-le à plat sur une serviette : il est lourd et casse facilement.',
      'Repère le robinet flotteur : la pièce reliée au tuyau d\'arrivée, avec un flotteur qui monte et descend.',
      'Enlève le capuchon du robinet flotteur s\'il se déclipse ou se dévisse à la main. S\'il faut un outil ou forcer, arrête-toi là et appelle un plombier.',
      'Fais tremper les petites pièces 15 minutes dans du vinaigre blanc, frotte-les avec une vieille brosse à dents, puis rince-les.',
      'Remonte tout, rouvre le petit robinet d\'arrivée et vérifie que le réservoir se remplit plus vite et s\'arrête bien.',
    ],
  },
  {
    id: 'regler-flotteur',
    titre: 'Régler le flotteur',
    categorie: 'plomberie',
    icone: 'rotate-cw',
    duree: '10 min',
    outil: 'tournevis',
    etapes: [
      'Soulève le couvercle du réservoir et pose-le à plat sur une serviette.',
      'Regarde le niveau de l\'eau : il doit s\'arrêter 2 à 3 cm sous le haut du tube du milieu (le trop-plein).',
      'Trouve le réglage du flotteur : une vis en haut du robinet flotteur, ou un clip le long de sa tige.',
      'Baisse un peu le flotteur : tourne la vis d\'un tour avec un tournevis, ou fais glisser le clip de 1 cm vers le bas.',
      'Tire la chasse et regarde le remplissage. Recommence jusqu\'à ce que l\'eau s\'arrête sous le haut du trop-plein.',
      'Si l\'eau coule toujours dans le trop-plein, le robinet flotteur est usé : ferme le petit robinet d\'arrivée et appelle un plombier.',
    ],
  },
  {
    id: 'changer-joint-clapet',
    titre: 'Changer le joint de clapet',
    categorie: 'plomberie',
    icone: 'rotate-cw',
    duree: '20 min',
    outil: 'joint neuf',
    etapes: [
      'Ferme le petit robinet d\'arrivée d\'eau des WC, puis tire la chasse pour vider le réservoir.',
      'Soulève le couvercle du réservoir et pose-le à plat sur une serviette.',
      'Sors le mécanisme de chasse (la colonne au milieu) : sur la plupart des modèles, tourne-le d\'un quart de tour et soulève-le. S\'il ne vient pas à la main, arrête-toi là et appelle un plombier.',
      'Retire le joint en caoutchouc sous le mécanisme et emporte-le au magasin de bricolage pour acheter le même.',
      'Nettoie le fond du réservoir, là où le joint s\'appuie (éponge et vinaigre blanc), puis mets le joint neuf.',
      'Remets le mécanisme, rouvre le petit robinet d\'arrivée et vérifie que l\'eau ne coule plus dans la cuvette.',
    ],
  },
  {
    id: 'raccrocher-tringle',
    titre: 'Raccrocher la tringle de chasse',
    categorie: 'plomberie',
    icone: 'circle-x',
    duree: '5 min',
    outil: 'aucun',
    etapes: [
      'Soulève doucement le couvercle du réservoir : si le bouton est dessus, il peut être relié au mécanisme. Pose-le à plat sur une serviette.',
      'Repère la petite tige, la chaînette ou le câble entre le bouton et le mécanisme : il pend dans le vide.',
      'Raccroche-le à la main à son crochet ou à son encoche sur le mécanisme.',
      'Remets le couvercle et appuie sur le bouton : la chasse doit partir. Si la pièce est cassée, un plombier pourra la changer.',
    ],
  },
  {
    id: 'detartrer-tete-robinet',
    titre: 'Détartrer une tête de robinet',
    categorie: 'plomberie',
    icone: 'wrench',
    duree: '20 min',
    outil: 'vinaigre blanc',
    etapes: [
      'Coupe l\'eau : ferme le petit robinet sous l\'évier, ou le robinet général (voir le geste « Couper l\'eau »).',
      'Ouvre le robinet pour vider l\'eau qui reste, et mets le bouchon de l\'évier pour ne pas perdre de petites pièces.',
      'Retire le petit cache sur la poignée (il se déclipse avec l\'ongle), dévisse la vis, puis enlève la poignée.',
      'Dévisse la tête du robinet avec une clé, en tenant le robinet de l\'autre main pour ne pas le tordre. Si ça résiste, ne force pas : appelle un plombier.',
      'Fais tremper la tête 15 minutes dans du vinaigre blanc, puis brosse-la et rince-la.',
      'Revisse la tête sans forcer, remets la poignée, rouvre l\'eau doucement et vérifie qu\'il n\'y a pas de fuite.',
    ],
  },
  {
    id: 'detartrer-mousseur',
    titre: 'Détartrer un mousseur ou un pommeau',
    categorie: 'plomberie',
    icone: 'gauge',
    duree: '10 min',
    outil: 'vinaigre blanc',
    etapes: [
      'Mets le bouchon de l\'évier pour ne pas perdre de petites pièces.',
      'Dévisse à la main le mousseur (le petit embout au bout du robinet). S\'il résiste, entoure-le d\'un chiffon et tourne doucement avec une pince.',
      'Pour une douche, dévisse le pommeau du flexible, à la main.',
      'Fais tremper le mousseur ou le pommeau au moins 30 minutes dans du vinaigre blanc.',
      'Frotte avec une vieille brosse à dents, rince, et vérifie le petit joint : change-le s\'il est abîmé.',
      'Revisse à la main et ouvre l\'eau : le jet doit être plus fort et régulier.',
    ],
  },
  {
    id: 'nettoyer-bonde',
    titre: 'Nettoyer une bonde de douche',
    categorie: 'plomberie',
    icone: 'shower-head',
    duree: '10 min',
    outil: 'crochet',
    etapes: [
      'Mets des gants. Retire la grille de la bonde : elle se soulève ou se dévisse à la main.',
      'Retire les cheveux et les saletés avec un crochet (ou un fil de fer plié) et jette-les à la poubelle, pas dans les WC.',
      'Si la bonde a un petit panier ou un cylindre au milieu, sors-le et nettoie-le sous l\'eau avec une vieille brosse à dents.',
      'Remets les pièces et la grille, puis fais couler de l\'eau chaude : elle doit partir vite.',
      'Si l\'eau stagne encore, ne verse pas de produit déboucheur : appelle un plombier.',
    ],
  },
  {
    id: 'remplir-siphon',
    titre: 'Remplir un siphon',
    categorie: 'plomberie',
    icone: 'wind',
    duree: '2 min',
    outil: 'aucun',
    etapes: [
      'Repère l\'évacuation qui sent : douche d\'amis, lavabo peu utilisé, siphon de sol.',
      {
        texte: 'Fais couler l\'eau une bonne minute : elle remplit le coude du siphon.',
        schema: 'siphon',
      },
      'L\'odeur doit partir en quelques minutes. Recommence chaque mois si tu n\'utilises pas ce point d\'eau.',
      'Si l\'odeur revient le jour même, refais le diagnostic « Mauvaise odeur d\'égout » ou appelle un plombier.',
    ],
  },
  {
    id: 'entretenir-groupe-securite',
    titre: 'Entretenir le groupe de sécurité',
    categorie: 'plomberie',
    icone: 'cylinder',
    duree: '2 min',
    outil: 'aucun',
    etapes: [
      'Repère le groupe de sécurité : la pièce sous le chauffe-eau, sur l\'arrivée d\'eau froide, avec une petite manette et un tuyau qui part vers l\'évacuation.',
      'Tourne ou soulève la petite manette quelques secondes : de l\'eau, parfois très chaude, part dans l\'évacuation. Ne mets pas la main dessous.',
      'Relâche la manette : l\'écoulement doit s\'arrêter. Fais-le une fois par mois.',
      'Si l\'eau continue de couler après avoir relâché la manette, ou si rien ne sort du tout, appelle un plombier. Ne bouche jamais l\'écoulement.',
    ],
  },
  {
    id: 'changer-flexible-douche',
    titre: 'Changer un flexible de douche',
    categorie: 'plomberie',
    icone: 'bath',
    duree: '10 min',
    outil: 'aucun',
    etapes: [
      'Ferme le robinet de la douche et mets le bouchon pour ne pas perdre les petits joints.',
      'Dévisse le flexible à la main : en bas sous le robinet, puis en haut au pommeau.',
      'Achète un flexible de la même longueur. Les raccords sont presque toujours de taille standard ; emporte l\'ancien au magasin si tu as un doute.',
      'Vérifie qu\'il y a un joint dans chaque écrou (souvent fourni avec le flexible), puis visse à la main, sans outil.',
      'Ouvre l\'eau doucement : si ça goutte à un raccord, resserre un peu à la main ou change son joint.',
    ],
  },
  {
    id: 'changer-ampoule',
    titre: 'Changer une ampoule',
    categorie: 'electricite',
    icone: 'lightbulb',
    duree: '5 min',
    outil: 'escabeau bas',
    etapes: [
      'Si le plafond est trop haut pour un escabeau bas, ou si le lustre est lourd ou doit être démonté, n\'y va pas : appelle un électricien.',
      'Éteins l\'interrupteur, puis coupe le disjoncteur de la pièce dans le tableau électrique (pas seulement l\'interrupteur).',
      'Attends quelques minutes que l\'ampoule refroidisse : elle peut brûler les doigts.',
      'Monte sur un escabeau stable, bien ouvert, jamais sur une chaise ni un tabouret. Si possible, demande à quelqu\'un de le tenir.',
      'Dévisse l\'ampoule (ou tourne-la d\'un quart de tour puis tire, pour les ampoules à petites pattes). Si elle est cassée dans la douille, arrête-toi : appelle un électricien.',
      'Mets une ampoule neuve du même modèle (même culot, même puissance), sans forcer. Si tu as un variateur, prends une ampoule LED « compatible variateur ».',
      'Descends de l\'escabeau, remonte le disjoncteur et allume. Si ça ne marche toujours pas, fais le diagnostic « Interrupteur ou lumière qui ne marche plus ».',
    ],
  },
```

- [ ] **Step 4: Lancer les tests et le typage**

Run: `npx jest`
Expected: PASS.

Run: `npx tsc --noEmit`
Expected: aucune erreur.

- [ ] **Step 5: Vérifier dans le navigateur**

Lancer `npx expo start --web --port 8099` en arrière-plan. Ouvrir `http://localhost:8099/tutos` : onglet Plomberie = 14 tutos (la liste défile), onglet Électricité = 2 tutos. Ouvrir `http://localhost:8099/tutos/remplir-siphon` : l'étape 2 montre le siphon qui se remplit et les gouttes qui tombent, en boucle (3e maquette de `8-renvois-schemas.html`). Arrêter le serveur Expo.

- [ ] **Step 6: Commit**

```bash
git add src/donnees/tutos.ts src/donnees/gestesEtTutos.data.test.ts
git commit -m "Ajoute les 12 nouveaux tutos (siphon, flotteur, clapet, robinets, douche, groupe de sécurité, ampoule)"
```

---

### Task 5: Renvois sur la carte de résultat

**Files:**
- Create: `src/fonctionnalites/diagnostic/lib/renvoi.ts`
- Create: `src/fonctionnalites/diagnostic/lib/renvoi.test.ts`
- Create: `src/fonctionnalites/diagnostic/components/CarteRenvoi.tsx`
- Modify: `src/ui/CarteListe.tsx` (prop `couleurBordure`)
- Modify: `src/fonctionnalites/diagnostic/components/CarteResultat.tsx` (fichier entier)

**Interfaces:**
- Consumes: `Renvoi`, `Resultat`, `Diagnostic`, `GesteUrgence` (tâche 1) ; `diagnostics`, `gestesUrgence` ; `CarteListe` ; routes `/diagnostic/[id]` et `/urgences/[id]` (existantes).
- Produces:
  - `interface DescriptionRenvoi { icone: NomIcone; ton: 'accent' | 'danger'; titre: string; sousTitre: string }`
  - `decrireRenvoi(renvoi: Renvoi, diags: Diagnostic[], gestes: GesteUrgence[]): DescriptionRenvoi | null`
  - `prosVisibles(resultat: Resultat): boolean`
  - `CarteRenvoi({ renvoi }: { renvoi: Renvoi })`
  - `CarteListe` : nouvelle prop optionnelle `couleurBordure?: string` (bordure teintée à 40 %).

- [ ] **Step 1: Écrire les tests qui échouent**

Créer `src/fonctionnalites/diagnostic/lib/renvoi.test.ts` :

```ts
import type { Diagnostic, GesteUrgence, Resultat } from '@/domaine/types';
import { decrireRenvoi, prosVisibles } from './renvoi';

const piece: Diagnostic = {
  id: 'courant-une-piece',
  titre: 'Plus de courant dans une seule pièce',
  categorie: 'electricite',
  icone: 'door-open',
  motsCles: ['pièce'],
  etapeInitiale: 'r',
  etapes: {},
  resultats: { r: { verdict: 'vert', titre: 't', conseil: 'c' } },
};
const gaz: GesteUrgence = { id: 'couper-gaz', titre: 'Odeur de gaz ?', icone: 'flame', numeroUtile: '0800 47 33 33', etapes: ['Sors.'] };
const eau: GesteUrgence = { id: 'couper-eau', titre: 'Couper l\'eau', icone: 'droplets', etapes: ['Ferme.'] };

describe('decrireRenvoi', () => {
  it('décrit un renvoi vers un diagnostic (bleu, stéthoscope)', () => {
    expect(decrireRenvoi({ type: 'diagnostic', id: 'courant-une-piece' }, [piece], [gaz])).toEqual({
      icone: 'stethoscope',
      ton: 'accent',
      titre: 'Plus de courant dans une seule pièce',
      sousTitre: 'Continuer avec ce diagnostic',
    });
  });

  it('décrit le renvoi vers « Odeur de gaz ? » (rouge, flamme)', () => {
    expect(decrireRenvoi({ type: 'urgence', id: 'couper-gaz' }, [piece], [gaz])).toEqual({
      icone: 'flame',
      ton: 'danger',
      titre: 'Odeur de gaz ?',
      sousTitre: 'Consignes et numéro d\'urgence',
    });
  });

  it('un geste sans numéro annonce seulement des consignes', () => {
    expect(decrireRenvoi({ type: 'urgence', id: 'couper-eau' }, [], [eau])?.sousTitre).toBe('Consignes de sécurité');
  });

  it('ne décrit rien si la cible n\'existe pas', () => {
    expect(decrireRenvoi({ type: 'diagnostic', id: 'fantome' }, [piece], [gaz])).toBeNull();
    expect(decrireRenvoi({ type: 'urgence', id: 'fantome' }, [piece], [gaz])).toBeNull();
  });
});

describe('prosVisibles', () => {
  const resultat = (r: Partial<Resultat>): Resultat => ({ verdict: 'orange', titre: 't', conseil: 'c', ...r });

  it('montre les pros en temps normal', () => {
    expect(prosVisibles(resultat({}))).toBe(true);
    expect(prosVisibles(resultat({ verdict: 'rouge' }))).toBe(true);
  });

  it('montre les pros sur un résultat orange qui renvoie vers Urgences (chaudière)', () => {
    expect(prosVisibles(resultat({ renvoi: { type: 'urgence', id: 'couper-gaz' } }))).toBe(true);
  });

  it('cache les pros sur un résultat rouge qui renvoie vers Urgences (gaz)', () => {
    expect(prosVisibles(resultat({ verdict: 'rouge', renvoi: { type: 'urgence', id: 'couper-gaz' } }))).toBe(false);
  });
});
```

- [ ] **Step 2: Lancer les tests pour vérifier qu'ils échouent**

Run: `npx jest src/fonctionnalites/diagnostic/lib/renvoi.test.ts`
Expected: FAIL — `Cannot find module './renvoi'`.

- [ ] **Step 3: Écrire le code**

Créer `src/fonctionnalites/diagnostic/lib/renvoi.ts` :

```ts
import type { NomIcone } from '@/domaine/icones';
import type { Diagnostic, GesteUrgence, Renvoi, Resultat } from '@/domaine/types';

export interface DescriptionRenvoi {
  icone: NomIcone;
  ton: 'accent' | 'danger';
  titre: string;
  sousTitre: string;
}

/** Ce qu'affiche la carte de renvoi (maquette 8), ou null si la cible n'existe pas. */
export function decrireRenvoi(renvoi: Renvoi, diags: Diagnostic[], gestes: GesteUrgence[]): DescriptionRenvoi | null {
  if (renvoi.type === 'diagnostic') {
    const cible = diags.find((d) => d.id === renvoi.id);
    return cible
      ? { icone: 'stethoscope', ton: 'accent', titre: cible.titre, sousTitre: 'Continuer avec ce diagnostic' }
      : null;
  }
  const geste = gestes.find((g) => g.id === renvoi.id);
  if (!geste) return null;
  return {
    icone: geste.icone,
    ton: 'danger',
    titre: geste.titre,
    sousTitre: geste.numeroUtile ? 'Consignes et numéro d\'urgence' : 'Consignes de sécurité',
  };
}

/** Sur un verdict rouge qui renvoie vers Urgences (gaz), on ne propose pas de plombier ni d'électricien. */
export function prosVisibles(resultat: Resultat): boolean {
  return !(resultat.verdict === 'rouge' && resultat.renvoi?.type === 'urgence');
}
```

Dans `src/ui/CarteListe.tsx` :
- dans `interface Props`, ajouter après `grande?: boolean;` la ligne `couleurBordure?: string;`
- remplacer la signature par `export function CarteListe({ icone, couleur, titre, sousTitre, onPress, droite, danger, grande, couleurBordure }: Props) {`
- remplacer la ligne `const bordure = …` par :

```ts
  const bordure = danger
    ? teinte(couleurs.danger, 0.45)
    : couleurBordure
      ? teinte(couleurBordure, 0.4)
      : couleurs.bordure;
```

Créer `src/fonctionnalites/diagnostic/components/CarteRenvoi.tsx` :

```tsx
// src/fonctionnalites/diagnostic/components/CarteRenvoi.tsx — bouton « continuer avec… » d'un résultat (maquette 8).
import { router } from 'expo-router';
import type { Renvoi } from '@/domaine/types';
import { diagnostics } from '@/donnees/diagnostics';
import { gestesUrgence } from '@/donnees/gestesUrgence';
import { useTheme } from '@/theme/ThemeProvider';
import { CarteListe } from '@/ui/CarteListe';
import { decrireRenvoi } from '../lib/renvoi';

export function CarteRenvoi({ renvoi }: { renvoi: Renvoi }) {
  const { couleurs } = useTheme();
  const description = decrireRenvoi(renvoi, diagnostics, gestesUrgence);
  if (!description) return null;
  const couleur = description.ton === 'accent' ? couleurs.accent : couleurs.danger;
  const ouvrir = () => {
    if (renvoi.type === 'diagnostic') {
      // Nouvel écran : le diagnostic renvoyé démarre à sa première question.
      router.push({ pathname: '/diagnostic/[id]', params: { id: renvoi.id } });
    } else {
      router.push({ pathname: '/urgences/[id]', params: { id: renvoi.id } }, { withAnchor: true });
    }
  };
  return (
    <CarteListe
      icone={description.icone}
      couleur={couleur}
      couleurBordure={couleur}
      titre={description.titre}
      sousTitre={description.sousTitre}
      onPress={ouvrir}
    />
  );
}
```

Remplacer **tout** `src/fonctionnalites/diagnostic/components/CarteResultat.tsx` par :

```tsx
// src/fonctionnalites/diagnostic/components/CarteResultat.tsx
import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LIBELLES_METIER, type Metier, type Pro } from '@/domaine/pro';
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
import { FichePro } from '@/ui/FichePro';
import { NumeroUrgence } from '@/ui/NumeroUrgence';
import { VerdictBadge } from '@/ui/VerdictBadge';
import { prosVisibles } from '../lib/renvoi';
import { CarteRenvoi } from './CarteRenvoi';

interface Props {
  resultat: Resultat;
  metier: Metier;
  onRecommencer: () => void;
}

export function CarteResultat({ resultat, metier, onRecommencer }: Props) {
  const { couleurs } = useTheme();
  const { position } = usePosition({ passif: true });
  const { pros } = usePros(position);
  const [proOuvert, setProOuvert] = useState<Pro | null>(null);
  const tuto = tutos.find((t) => t.id === resultat.tutoId);
  const geste = gestesUrgence.find((g) => g.id === resultat.gesteUrgenceId);
  const prosMetier = prosVisibles(resultat)
    ? filtrerPros(pros, metier).slice(0, resultat.verdict === 'vert' ? 1 : 2)
    : [];

  const carteRenvoi = resultat.renvoi ? <CarteRenvoi key="renvoi" renvoi={resultat.renvoi} /> : null;
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
          <CartePro key={pro.id} pro={pro} onOuvrir={setProOuvert} />
        ))}
      </View>
    ) : null;

  // Le renvoi passe toujours en premier, juste sous le conseil (maquette 8).
  const actions =
    resultat.verdict === 'vert' ? [carteRenvoi, boutonTuto, carteGeste, sectionPros] :
    resultat.verdict === 'orange' ? [carteRenvoi, carteGeste, numero, sectionPros, boutonTuto] :
    [carteRenvoi, numero, sectionPros, carteGeste];

  return (
    <>
      <View style={styles.bloc}>
        <VerdictBadge verdict={resultat.verdict} />
        <Text style={[styles.conseil, { color: couleurs.texte }]}>{resultat.conseil}</Text>
        {actions}
        <BoutonPrincipal libelle="Recommencer" icone="rotate-ccw" variante="discret" onPress={onRecommencer} />
      </View>
      <FichePro pro={proOuvert} onFermer={() => setProOuvert(null)} />
    </>
  );
}

const styles = StyleSheet.create({
  bloc: { gap: 12 },
  conseil: { fontSize: 15, lineHeight: 22 },
  pros: { gap: 8 },
  titrePros: { fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.6 },
});
```

- [ ] **Step 4: Lancer les tests et le typage**

Run: `npx jest`
Expected: PASS.

Run: `npx tsc --noEmit`
Expected: aucune erreur. (Aucun JSON n'a encore de renvoi : l'affichage sera vérifié à la tâche 6 avec la panne « Pas d'eau chaude » et à la tâche 10.)

- [ ] **Step 5: Commit**

```bash
git add src/fonctionnalites/diagnostic/lib/renvoi.ts src/fonctionnalites/diagnostic/lib/renvoi.test.ts src/fonctionnalites/diagnostic/components/CarteRenvoi.tsx src/fonctionnalites/diagnostic/components/CarteResultat.tsx src/ui/CarteListe.tsx
git commit -m "Affiche sur le résultat un bouton qui ouvre un autre diagnostic ou la fiche « Odeur de gaz ? »"
```

---

### Task 6: Lot A — les 6 pannes existantes revues

**Files:**
- Modify: `src/donnees/diagnostics/fuite-eau.json`, `wc-bouche.json`, `evier-bouche.json`, `pas-eau-chaude.json`, `disjoncteur-saute.json`, `plus-de-courant.json` (contenu entier)
- Test: `src/donnees/diagnostics.data.test.ts`, `src/donnees/gestesEtTutos.data.test.ts` (inchangés : ils valident les nouvelles versions)

**Interfaces:**
- Consumes: tutos `changer-joint`, `deboucher-wc`, `deboucher-evier`, `nettoyer-siphon`, `detartrer-mousseur`, `reparer-disjoncteur` ; gestes `couper-eau`, `couper-courant`, `couper-gaz` ; `renvoi` (tâche 1).
- Produces: les 6 ids inchangés (`fuite-eau`, `wc-bouche`, `evier-bouche`, `pas-eau-chaude`, `disjoncteur-saute`, `plus-de-courant`).

- [ ] **Step 1: Écrire le test qui échoue**

Dans `src/donnees/diagnostics.data.test.ts`, ajouter dans le `describe` :

```ts
  it('« Pas d\'eau chaude » demande d\'abord chauffe-eau ou chaudière, et la chaudière renvoie vers le gaz', () => {
    const diag = diagnostics.find((d) => d.id === 'pas-eau-chaude')!;
    expect(diag.etapeInitiale).toBe('q0');
    expect(diag.resultats.resultat_chauffagiste.verdict).toBe('orange');
    expect(diag.resultats.resultat_chauffagiste.renvoi).toEqual({ type: 'urgence', id: 'couper-gaz' });
    expect(diag.resultats.resultat_pro.verdict).toBe('orange');
  });
```

- [ ] **Step 2: Lancer le test pour vérifier qu'il échoue**

Run: `npx jest src/donnees/diagnostics.data.test.ts`
Expected: FAIL — `etapeInitiale` vaut `q1`.

- [ ] **Step 3: Écrire les JSON**

`src/donnees/diagnostics/fuite-eau.json` :

```json
{
  "id": "fuite-eau",
  "titre": "Fuite d'eau",
  "categorie": "plomberie",
  "icone": "droplets",
  "motsCles": ["fuite", "eau", "goutte", "plafond", "compteur", "tuyau", "raccord"],
  "etapeInitiale": "q1",
  "etapes": {
    "q1": {
      "question": "D'où vient la fuite ?",
      "reponses": [
        { "texte": "Sous l'évier ou le lavabo", "suite": "q2" },
        { "texte": "Du compteur d'eau", "suite": "resultat_compteur" },
        { "texte": "Du plafond ou d'en haut", "suite": "resultat_plafond" },
        { "texte": "Je ne sais pas, il y a de l'eau par terre", "suite": "resultat_inconnue", "inconnu": true }
      ]
    },
    "q2": {
      "question": "Le tuyau est-il percé, ou c'est juste un raccord (écrou) qui goutte ?",
      "reponses": [
        { "texte": "Juste un raccord qui goutte", "suite": "resultat_raccord" },
        { "texte": "Tuyau percé ou cassé", "suite": "resultat_perce" },
        { "texte": "Je ne sais pas", "suite": "resultat_perce", "inconnu": true }
      ]
    }
  },
  "resultats": {
    "resultat_raccord": {
      "verdict": "vert",
      "titre": "Tu peux réparer ça toi-même",
      "conseil": "Resserre doucement l'écrou d'un quart de tour. Si ça goutte encore, change le joint.",
      "tutoId": "changer-joint"
    },
    "resultat_perce": {
      "verdict": "orange",
      "titre": "Sécurise en attendant un pro",
      "conseil": "Coupe l'eau au robinet général et mets une bassine dessous. Un plombier doit remplacer le morceau de tuyau.",
      "gesteUrgenceId": "couper-eau"
    },
    "resultat_compteur": {
      "verdict": "orange",
      "titre": "Sécurise en attendant un pro",
      "conseil": "Une fuite au compteur (avant ou juste après) se signale au fournisseur d'eau : c'est souvent à sa charge. Coupe l'eau si tu peux et appelle le numéro du service des eaux sur ta facture.",
      "gesteUrgenceId": "couper-eau"
    },
    "resultat_plafond": {
      "verdict": "rouge",
      "titre": "Appelle un pro tout de suite",
      "conseil": "Ne touche pas aux interrupteurs ni aux lampes proches de l'eau. Si l'eau coule près d'une lampe ou d'une prise, coupe le courant au disjoncteur général si tu peux y accéder au sec. Préviens le voisin du dessus ou le gardien, puis appelle un pro.",
      "gesteUrgenceId": "couper-courant"
    },
    "resultat_inconnue": {
      "verdict": "orange",
      "titre": "Sécurise en attendant un pro",
      "conseil": "Coupe l'eau au robinet général, éponge et cherche d'où ça vient (sous les meubles, derrière le WC, le lave-linge). Si tu ne trouves pas, appelle un plombier.",
      "gesteUrgenceId": "couper-eau"
    }
  }
}
```

`src/donnees/diagnostics/wc-bouche.json` :

```json
{
  "id": "wc-bouche",
  "titre": "WC bouché",
  "categorie": "plomberie",
  "icone": "toilet",
  "motsCles": ["wc", "toilettes", "bouché", "cuvette", "chasse"],
  "etapeInitiale": "q1",
  "etapes": {
    "q1": {
      "question": "L'eau monte-t-elle dans la cuvette quand tu tires la chasse ?",
      "reponses": [
        { "texte": "Oui, elle monte près du bord", "suite": "resultat_ne_plus_tirer" },
        { "texte": "Non, elle descend lentement", "suite": "q2" }
      ]
    },
    "q2": {
      "question": "D'autres évacuations (douche, évier) s'écoulent-elles mal aussi, ou font des bruits de glouglou ?",
      "reponses": [
        { "texte": "Non, seulement les WC", "suite": "resultat_ventouse" },
        { "texte": "Oui", "suite": "resultat_canalisation" },
        { "texte": "Je ne sais pas", "suite": "resultat_ventouse", "inconnu": true }
      ]
    }
  },
  "resultats": {
    "resultat_ne_plus_tirer": {
      "verdict": "orange",
      "titre": "Sécurise en attendant un pro",
      "conseil": "Ne tire plus la chasse, sinon ça débordera. Attends que le niveau baisse, puis utilise une ventouse. Si rien ne bouge, appelle un plombier.",
      "tutoId": "deboucher-wc"
    },
    "resultat_ventouse": {
      "verdict": "vert",
      "titre": "Tu peux réparer ça toi-même",
      "conseil": "Une ventouse à WC suffit dans la plupart des cas. N'utilise pas de produit chimique puis la ventouse (projections).",
      "tutoId": "deboucher-wc"
    },
    "resultat_canalisation": {
      "verdict": "orange",
      "titre": "Sécurise en attendant un pro",
      "conseil": "Le bouchon est sûrement dans la canalisation commune. Limite l'usage de l'eau et appelle un plombier (ou le gardien si tu es en immeuble)."
    }
  }
}
```

`src/donnees/diagnostics/evier-bouche.json` :

```json
{
  "id": "evier-bouche",
  "titre": "Évier ou lavabo bouché",
  "categorie": "plomberie",
  "icone": "waves",
  "motsCles": ["évier", "lavabo", "bouché", "écoulement", "siphon"],
  "etapeInitiale": "q1",
  "etapes": {
    "q1": {
      "question": "L'eau s'écoule-t-elle un peu, ou plus du tout ?",
      "reponses": [
        { "texte": "Elle s'écoule lentement", "suite": "resultat_deboucher" },
        { "texte": "Plus du tout", "suite": "q2" }
      ]
    },
    "q2": {
      "question": "D'autres évacuations sont-elles touchées (autre évier, douche) ?",
      "reponses": [
        { "texte": "Non, seulement celui-ci", "suite": "resultat_siphon" },
        { "texte": "Oui", "suite": "resultat_canalisation" },
        { "texte": "Je ne sais pas", "suite": "resultat_siphon", "inconnu": true }
      ]
    }
  },
  "resultats": {
    "resultat_deboucher": {
      "verdict": "vert",
      "titre": "Tu peux réparer ça toi-même",
      "conseil": "Une ventouse ou un furet suffit généralement.",
      "tutoId": "deboucher-evier"
    },
    "resultat_siphon": {
      "verdict": "vert",
      "titre": "Tu peux réparer ça toi-même",
      "conseil": "Le bouchon est sûrement dans le siphon (le coude sous l'évier). Il se dévisse à la main.",
      "tutoId": "nettoyer-siphon"
    },
    "resultat_canalisation": {
      "verdict": "orange",
      "titre": "Sécurise en attendant un pro",
      "conseil": "Le bouchon est dans une canalisation commune. N'utilise plus l'eau et appelle un plombier."
    }
  }
}
```

`src/donnees/diagnostics/pas-eau-chaude.json` :

```json
{
  "id": "pas-eau-chaude",
  "titre": "Pas d'eau chaude",
  "categorie": "plomberie",
  "icone": "heater",
  "motsCles": ["eau chaude", "chauffe-eau", "ballon", "cumulus", "froide"],
  "etapeInitiale": "q0",
  "etapes": {
    "q0": {
      "question": "Ton eau chaude vient-elle d'un chauffe-eau électrique (un ballon) ou d'une chaudière (souvent au gaz) ?",
      "reponses": [
        { "texte": "Un chauffe-eau électrique", "suite": "q1" },
        { "texte": "Une chaudière", "suite": "resultat_chauffagiste" },
        { "texte": "Je ne sais pas", "suite": "resultat_chauffagiste", "inconnu": true }
      ]
    },
    "q1": {
      "question": "Y a-t-il de l'eau chaude à un autre robinet de la maison ?",
      "reponses": [
        { "texte": "Oui, seulement ce robinet est froid", "suite": "resultat_mitigeur" },
        { "texte": "Non, nulle part", "suite": "q2" }
      ]
    },
    "q2": {
      "question": "Le disjoncteur « chauffe-eau » du tableau électrique est-il en position basse ?",
      "reponses": [
        { "texte": "Oui", "suite": "resultat_rearmer" },
        { "texte": "Non, il est en haut", "suite": "q3" },
        { "texte": "Je ne sais pas lequel c'est", "suite": "resultat_pro", "inconnu": true }
      ]
    },
    "q3": {
      "question": "Ton chauffe-eau chauffe peut-être seulement la nuit (heures creuses). As-tu utilisé beaucoup d'eau chaude depuis hier soir ?",
      "reponses": [
        { "texte": "Oui, on en a beaucoup utilisé", "suite": "resultat_attendre" },
        { "texte": "Non", "suite": "resultat_pro" }
      ]
    }
  },
  "resultats": {
    "resultat_mitigeur": {
      "verdict": "vert",
      "titre": "Tu peux réparer ça toi-même",
      "conseil": "Le problème vient du robinet (cartouche du mitigeur entartrée), pas du chauffe-eau. Si l'eau coule faiblement, détartre le mousseur ; sinon, appelle un plombier.",
      "tutoId": "detartrer-mousseur"
    },
    "resultat_rearmer": {
      "verdict": "vert",
      "titre": "Tu peux réparer ça toi-même",
      "conseil": "Réarme le disjoncteur. L'eau mettra plusieurs heures à chauffer. S'il re-saute, n'insiste pas et appelle un pro.",
      "tutoId": "reparer-disjoncteur"
    },
    "resultat_attendre": {
      "verdict": "vert",
      "titre": "Tu peux réparer ça toi-même",
      "conseil": "Le ballon est simplement vide. Attends la nuit (heures creuses) : l'eau sera chaude demain matin."
    },
    "resultat_pro": {
      "verdict": "orange",
      "titre": "Sécurise en attendant un pro",
      "conseil": "Pas de danger immédiat, mais le chauffe-eau est probablement en panne (résistance, thermostat ou contacteur). N'ouvre jamais le capot du chauffe-eau : il y a du courant. Appelle un plombier-chauffagiste."
    },
    "resultat_chauffagiste": {
      "verdict": "orange",
      "titre": "Sécurise en attendant un pro",
      "conseil": "Les chaudières ne sont pas traitées par l'appli. N'ouvre pas la chaudière et appelle ton chauffagiste (ou ton bailleur si tu es locataire). Si tu sens le gaz, va tout de suite dans l'onglet Urgences.",
      "renvoi": { "type": "urgence", "id": "couper-gaz" }
    }
  }
}
```

`src/donnees/diagnostics/disjoncteur-saute.json` :

```json
{
  "id": "disjoncteur-saute",
  "titre": "Disjoncteur qui saute",
  "categorie": "electricite",
  "icone": "toggle-left",
  "motsCles": ["disjoncteur", "saute", "tableau", "plombs", "coupure"],
  "etapeInitiale": "q1",
  "etapes": {
    "q1": {
      "question": "Le disjoncteur a-t-il sauté quand tu as allumé un appareil précis ?",
      "reponses": [
        { "texte": "Oui (radiateur, four, bouilloire…)", "suite": "q2" },
        { "texte": "Non", "suite": "q3" },
        { "texte": "Je ne sais pas", "suite": "q3", "inconnu": true }
      ]
    },
    "q2": {
      "question": "Débranche cet appareil, puis réarme le disjoncteur. Tient-il ?",
      "reponses": [
        { "texte": "Oui, il tient", "suite": "resultat_appareil" },
        { "texte": "Non, il re-saute", "suite": "resultat_court_circuit" }
      ]
    },
    "q3": {
      "question": "Quand tu réarmes le disjoncteur, re-saute-t-il tout de suite ?",
      "reponses": [
        { "texte": "Non, il tient", "suite": "resultat_surcharge" },
        { "texte": "Oui, il re-saute immédiatement", "suite": "resultat_court_circuit" }
      ]
    }
  },
  "resultats": {
    "resultat_appareil": {
      "verdict": "orange",
      "titre": "Sécurise en attendant un pro",
      "conseil": "C'est l'appareil qui est en défaut. Ne le rebranche pas, fais-le réparer ou remplace-le."
    },
    "resultat_surcharge": {
      "verdict": "vert",
      "titre": "Tu peux réparer ça toi-même",
      "conseil": "Trop d'appareils en même temps sur le même circuit. Répartis-les sur d'autres prises ou d'autres pièces.",
      "tutoId": "reparer-disjoncteur"
    },
    "resultat_court_circuit": {
      "verdict": "rouge",
      "titre": "Appelle un pro tout de suite",
      "conseil": "Un disjoncteur qui re-saute immédiatement signale un défaut. Ne le réarme pas plusieurs fois et ne touche pas au tableau. Appelle un électricien."
    }
  }
}
```

`src/donnees/diagnostics/plus-de-courant.json` :

```json
{
  "id": "plus-de-courant",
  "titre": "Plus de courant du tout",
  "categorie": "electricite",
  "icone": "zap-off",
  "motsCles": ["courant", "électricité", "coupure", "noir", "panne"],
  "etapeInitiale": "q1",
  "etapes": {
    "q1": {
      "question": "Tes voisins ont-ils aussi une coupure de courant ?",
      "reponses": [
        { "texte": "Oui, c'est coupé chez eux aussi", "suite": "resultat_reseau" },
        { "texte": "Non, juste chez moi", "suite": "q2" },
        { "texte": "Je ne sais pas", "suite": "q2", "inconnu": true }
      ]
    },
    "q2": {
      "question": "Le disjoncteur général (souvent le plus gros, parfois dans l'entrée ou un placard technique) est-il en position basse ?",
      "reponses": [
        { "texte": "Oui", "suite": "resultat_reenclencher" },
        { "texte": "Non, il est en haut", "suite": "resultat_pro" },
        { "texte": "Je ne le trouve pas", "suite": "resultat_pro", "inconnu": true }
      ]
    }
  },
  "resultats": {
    "resultat_reseau": {
      "verdict": "orange",
      "titre": "Sécurise en attendant un pro",
      "conseil": "Coupure du réseau. Attends le rétablissement. Le numéro de dépannage d'Enedis figure sur ta facture d'électricité. Débranche les appareils sensibles en attendant."
    },
    "resultat_reenclencher": {
      "verdict": "vert",
      "titre": "Tu peux réparer ça toi-même",
      "conseil": "Remets-le en position haute. S'il re-saute, fais le diagnostic « Disjoncteur qui saute ».",
      "tutoId": "reparer-disjoncteur"
    },
    "resultat_pro": {
      "verdict": "rouge",
      "titre": "Appelle un pro tout de suite",
      "conseil": "Une coupure chez toi sans disjoncteur coupé est anormale. N'ouvre pas le tableau. Appelle un électricien, ou le dépannage Enedis (numéro sur ta facture)."
    }
  }
}
```

- [ ] **Step 4: Lancer les tests et le typage**

Run: `npx jest`
Expected: PASS (validation des 6 arbres, renvoi `couper-gaz` existant, tutos référencés existants, réponses « Je ne sais pas » en pointillé).

Run: `npx tsc --noEmit`
Expected: aucune erreur.

- [ ] **Step 5: Vérifier dans le navigateur**

Lancer `npx expo start --web --port 8099` en arrière-plan. Ouvrir `http://localhost:8099/diagnostic/pas-eau-chaude`, répondre « Une chaudière » : badge orange, conseil, puis la carte rouge « Odeur de gaz ? / Consignes et numéro d'urgence » avec bordure rouge (2e maquette de `8-renvois-schemas.html`) ; l'appui ouvre la fiche « Odeur de gaz ? » de l'onglet Urgences. Arrêter le serveur Expo.

- [ ] **Step 6: Commit**

```bash
git add src/donnees/diagnostics src/donnees/diagnostics.data.test.ts
git commit -m "Met à jour les 6 pannes existantes selon le brouillon relu (chauffe-eau ou chaudière, « Je ne sais pas », siphon)"
```

---

### Task 7: Lot B — WC (pannes 5, 6, 7, 14)

**Files:**
- Create: `src/donnees/diagnostics/wc-lent-a-remplir.json`, `chasse-coule.json`, `chasse-ne-marche-plus.json`, `fuite-pied-wc.json`
- Modify: `src/donnees/diagnostics/index.ts` (fichier entier)
- Modify: `src/donnees/diagnostics.data.test.ts` (`IDS_ATTENDUS`)

**Interfaces:**
- Consumes: tutos `detartrer-flotteur`, `regler-flotteur`, `changer-joint-clapet`, `raccrocher-tringle` ; `renvoi` vers le diagnostic `wc-lent-a-remplir`.
- Produces: ids `wc-lent-a-remplir`, `chasse-coule`, `chasse-ne-marche-plus`, `fuite-pied-wc`.

- [ ] **Step 1: Écrire le test qui échoue**

Dans `src/donnees/diagnostics.data.test.ts`, remplacer `IDS_ATTENDUS` par :

```ts
const IDS_ATTENDUS = [
  'disjoncteur-saute', 'evier-bouche', 'fuite-eau', 'pas-eau-chaude', 'plus-de-courant', 'wc-bouche',
  'wc-lent-a-remplir', 'chasse-coule', 'chasse-ne-marche-plus', 'fuite-pied-wc',
];
```

- [ ] **Step 2: Lancer le test pour vérifier qu'il échoue**

Run: `npx jest src/donnees/diagnostics.data.test.ts`
Expected: FAIL — les 4 nouveaux ids manquent.

- [ ] **Step 3: Écrire les JSON et l'index**

`src/donnees/diagnostics/wc-lent-a-remplir.json` :

```json
{
  "id": "wc-lent-a-remplir",
  "titre": "WC lent à se remplir",
  "categorie": "plomberie",
  "icone": "hourglass",
  "motsCles": ["wc", "chasse", "réservoir", "lent", "remplir", "flotteur"],
  "etapeInitiale": "q1",
  "etapes": {
    "q1": {
      "question": "Le petit robinet d'arrivée d'eau des WC (sur le tuyau, derrière ou à côté) est-il ouvert à fond ?",
      "reponses": [
        { "texte": "Oui, à fond", "suite": "q2" },
        { "texte": "Non, ou je ne suis pas sûr", "suite": "resultat_ouvrir" },
        { "texte": "Je ne sais pas où il est", "suite": "resultat_ouvrir", "inconnu": true }
      ]
    },
    "q2": {
      "question": "Le problème est-il apparu petit à petit ?",
      "reponses": [
        { "texte": "Oui, c'est de plus en plus lent", "suite": "resultat_calcaire" },
        { "texte": "Non, d'un coup", "suite": "resultat_pro" }
      ]
    }
  },
  "resultats": {
    "resultat_ouvrir": {
      "verdict": "vert",
      "titre": "Tu peux réparer ça toi-même",
      "conseil": "Le petit robinet d'arrivée se trouve sur le tuyau qui arrive au réservoir, derrière ou à côté des WC. Tourne-le dans le sens inverse des aiguilles d'une montre jusqu'en butée. Souvent, il a été fermé à moitié lors d'une réparation."
    },
    "resultat_calcaire": {
      "verdict": "vert",
      "titre": "Tu peux réparer ça toi-même",
      "conseil": "Le robinet flotteur (la pièce qui remplit le réservoir) est entartré.",
      "tutoId": "detartrer-flotteur"
    },
    "resultat_pro": {
      "verdict": "orange",
      "titre": "Sécurise en attendant un pro",
      "conseil": "Pas de danger. Le robinet flotteur est peut-être cassé : un plombier le remplacera rapidement."
    }
  }
}
```

`src/donnees/diagnostics/chasse-coule.json` :

```json
{
  "id": "chasse-coule",
  "titre": "Chasse d'eau qui coule en continu",
  "categorie": "plomberie",
  "icone": "rotate-cw",
  "motsCles": ["chasse", "coule", "fuit", "réservoir", "wc", "clapet"],
  "etapeInitiale": "q1",
  "etapes": {
    "q1": {
      "question": "Soulève le couvercle du réservoir. L'eau déborde-t-elle par le tube au milieu (le trop-plein) ?",
      "reponses": [
        { "texte": "Oui, elle coule par le tube", "suite": "resultat_flotteur" },
        { "texte": "Non, elle coule au fond vers la cuvette", "suite": "resultat_clapet" },
        { "texte": "Je ne sais pas", "suite": "resultat_couper", "inconnu": true }
      ]
    }
  },
  "resultats": {
    "resultat_flotteur": {
      "verdict": "vert",
      "titre": "Tu peux réparer ça toi-même",
      "conseil": "Le robinet flotteur ne coupe plus l'eau : il faut régler le niveau (souvent une vis ou un clip).",
      "tutoId": "regler-flotteur"
    },
    "resultat_clapet": {
      "verdict": "vert",
      "titre": "Tu peux réparer ça toi-même",
      "conseil": "Le joint du clapet, au fond du réservoir, est usé ou entartré.",
      "tutoId": "changer-joint-clapet"
    },
    "resultat_couper": {
      "verdict": "orange",
      "titre": "Sécurise en attendant un pro",
      "conseil": "Ferme le petit robinet d'arrivée des WC pour arrêter le gaspillage (une chasse qui coule peut consommer des centaines de litres par jour), puis appelle un plombier."
    }
  }
}
```

`src/donnees/diagnostics/chasse-ne-marche-plus.json` :

```json
{
  "id": "chasse-ne-marche-plus",
  "titre": "Chasse d'eau qui ne se déclenche plus",
  "categorie": "plomberie",
  "icone": "circle-x",
  "motsCles": ["chasse", "bouton", "tirette", "wc", "ne marche pas"],
  "etapeInitiale": "q1",
  "etapes": {
    "q1": {
      "question": "Le réservoir est-il plein d'eau ? (soulève le couvercle pour regarder)",
      "reponses": [
        { "texte": "Oui, il est plein", "suite": "q2" },
        { "texte": "Non, il est vide", "suite": "resultat_vide" }
      ]
    },
    "q2": {
      "question": "Quand tu appuies sur le bouton, sens-tu une résistance ?",
      "reponses": [
        { "texte": "Non, le bouton appuie dans le vide", "suite": "resultat_tringle" },
        { "texte": "Oui, mais rien ne se passe", "suite": "resultat_mecanisme" },
        { "texte": "Je ne sais pas", "suite": "resultat_mecanisme", "inconnu": true }
      ]
    }
  },
  "resultats": {
    "resultat_vide": {
      "verdict": "vert",
      "titre": "Tu peux réparer ça toi-même",
      "conseil": "L'eau n'arrive pas dans le réservoir : vérifie que le petit robinet d'arrivée est ouvert à fond. Sinon, continue avec le diagnostic « WC lent à se remplir ».",
      "renvoi": { "type": "diagnostic", "id": "wc-lent-a-remplir" }
    },
    "resultat_tringle": {
      "verdict": "vert",
      "titre": "Tu peux réparer ça toi-même",
      "conseil": "La petite tige ou le câble entre le bouton et le mécanisme s'est décroché. Soulève le couvercle et raccroche-le.",
      "tutoId": "raccrocher-tringle"
    },
    "resultat_mecanisme": {
      "verdict": "orange",
      "titre": "Sécurise en attendant un pro",
      "conseil": "Le mécanisme est bloqué ou cassé. En attendant, tu peux vider la cuvette avec un seau d'eau. Un plombier changera le mécanisme."
    }
  }
}
```

`src/donnees/diagnostics/fuite-pied-wc.json` :

```json
{
  "id": "fuite-pied-wc",
  "titre": "Fuite au pied du WC",
  "categorie": "plomberie",
  "icone": "droplet-off",
  "motsCles": ["wc", "pied", "flaque", "fuite", "sol", "toilettes"],
  "etapeInitiale": "q1",
  "etapes": {
    "q1": {
      "question": "L'eau apparaît-elle juste après avoir tiré la chasse ?",
      "reponses": [
        { "texte": "Oui", "suite": "resultat_pipe" },
        { "texte": "Non, le sol est humide tout le temps, surtout en été", "suite": "resultat_condensation" },
        { "texte": "Je ne sais pas", "suite": "resultat_pipe", "inconnu": true }
      ]
    }
  },
  "resultats": {
    "resultat_pipe": {
      "verdict": "orange",
      "titre": "Sécurise en attendant un pro",
      "conseil": "Le joint entre la cuvette et l'évacuation (la « pipe ») fuit. Ce sont des eaux usées : évite de tirer la chasse, nettoie avec des gants et appelle un plombier."
    },
    "resultat_condensation": {
      "verdict": "vert",
      "titre": "Tu peux réparer ça toi-même",
      "conseil": "Ce n'est sûrement pas une fuite : de la condensation se forme sur le réservoir froid. Aère la pièce et essuie ; si l'eau revient après avoir séché, refais le diagnostic."
    }
  }
}
```

Remplacer **tout** `src/donnees/diagnostics/index.ts` par :

```ts
import type { Diagnostic } from '@/domaine/types';
import fuiteEau from './fuite-eau.json';
import wcBouche from './wc-bouche.json';
import evierBouche from './evier-bouche.json';
import pasEauChaude from './pas-eau-chaude.json';
import wcLentARemplir from './wc-lent-a-remplir.json';
import chasseCoule from './chasse-coule.json';
import chasseNeMarchePlus from './chasse-ne-marche-plus.json';
import fuitePiedWc from './fuite-pied-wc.json';
import disjoncteurSaute from './disjoncteur-saute.json';
import plusDeCourant from './plus-de-courant.json';

// Ordre d'affichage = numéro de la panne dans docs/contenu/pannes-v2.md.
export const diagnostics: Diagnostic[] = [
  fuiteEau as Diagnostic,
  wcBouche as Diagnostic,
  evierBouche as Diagnostic,
  pasEauChaude as Diagnostic,
  wcLentARemplir as Diagnostic,
  chasseCoule as Diagnostic,
  chasseNeMarchePlus as Diagnostic,
  fuitePiedWc as Diagnostic,
  disjoncteurSaute as Diagnostic,
  plusDeCourant as Diagnostic,
];
```

- [ ] **Step 4: Lancer les tests et le typage**

Run: `npx jest`
Expected: PASS (dont « chaque renvoi pointe vers un diagnostic ou un geste existant »).

Run: `npx tsc --noEmit`
Expected: aucune erreur.

- [ ] **Step 5: Commit**

```bash
git add src/donnees/diagnostics src/donnees/diagnostics.data.test.ts
git commit -m "Ajoute les pannes de WC : remplissage lent, chasse qui coule, chasse qui ne part plus, fuite au pied"
```

---

### Task 8: Lot C — robinets, débit, douche, bruits (pannes 8, 9, 10, 15, 16)

**Files:**
- Create: `src/donnees/diagnostics/robinet-dur.json`, `robinet-goutte.json`, `pression-faible.json`, `flexible-douche-fuit.json`, `bruit-tuyaux.json`
- Modify: `src/donnees/diagnostics/index.ts` (fichier entier)
- Modify: `src/donnees/diagnostics.data.test.ts` (`IDS_ATTENDUS`)

**Interfaces:**
- Consumes: tutos `detartrer-tete-robinet`, `changer-joint`, `detartrer-mousseur`, `changer-flexible-douche` ; geste `couper-eau`.
- Produces: ids `robinet-dur`, `robinet-goutte`, `pression-faible`, `flexible-douche-fuit`, `bruit-tuyaux`.

- [ ] **Step 1: Écrire le test qui échoue**

Dans `src/donnees/diagnostics.data.test.ts`, remplacer `IDS_ATTENDUS` par :

```ts
const IDS_ATTENDUS = [
  'disjoncteur-saute', 'evier-bouche', 'fuite-eau', 'pas-eau-chaude', 'plus-de-courant', 'wc-bouche',
  'wc-lent-a-remplir', 'chasse-coule', 'chasse-ne-marche-plus', 'fuite-pied-wc',
  'robinet-dur', 'robinet-goutte', 'pression-faible', 'flexible-douche-fuit', 'bruit-tuyaux',
];
```

- [ ] **Step 2: Lancer le test pour vérifier qu'il échoue**

Run: `npx jest src/donnees/diagnostics.data.test.ts`
Expected: FAIL — les 5 nouveaux ids manquent.

- [ ] **Step 3: Écrire les JSON et l'index**

`src/donnees/diagnostics/robinet-dur.json` :

```json
{
  "id": "robinet-dur",
  "titre": "Robinet dur à fermer ou à ouvrir",
  "categorie": "plomberie",
  "icone": "wrench",
  "motsCles": ["robinet", "dur", "bloqué", "fermer", "ouvrir", "mitigeur"],
  "etapeInitiale": "q1",
  "etapes": {
    "q1": {
      "question": "C'est quel type de robinet ?",
      "reponses": [
        { "texte": "Un mitigeur (une seule manette)", "suite": "resultat_cartouche" },
        { "texte": "Deux poignées (eau chaude / eau froide)", "suite": "resultat_tete" },
        { "texte": "Le robinet général ou un robinet d'arrêt", "suite": "resultat_arret" }
      ]
    }
  },
  "resultats": {
    "resultat_cartouche": {
      "verdict": "orange",
      "titre": "Sécurise en attendant un pro",
      "conseil": "La cartouche du mitigeur est entartrée ou usée. Ne force pas : elle peut casser et fuir. Un plombier la remplace en quelques minutes."
    },
    "resultat_tete": {
      "verdict": "vert",
      "titre": "Tu peux réparer ça toi-même",
      "conseil": "La tête du robinet est entartrée. Coupe l'eau, dévisse la tête et nettoie-la au vinaigre blanc.",
      "tutoId": "detartrer-tete-robinet"
    },
    "resultat_arret": {
      "verdict": "orange",
      "titre": "Sécurise en attendant un pro",
      "conseil": "Ne force jamais un robinet d'arrêt : s'il casse, tu ne pourras plus couper l'eau. Fais-le remplacer par un plombier. Pense à le manœuvrer 2 fois par an pour qu'il ne se bloque pas."
    }
  }
}
```

`src/donnees/diagnostics/robinet-goutte.json` :

```json
{
  "id": "robinet-goutte",
  "titre": "Robinet qui goutte",
  "categorie": "plomberie",
  "icone": "droplet",
  "motsCles": ["robinet", "goutte", "fuit", "joint"],
  "etapeInitiale": "q1",
  "etapes": {
    "q1": {
      "question": "D'où ça goutte ?",
      "reponses": [
        { "texte": "Du bec, même quand le robinet est fermé", "suite": "q2" },
        { "texte": "Du pied du robinet ou sous la manette", "suite": "resultat_pied" }
      ]
    },
    "q2": {
      "question": "C'est quel type de robinet ?",
      "reponses": [
        { "texte": "Deux poignées (eau chaude / eau froide)", "suite": "resultat_joint" },
        { "texte": "Un mitigeur (une seule manette)", "suite": "resultat_cartouche" },
        { "texte": "Je ne sais pas", "suite": "resultat_cartouche", "inconnu": true }
      ]
    }
  },
  "resultats": {
    "resultat_joint": {
      "verdict": "vert",
      "titre": "Tu peux réparer ça toi-même",
      "conseil": "Le joint (clapet) à l'intérieur de la tête du robinet est usé.",
      "tutoId": "changer-joint"
    },
    "resultat_cartouche": {
      "verdict": "orange",
      "titre": "Sécurise en attendant un pro",
      "conseil": "La cartouche du mitigeur est usée. Pas d'urgence : un plombier la change rapidement."
    },
    "resultat_pied": {
      "verdict": "orange",
      "titre": "Sécurise en attendant un pro",
      "conseil": "Un joint interne ou le corps du robinet fuit. Mets un chiffon, coupe l'eau sous l'évier si ça coule beaucoup, et appelle un plombier.",
      "gesteUrgenceId": "couper-eau"
    }
  }
}
```

`src/donnees/diagnostics/pression-faible.json` :

```json
{
  "id": "pression-faible",
  "titre": "Peu de pression ou de débit",
  "categorie": "plomberie",
  "icone": "gauge",
  "motsCles": ["pression", "débit", "faible", "filet", "robinet", "douche"],
  "etapeInitiale": "q1",
  "etapes": {
    "q1": {
      "question": "Le problème touche-t-il un seul robinet, ou toute la maison ?",
      "reponses": [
        { "texte": "Un seul robinet ou la douche", "suite": "resultat_mousseur" },
        { "texte": "Toute la maison", "suite": "q2" }
      ]
    },
    "q2": {
      "question": "Tes voisins ont-ils le même problème ?",
      "reponses": [
        { "texte": "Oui", "suite": "resultat_reseau" },
        { "texte": "Non, juste chez moi", "suite": "resultat_arret" },
        { "texte": "Je ne sais pas", "suite": "resultat_arret", "inconnu": true }
      ]
    }
  },
  "resultats": {
    "resultat_mousseur": {
      "verdict": "vert",
      "titre": "Tu peux réparer ça toi-même",
      "conseil": "Le mousseur (petit filtre au bout du robinet) ou le pommeau de douche est entartré.",
      "tutoId": "detartrer-mousseur"
    },
    "resultat_reseau": {
      "verdict": "orange",
      "titre": "Sécurise en attendant un pro",
      "conseil": "C'est sûrement un souci sur le réseau d'eau (travaux, fuite dans la rue). Appelle le service des eaux (numéro sur ta facture)."
    },
    "resultat_arret": {
      "verdict": "orange",
      "titre": "Sécurise en attendant un pro",
      "conseil": "Vérifie que le robinet général est ouvert à fond. Si c'est le cas, il peut s'agir d'un réducteur de pression ou d'une fuite cachée : appelle un plombier."
    }
  }
}
```

`src/donnees/diagnostics/flexible-douche-fuit.json` :

```json
{
  "id": "flexible-douche-fuit",
  "titre": "Flexible ou pommeau de douche qui fuit",
  "categorie": "plomberie",
  "icone": "bath",
  "motsCles": ["douche", "flexible", "pommeau", "fuit", "joint"],
  "etapeInitiale": "q1",
  "etapes": {
    "q1": {
      "question": "D'où vient la fuite ?",
      "reponses": [
        { "texte": "Au raccord du flexible (en haut ou en bas)", "suite": "resultat_joint" },
        { "texte": "Le flexible lui-même est percé ou gonflé", "suite": "resultat_flexible" },
        { "texte": "Du pommeau, par les côtés", "suite": "resultat_pommeau" }
      ]
    }
  },
  "resultats": {
    "resultat_joint": {
      "verdict": "vert",
      "titre": "Tu peux réparer ça toi-même",
      "conseil": "Le petit joint du raccord est usé. Dévisse à la main, change le joint, revisse.",
      "tutoId": "changer-flexible-douche"
    },
    "resultat_flexible": {
      "verdict": "vert",
      "titre": "Tu peux réparer ça toi-même",
      "conseil": "Change le flexible : il se visse à la main, en taille standard.",
      "tutoId": "changer-flexible-douche"
    },
    "resultat_pommeau": {
      "verdict": "vert",
      "titre": "Tu peux réparer ça toi-même",
      "conseil": "Dévisse le pommeau, change son joint et détartre-le.",
      "tutoId": "detartrer-mousseur"
    }
  }
}
```

`src/donnees/diagnostics/bruit-tuyaux.json` :

```json
{
  "id": "bruit-tuyaux",
  "titre": "Bruit ou coups dans les tuyaux",
  "categorie": "plomberie",
  "icone": "audio-waveform",
  "motsCles": ["bruit", "coups", "tuyaux", "claquement", "sifflement", "bélier"],
  "etapeInitiale": "q1",
  "etapes": {
    "q1": {
      "question": "Quel bruit entends-tu ?",
      "reponses": [
        { "texte": "Un gros « coup » quand on ferme un robinet", "suite": "resultat_belier" },
        { "texte": "Un sifflement quand l'eau coule", "suite": "resultat_sifflement" },
        { "texte": "Un bruit qui vient du chauffe-eau", "suite": "resultat_chauffe_eau" }
      ]
    }
  },
  "resultats": {
    "resultat_belier": {
      "verdict": "orange",
      "titre": "Sécurise en attendant un pro",
      "conseil": "C'est un « coup de bélier ». Ferme les robinets plus doucement en attendant. Un plombier peut poser un anti-bélier."
    },
    "resultat_sifflement": {
      "verdict": "vert",
      "titre": "Tu peux réparer ça toi-même",
      "conseil": "C'est souvent un robinet d'arrêt à moitié fermé ou un mousseur entartré. Ouvre les robinets d'arrêt à fond, puis détartre le mousseur.",
      "tutoId": "detartrer-mousseur"
    },
    "resultat_chauffe_eau": {
      "verdict": "orange",
      "titre": "Sécurise en attendant un pro",
      "conseil": "Un chauffe-eau qui fait du bruit est souvent très entartré. Pas de danger immédiat, mais fais-le vérifier par un plombier."
    }
  }
}
```

Remplacer **tout** `src/donnees/diagnostics/index.ts` par :

```ts
import type { Diagnostic } from '@/domaine/types';
import fuiteEau from './fuite-eau.json';
import wcBouche from './wc-bouche.json';
import evierBouche from './evier-bouche.json';
import pasEauChaude from './pas-eau-chaude.json';
import wcLentARemplir from './wc-lent-a-remplir.json';
import chasseCoule from './chasse-coule.json';
import chasseNeMarchePlus from './chasse-ne-marche-plus.json';
import robinetDur from './robinet-dur.json';
import robinetGoutte from './robinet-goutte.json';
import pressionFaible from './pression-faible.json';
import fuitePiedWc from './fuite-pied-wc.json';
import flexibleDoucheFuit from './flexible-douche-fuit.json';
import bruitTuyaux from './bruit-tuyaux.json';
import disjoncteurSaute from './disjoncteur-saute.json';
import plusDeCourant from './plus-de-courant.json';

// Ordre d'affichage = numéro de la panne dans docs/contenu/pannes-v2.md.
export const diagnostics: Diagnostic[] = [
  fuiteEau as Diagnostic,
  wcBouche as Diagnostic,
  evierBouche as Diagnostic,
  pasEauChaude as Diagnostic,
  wcLentARemplir as Diagnostic,
  chasseCoule as Diagnostic,
  chasseNeMarchePlus as Diagnostic,
  robinetDur as Diagnostic,
  robinetGoutte as Diagnostic,
  pressionFaible as Diagnostic,
  fuitePiedWc as Diagnostic,
  flexibleDoucheFuit as Diagnostic,
  bruitTuyaux as Diagnostic,
  disjoncteurSaute as Diagnostic,
  plusDeCourant as Diagnostic,
];
```

- [ ] **Step 4: Lancer les tests et le typage**

Run: `npx jest`
Expected: PASS.

Run: `npx tsc --noEmit`
Expected: aucune erreur.

- [ ] **Step 5: Commit**

```bash
git add src/donnees/diagnostics src/donnees/diagnostics.data.test.ts
git commit -m "Ajoute les pannes de robinets, de débit, de flexible de douche et de bruits dans les tuyaux"
```

---

### Task 9: Lot D — évacuations, odeurs, chauffe-eau (pannes 11, 12, 13)

**Files:**
- Create: `src/donnees/diagnostics/douche-ecoule-mal.json`, `odeur-egout.json`, `groupe-securite-goutte.json`
- Modify: `src/donnees/diagnostics/index.ts` (fichier entier)
- Modify: `src/donnees/diagnostics.data.test.ts` (`IDS_ATTENDUS` + un test gaz)

**Interfaces:**
- Consumes: tutos `nettoyer-bonde`, `remplir-siphon`, `nettoyer-siphon`, `entretenir-groupe-securite` ; renvoi vers l'urgence `couper-gaz`.
- Produces: ids `douche-ecoule-mal`, `odeur-egout`, `groupe-securite-goutte`.

- [ ] **Step 1: Écrire les tests qui échouent**

Dans `src/donnees/diagnostics.data.test.ts`, remplacer `IDS_ATTENDUS` par :

```ts
const IDS_ATTENDUS = [
  'disjoncteur-saute', 'evier-bouche', 'fuite-eau', 'pas-eau-chaude', 'plus-de-courant', 'wc-bouche',
  'wc-lent-a-remplir', 'chasse-coule', 'chasse-ne-marche-plus', 'fuite-pied-wc',
  'robinet-dur', 'robinet-goutte', 'pression-faible', 'flexible-douche-fuit', 'bruit-tuyaux',
  'douche-ecoule-mal', 'odeur-egout', 'groupe-securite-goutte',
];
```

et ajouter dans le `describe` :

```ts
  it('« Mauvaise odeur d\'égout » pose d\'abord la question du gaz (rouge, numéro, renvoi Urgences)', () => {
    const diag = diagnostics.find((d) => d.id === 'odeur-egout')!;
    expect(diag.etapeInitiale).toBe('q0');
    const gaz = diag.resultats.resultat_gaz;
    expect(gaz.verdict).toBe('rouge');
    expect(gaz.numeroUtile).toBe('0800 47 33 33');
    expect(gaz.renvoi).toEqual({ type: 'urgence', id: 'couper-gaz' });
    expect(gaz.tutoId).toBeUndefined();
  });
```

- [ ] **Step 2: Lancer les tests pour vérifier qu'ils échouent**

Run: `npx jest src/donnees/diagnostics.data.test.ts`
Expected: FAIL — 3 ids manquants ; `odeur-egout` introuvable (`Cannot read properties of undefined`).

- [ ] **Step 3: Écrire les JSON et l'index**

`src/donnees/diagnostics/douche-ecoule-mal.json` :

```json
{
  "id": "douche-ecoule-mal",
  "titre": "Douche ou baignoire qui s'écoule mal",
  "categorie": "plomberie",
  "icone": "shower-head",
  "motsCles": ["douche", "baignoire", "bonde", "écoulement", "cheveux", "bouché"],
  "etapeInitiale": "q1",
  "etapes": {
    "q1": {
      "question": "L'eau finit-elle par s'écouler ?",
      "reponses": [
        { "texte": "Oui, lentement", "suite": "resultat_bonde" },
        { "texte": "Non, plus du tout, et d'autres évacuations sont touchées", "suite": "resultat_canalisation" }
      ]
    }
  },
  "resultats": {
    "resultat_bonde": {
      "verdict": "vert",
      "titre": "Tu peux réparer ça toi-même",
      "conseil": "Ce sont presque toujours des cheveux et du savon dans la bonde.",
      "tutoId": "nettoyer-bonde"
    },
    "resultat_canalisation": {
      "verdict": "orange",
      "titre": "Sécurise en attendant un pro",
      "conseil": "Le bouchon est plus loin dans la canalisation. N'utilise plus la douche et appelle un plombier."
    }
  }
}
```

`src/donnees/diagnostics/odeur-egout.json` :

```json
{
  "id": "odeur-egout",
  "titre": "Mauvaise odeur d'égout",
  "categorie": "plomberie",
  "icone": "wind",
  "motsCles": ["odeur", "égout", "mauvaise odeur", "siphon", "sent"],
  "etapeInitiale": "q0",
  "etapes": {
    "q0": {
      "question": "Est-ce plutôt une odeur de gaz (œuf pourri, odeur « chimique ») ?",
      "reponses": [
        { "texte": "Oui", "suite": "resultat_gaz" },
        { "texte": "Non, ça sent l'égout", "suite": "q1" },
        { "texte": "Je ne suis pas sûr", "suite": "resultat_gaz", "inconnu": true }
      ]
    },
    "q1": {
      "question": "L'odeur vient-elle d'une évacuation peu utilisée (douche d'amis, lavabo, siphon de sol) ?",
      "reponses": [
        { "texte": "Oui", "suite": "resultat_siphon_sec" },
        { "texte": "Non, d'un évier ou d'une douche utilisés tous les jours", "suite": "resultat_nettoyer" },
        { "texte": "Je ne sais pas d'où elle vient", "suite": "resultat_pro", "inconnu": true }
      ]
    }
  },
  "resultats": {
    "resultat_siphon_sec": {
      "verdict": "vert",
      "titre": "Tu peux réparer ça toi-même",
      "conseil": "L'eau du siphon s'est évaporée et laisse passer l'odeur. Fais couler l'eau une minute.",
      "tutoId": "remplir-siphon"
    },
    "resultat_nettoyer": {
      "verdict": "vert",
      "titre": "Tu peux réparer ça toi-même",
      "conseil": "Le siphon est encrassé.",
      "tutoId": "nettoyer-siphon"
    },
    "resultat_pro": {
      "verdict": "orange",
      "titre": "Sécurise en attendant un pro",
      "conseil": "Une odeur d'égout persistante sans origine visible peut venir d'une ventilation ou d'une canalisation abîmée. Aère et appelle un plombier."
    },
    "resultat_gaz": {
      "verdict": "rouge",
      "titre": "Appelle un pro tout de suite",
      "conseil": "Ne touche à aucun interrupteur, n'allume rien, ouvre les fenêtres, sors et appelle le numéro d'urgence gaz depuis l'extérieur.",
      "numeroUtile": "0800 47 33 33",
      "renvoi": { "type": "urgence", "id": "couper-gaz" }
    }
  }
}
```

`src/donnees/diagnostics/groupe-securite-goutte.json` :

```json
{
  "id": "groupe-securite-goutte",
  "titre": "Groupe de sécurité du chauffe-eau qui goutte",
  "categorie": "plomberie",
  "icone": "cylinder",
  "motsCles": ["groupe de sécurité", "chauffe-eau", "goutte", "ballon", "cumulus", "soupape"],
  "etapeInitiale": "q1",
  "etapes": {
    "q1": {
      "question": "Ça goutte seulement pendant que le chauffe-eau chauffe (souvent la nuit) ?",
      "reponses": [
        { "texte": "Oui, quelques gouttes pendant la chauffe", "suite": "resultat_normal" },
        { "texte": "Non, ça coule en continu, même quand il ne chauffe pas", "suite": "resultat_pro" },
        { "texte": "Je ne sais pas", "suite": "resultat_pro", "inconnu": true }
      ]
    }
  },
  "resultats": {
    "resultat_normal": {
      "verdict": "vert",
      "titre": "Tu peux réparer ça toi-même",
      "conseil": "C'est normal : l'eau se dilate en chauffant et le groupe de sécurité évacue le surplus. Pense à manœuvrer sa petite manette une fois par mois pour éviter le calcaire.",
      "tutoId": "entretenir-groupe-securite"
    },
    "resultat_pro": {
      "verdict": "orange",
      "titre": "Sécurise en attendant un pro",
      "conseil": "Le groupe de sécurité est usé ou la pression est trop forte. Ne le bouche jamais (risque d'explosion du ballon). Appelle un plombier."
    }
  }
}
```

Remplacer **tout** `src/donnees/diagnostics/index.ts` par :

```ts
import type { Diagnostic } from '@/domaine/types';
import fuiteEau from './fuite-eau.json';
import wcBouche from './wc-bouche.json';
import evierBouche from './evier-bouche.json';
import pasEauChaude from './pas-eau-chaude.json';
import wcLentARemplir from './wc-lent-a-remplir.json';
import chasseCoule from './chasse-coule.json';
import chasseNeMarchePlus from './chasse-ne-marche-plus.json';
import robinetDur from './robinet-dur.json';
import robinetGoutte from './robinet-goutte.json';
import pressionFaible from './pression-faible.json';
import doucheEcouleMal from './douche-ecoule-mal.json';
import odeurEgout from './odeur-egout.json';
import groupeSecuriteGoutte from './groupe-securite-goutte.json';
import fuitePiedWc from './fuite-pied-wc.json';
import flexibleDoucheFuit from './flexible-douche-fuit.json';
import bruitTuyaux from './bruit-tuyaux.json';
import disjoncteurSaute from './disjoncteur-saute.json';
import plusDeCourant from './plus-de-courant.json';

// Ordre d'affichage = numéro de la panne dans docs/contenu/pannes-v2.md.
export const diagnostics: Diagnostic[] = [
  fuiteEau as Diagnostic,
  wcBouche as Diagnostic,
  evierBouche as Diagnostic,
  pasEauChaude as Diagnostic,
  wcLentARemplir as Diagnostic,
  chasseCoule as Diagnostic,
  chasseNeMarchePlus as Diagnostic,
  robinetDur as Diagnostic,
  robinetGoutte as Diagnostic,
  pressionFaible as Diagnostic,
  doucheEcouleMal as Diagnostic,
  odeurEgout as Diagnostic,
  groupeSecuriteGoutte as Diagnostic,
  fuitePiedWc as Diagnostic,
  flexibleDoucheFuit as Diagnostic,
  bruitTuyaux as Diagnostic,
  disjoncteurSaute as Diagnostic,
  plusDeCourant as Diagnostic,
];
```

- [ ] **Step 4: Lancer les tests et le typage**

Run: `npx jest`
Expected: PASS (dont « tout résultat qui parle de gaz renvoie vers « Odeur de gaz ? » » et « un résultat rouge qui renvoie vers « Odeur de gaz ? » donne le numéro d'urgence gaz »).

Run: `npx tsc --noEmit`
Expected: aucune erreur.

- [ ] **Step 5: Vérifier dans le navigateur**

Lancer `npx expo start --web --port 8099` en arrière-plan. Ouvrir `http://localhost:8099/diagnostic/odeur-egout`, répondre « Je ne suis pas sûr » (carte en pointillé) : badge rouge, conseil, carte rouge « Odeur de gaz ? / Consignes et numéro d'urgence », bouton d'appel du 0800 47 33 33, **aucun** pro proposé, puis « Recommencer » (2e maquette de `8-renvois-schemas.html`). Arrêter le serveur Expo.

- [ ] **Step 6: Commit**

```bash
git add src/donnees/diagnostics src/donnees/diagnostics.data.test.ts
git commit -m "Ajoute les pannes douche qui s'écoule mal, odeur d'égout (question gaz en premier) et groupe de sécurité"
```

---

### Task 10: Lot E — électricité (pannes 19, 20, 21, 22) et contrôles finaux des données

**Files:**
- Create: `src/donnees/diagnostics/courant-une-piece.json`, `prise-hs.json`, `lumiere-hs.json`, `ampoule-clignote.json`
- Modify: `src/donnees/diagnostics/index.ts` (fichier entier)
- Modify: `src/donnees/diagnostics.data.test.ts` (`IDS_ATTENDUS` + comptes)
- Modify: `src/donnees/gestesEtTutos.data.test.ts` (tutos tous utilisés)

**Interfaces:**
- Consumes: tutos `reparer-disjoncteur`, `changer-ampoule` ; geste `couper-courant` ; renvoi vers le diagnostic `courant-une-piece`.
- Produces: ids `courant-une-piece`, `prise-hs`, `lumiere-hs`, `ampoule-clignote` — 22 pannes au total.

- [ ] **Step 1: Écrire les tests qui échouent**

Dans `src/donnees/diagnostics.data.test.ts`, remplacer le commentaire et `IDS_ATTENDUS` par :

```ts
// Les 22 pannes du chantier C (16 plomberie, 6 électricité).
const IDS_ATTENDUS = [
  'disjoncteur-saute', 'evier-bouche', 'fuite-eau', 'pas-eau-chaude', 'plus-de-courant', 'wc-bouche',
  'wc-lent-a-remplir', 'chasse-coule', 'chasse-ne-marche-plus', 'fuite-pied-wc',
  'robinet-dur', 'robinet-goutte', 'pression-faible', 'flexible-douche-fuit', 'bruit-tuyaux',
  'douche-ecoule-mal', 'odeur-egout', 'groupe-securite-goutte',
  'courant-une-piece', 'prise-hs', 'lumiere-hs', 'ampoule-clignote',
];
```

et ajouter dans le `describe` :

```ts
  it('compte 16 pannes de plomberie et 6 d\'électricité', () => {
    expect(diagnostics.filter((d) => d.categorie === 'plomberie')).toHaveLength(16);
    expect(diagnostics.filter((d) => d.categorie === 'electricite')).toHaveLength(6);
  });

  it('prise et lumière renvoient vers « Plus de courant dans une seule pièce »', () => {
    for (const id of ['prise-hs', 'lumiere-hs']) {
      const diag = diagnostics.find((d) => d.id === id)!;
      expect(diag.resultats.resultat_piece.renvoi).toEqual({ type: 'diagnostic', id: 'courant-une-piece' });
    }
  });
```

Dans `src/donnees/gestesEtTutos.data.test.ts`, ajouter dans le `describe` :

```ts
  it('chaque tuto est proposé par au moins un diagnostic', () => {
    const utilises = new Set(
      diagnostics.flatMap((d) => Object.values(d.resultats).map((r) => r.tutoId).filter(Boolean)),
    );
    expect(tutos.map((t) => t.id).filter((id) => !utilises.has(id))).toEqual([]);
  });
```

- [ ] **Step 2: Lancer les tests pour vérifier qu'ils échouent**

Run: `npx jest src/donnees`
Expected: FAIL — 4 ids manquants, 2 pannes d'électricité au lieu de 6, `prise-hs` introuvable, tuto `changer-ampoule` proposé par aucun diagnostic.

- [ ] **Step 3: Écrire les JSON et l'index**

`src/donnees/diagnostics/courant-une-piece.json` :

```json
{
  "id": "courant-une-piece",
  "titre": "Plus de courant dans une seule pièce",
  "categorie": "electricite",
  "icone": "door-open",
  "motsCles": ["pièce", "courant", "prises", "lumière", "coupure", "disjoncteur"],
  "etapeInitiale": "q1",
  "etapes": {
    "q1": {
      "question": "Dans le tableau électrique, un des petits disjoncteurs est-il en position basse ?",
      "reponses": [
        { "texte": "Oui", "suite": "resultat_rearmer" },
        { "texte": "Non, tous sont en haut", "suite": "resultat_pro" },
        { "texte": "Je ne sais pas lire le tableau", "suite": "resultat_pro", "inconnu": true }
      ]
    }
  },
  "resultats": {
    "resultat_rearmer": {
      "verdict": "vert",
      "titre": "Tu peux réparer ça toi-même",
      "conseil": "Réarme-le. S'il re-saute, débranche tout dans la pièce puis rebranche un par un pour trouver l'appareil fautif.",
      "tutoId": "reparer-disjoncteur"
    },
    "resultat_pro": {
      "verdict": "orange",
      "titre": "Sécurise en attendant un pro",
      "conseil": "Un fil peut s'être desserré. Ne démonte rien : appelle un électricien."
    }
  }
}
```

`src/donnees/diagnostics/prise-hs.json` :

```json
{
  "id": "prise-hs",
  "titre": "Prise qui ne marche plus",
  "categorie": "electricite",
  "icone": "plug",
  "motsCles": ["prise", "courant", "marche pas", "brûlé", "noir"],
  "etapeInitiale": "q1",
  "etapes": {
    "q1": {
      "question": "La prise est-elle noircie, chaude, ou sens-tu une odeur de brûlé ?",
      "reponses": [
        { "texte": "Oui", "suite": "resultat_danger" },
        { "texte": "Non", "suite": "q2" }
      ]
    },
    "q2": {
      "question": "Un autre appareil marche-t-il sur cette prise ?",
      "reponses": [
        { "texte": "Oui, c'est mon appareil qui est en panne", "suite": "resultat_appareil" },
        { "texte": "Non", "suite": "q3" }
      ]
    },
    "q3": {
      "question": "Les autres prises de la pièce marchent-elles ?",
      "reponses": [
        { "texte": "Non plus", "suite": "resultat_piece" },
        { "texte": "Oui, seulement celle-ci ne marche plus", "suite": "resultat_pro" }
      ]
    }
  },
  "resultats": {
    "resultat_danger": {
      "verdict": "rouge",
      "titre": "Appelle un pro tout de suite",
      "conseil": "N'utilise plus cette prise et ne la touche pas. Coupe son disjoncteur si tu sais lequel c'est, sinon le disjoncteur général. Appelle un électricien.",
      "gesteUrgenceId": "couper-courant"
    },
    "resultat_appareil": {
      "verdict": "vert",
      "titre": "Tu peux réparer ça toi-même",
      "conseil": "La prise va bien : c'est l'appareil (ou sa rallonge) qui est en panne."
    },
    "resultat_piece": {
      "verdict": "vert",
      "titre": "Tu peux réparer ça toi-même",
      "conseil": "Le problème touche toute la pièce : ça vient sûrement du tableau électrique, pas de la prise.",
      "renvoi": { "type": "diagnostic", "id": "courant-une-piece" }
    },
    "resultat_pro": {
      "verdict": "orange",
      "titre": "Sécurise en attendant un pro",
      "conseil": "Un fil est sûrement desserré derrière la prise. Ne la démonte pas : appelle un électricien."
    }
  }
}
```

`src/donnees/diagnostics/lumiere-hs.json` :

```json
{
  "id": "lumiere-hs",
  "titre": "Interrupteur ou lumière qui ne marche plus",
  "categorie": "electricite",
  "icone": "lightbulb-off",
  "motsCles": ["interrupteur", "lumière", "lampe", "plafonnier", "marche pas"],
  "etapeInitiale": "q1",
  "etapes": {
    "q1": {
      "question": "As-tu déjà essayé une ampoule neuve (qui marche ailleurs) ?",
      "reponses": [
        { "texte": "Non", "suite": "resultat_ampoule" },
        { "texte": "Oui, toujours rien", "suite": "q2" }
      ]
    },
    "q2": {
      "question": "Les autres lumières de la pièce marchent-elles ?",
      "reponses": [
        { "texte": "Non plus", "suite": "resultat_piece" },
        { "texte": "Oui", "suite": "resultat_pro" }
      ]
    }
  },
  "resultats": {
    "resultat_ampoule": {
      "verdict": "vert",
      "titre": "Tu peux réparer ça toi-même",
      "conseil": "Commence par changer l'ampoule, avec le disjoncteur de la pièce coupé.",
      "tutoId": "changer-ampoule"
    },
    "resultat_piece": {
      "verdict": "vert",
      "titre": "Tu peux réparer ça toi-même",
      "conseil": "Le problème touche toute la pièce : ça vient sûrement du tableau électrique, pas de l'interrupteur.",
      "renvoi": { "type": "diagnostic", "id": "courant-une-piece" }
    },
    "resultat_pro": {
      "verdict": "orange",
      "titre": "Sécurise en attendant un pro",
      "conseil": "L'interrupteur ou un fil est défectueux. Ne démonte rien : appelle un électricien."
    }
  }
}
```

`src/donnees/diagnostics/ampoule-clignote.json` :

```json
{
  "id": "ampoule-clignote",
  "titre": "Ampoule qui grille souvent ou lumière qui clignote",
  "categorie": "electricite",
  "icone": "lightbulb",
  "motsCles": ["ampoule", "grille", "clignote", "scintille", "lumière"],
  "etapeInitiale": "q1",
  "etapes": {
    "q1": {
      "question": "Le problème touche-t-il une seule lampe ?",
      "reponses": [
        { "texte": "Oui", "suite": "q2" },
        { "texte": "Non, plusieurs lumières clignotent en même temps", "suite": "resultat_pro_urgent" }
      ]
    },
    "q2": {
      "question": "L'ampoule est-elle bien vissée et adaptée (bonne puissance, LED « compatible variateur » si tu as un variateur) ?",
      "reponses": [
        { "texte": "Oui, j'en suis sûr", "suite": "resultat_pro" },
        { "texte": "Non, ou je ne suis pas sûr", "suite": "resultat_ampoule" }
      ]
    }
  },
  "resultats": {
    "resultat_ampoule": {
      "verdict": "vert",
      "titre": "Tu peux réparer ça toi-même",
      "conseil": "Revisse l'ampoule, lumière éteinte et disjoncteur de la pièce coupé, ou prends une ampoule adaptée (compatible variateur si besoin).",
      "tutoId": "changer-ampoule"
    },
    "resultat_pro": {
      "verdict": "orange",
      "titre": "Sécurise en attendant un pro",
      "conseil": "La douille ou l'interrupteur est peut-être abîmé (mauvais contact). Utilise cette lampe le moins possible et fais-la vérifier par un électricien."
    },
    "resultat_pro_urgent": {
      "verdict": "rouge",
      "titre": "Appelle un pro tout de suite",
      "conseil": "Plusieurs lumières qui clignotent ensemble peuvent signaler un problème sur l'installation ou le branchement. Débranche les appareils sensibles et appelle un électricien."
    }
  }
}
```

Remplacer **tout** `src/donnees/diagnostics/index.ts` par :

```ts
import type { Diagnostic } from '@/domaine/types';
import fuiteEau from './fuite-eau.json';
import wcBouche from './wc-bouche.json';
import evierBouche from './evier-bouche.json';
import pasEauChaude from './pas-eau-chaude.json';
import wcLentARemplir from './wc-lent-a-remplir.json';
import chasseCoule from './chasse-coule.json';
import chasseNeMarchePlus from './chasse-ne-marche-plus.json';
import robinetDur from './robinet-dur.json';
import robinetGoutte from './robinet-goutte.json';
import pressionFaible from './pression-faible.json';
import doucheEcouleMal from './douche-ecoule-mal.json';
import odeurEgout from './odeur-egout.json';
import groupeSecuriteGoutte from './groupe-securite-goutte.json';
import fuitePiedWc from './fuite-pied-wc.json';
import flexibleDoucheFuit from './flexible-douche-fuit.json';
import bruitTuyaux from './bruit-tuyaux.json';
import disjoncteurSaute from './disjoncteur-saute.json';
import plusDeCourant from './plus-de-courant.json';
import courantUnePiece from './courant-une-piece.json';
import priseHs from './prise-hs.json';
import lumiereHs from './lumiere-hs.json';
import ampouleClignote from './ampoule-clignote.json';

// Ordre d'affichage = numéro de la panne dans docs/contenu/pannes-v2.md.
export const diagnostics: Diagnostic[] = [
  fuiteEau as Diagnostic,
  wcBouche as Diagnostic,
  evierBouche as Diagnostic,
  pasEauChaude as Diagnostic,
  wcLentARemplir as Diagnostic,
  chasseCoule as Diagnostic,
  chasseNeMarchePlus as Diagnostic,
  robinetDur as Diagnostic,
  robinetGoutte as Diagnostic,
  pressionFaible as Diagnostic,
  doucheEcouleMal as Diagnostic,
  odeurEgout as Diagnostic,
  groupeSecuriteGoutte as Diagnostic,
  fuitePiedWc as Diagnostic,
  flexibleDoucheFuit as Diagnostic,
  bruitTuyaux as Diagnostic,
  disjoncteurSaute as Diagnostic,
  plusDeCourant as Diagnostic,
  courantUnePiece as Diagnostic,
  priseHs as Diagnostic,
  lumiereHs as Diagnostic,
  ampouleClignote as Diagnostic,
];
```

- [ ] **Step 4: Lancer les tests et le typage**

Run: `npx jest`
Expected: PASS (22 arbres valides, renvois existants, 16 tutos tous utilisés, 16 / 6).

Run: `npx tsc --noEmit`
Expected: aucune erreur.

- [ ] **Step 5: Vérifier dans le navigateur**

Lancer `npx expo start --web --port 8099` en arrière-plan.
1. `http://localhost:8099/diagnostic` : onglet Plomberie = 16 pannes (la liste défile jusqu'à « Bruit ou coups dans les tuyaux »), onglet Électricité = 6 ; taper « chasse » dans la recherche affiche « Chasse d'eau qui coule en continu », « Chasse d'eau qui ne se déclenche plus », « WC bouché » et « WC lent à se remplir » (mots-clés).
2. `http://localhost:8099/diagnostic/prise-hs` : « Non » → « Non » → « Non plus » : badge vert, conseil « …pas de la prise. », carte bleue « Plus de courant dans une seule pièce / Continuer avec ce diagnostic » à bordure bleue (1re maquette de `8-renvois-schemas.html`). Appuyer : le diagnostic « Plus de courant dans une seule pièce » s'ouvre à « Question 1 ». La croix ramène au résultat précédent.
3. Refaire 2 en thème clair (Réglages → Clair) : carte et bordure lisibles.
Arrêter le serveur Expo.

- [ ] **Step 6: Commit**

```bash
git add src/donnees/diagnostics src/donnees/diagnostics.data.test.ts src/donnees/gestesEtTutos.data.test.ts
git commit -m "Ajoute les pannes d'électricité : une pièce sans courant, prise, lumière, ampoule qui clignote (22 pannes)"
```

---

### Task 11: Documentation et vérification finale

**Files:**
- Modify: `docs/superpowers/specs/2026-09-30-depannmaison-v2-design.md` (§6, §8, §9)
- Modify: `CLAUDE.md` (section « Fonctionnalités »)
- Modify: `docs/contenu/pannes-v2.md` (note en tête)

**Interfaces:**
- Consumes: tout ce qui précède.
- Produces: documentation à jour.

- [ ] **Step 1: Mettre à jour la spec**

Dans `docs/superpowers/specs/2026-09-30-depannmaison-v2-design.md`, §6, remplacer la ligne :

```markdown
- `Resultat` : inchangé (verdict, titre, conseil, tutoId, gesteUrgenceId, numeroUtile). Le métier des pros proposés est déduit de `categorie`.
```

par :

```markdown
- `Resultat` : verdict, titre, conseil, tutoId, gesteUrgenceId, numeroUtile, et (chantier C) `renvoi?: { type: 'diagnostic' | 'urgence'; id }` : bouton qui ouvre un autre diagnostic (depuis la 1re question) ou un geste de l'onglet Urgences. Le métier des pros proposés est déduit de `categorie`.
```

et remplacer la ligne :

```markdown
- `Tuto` : ajoute `categorie`, `icone`, `duree` (ex. « 5 min »), `outil` (ex. « ventouse »).
```

par :

```markdown
- `Tuto` : ajoute `categorie`, `icone`, `duree` (ex. « 5 min »), `outil` (ex. « ventouse »). Chantier C : une étape est un texte ou `{ texte, schema }`, où `schema` est le nom d'un schéma animé (`siphon`, `disjoncteur` pour l'instant).
```

À la fin du §8, ajouter :

```markdown
**Réalisé au chantier C (01/10)** : les 22 pannes et 16 tutos sont dans `src/donnees/` (le brouillon reste la trace de relecture ; André relit dans l'appli et les corrections se font dans les données). Ajouts validés par la maquette `8-renvois-schemas.html` :
- **Renvois** : un résultat peut afficher une carte « Continuer avec ce diagnostic » (bleue, `stethoscope`) ou « Odeur de gaz ? — Consignes et numéro d'urgence » (rouge, `flame`). Utilisés par les pannes 4 (chaudière → gaz), 7 (réservoir vide → WC lent à se remplir), 12 (gaz), 20 et 21 (toute la pièce → Plus de courant dans une seule pièce). Sur un verdict rouge avec renvoi vers Urgences, aucun pro n'est proposé.
- **Schémas animés** : petits dessins en boucle sous certaines étapes de tuto (siphon qui se remplit, disjoncteur qui remonte), dessinés avec `react-native-svg` et les couleurs du thème, figés si le téléphone demande de réduire les animations. D'autres schémas pourront être ajoutés sur le même modèle (`src/ui/schemas/`).
```

Au §9, remplacer la première puce par :

```markdown
- Tests unitaires (Jest) sur la logique pure : validation des données (dont icônes, catégories, renvois vers des cibles existantes, règles gaz, réponses « Je ne sais pas »), historique du diagnostic (précédente / recommencer / progression), réglages (lecture/écriture avec valeurs par défaut), parsing de la réponse Overpass, distance, fraîcheur du cache, filtre de recherche des pannes, calculs des schémas animés.
```

- [ ] **Step 2: Mettre à jour CLAUDE.md**

Dans `CLAUDE.md`, section « Fonctionnalités », remplacer les lignes :

```markdown
- **Diagnostic guidé** (22 pannes : 16 plomberie, 6 électricité) → verdict 🟢 je peux réparer / 🟠 je sécurise en attendant / 🔴 j'appelle un pro tout de suite.
```

et

```markdown
- **Tutos** pas à pas pour les réparations faciles.
```

par (respectivement) :

```markdown
- **Diagnostic guidé** (22 pannes : 16 plomberie, 6 électricité) → verdict 🟢 je peux réparer / 🟠 je sécurise en attendant / 🔴 j'appelle un pro tout de suite. Un résultat peut renvoyer vers un autre diagnostic ou vers « Odeur de gaz ? » (champ `renvoi`).
```

```markdown
- **Tutos** pas à pas pour les réparations faciles (16), certains avec un petit schéma animé (`src/ui/schemas/`).
```

- [ ] **Step 3: Noter la conversion dans le brouillon**

Dans `docs/contenu/pannes-v2.md`, juste sous le titre `# Contenu des 22 pannes — brouillon à relire par André`, ajouter :

```markdown
> **Converti en données le 01/10 (chantier C)** : `src/donnees/diagnostics/*.json` et `src/donnees/tutos.ts` font désormais foi. André relit dans l'appli ; les corrections se font dans ces fichiers.
```

- [ ] **Step 4: Vérification complète**

Run: `npx jest`
Expected: PASS, 0 échec.

Run: `rm -f .expo/types/router.d.ts && timeout 60 npx expo start --web --port 8099`
Expected: le serveur démarre puis s'arrête au bout de 60 s ; `.expo/types/router.d.ts` est régénéré.

Run: `npx tsc --noEmit`
Expected: aucune erreur.

Vérifier qu'aucun processus Expo ne tourne encore (sinon l'arrêter).

- [ ] **Step 5: Commit**

```bash
git add docs/superpowers/specs/2026-09-30-depannmaison-v2-design.md CLAUDE.md docs/contenu/pannes-v2.md
git commit -m "Met à jour la spec, CLAUDE.md et le brouillon : 22 pannes, renvois et schémas animés"
```

---

## Hors périmètre (à signaler à André, pas à coder)

- **En-tête du résultat** : la maquette 8 montre le titre de la panne en haut du résultat, l'appli affiche « Résultat » (maquette 2). Inchangé ici.
- **Arbres à relire** (conversion fidèle au brouillon, à trancher par André dans l'appli) : dans les pannes 2 (Q2), 3 (Q2) et 5 (Q1), « Je ne sais pas » mène à un verdict vert alors qu'une réponse sœur mène à de l'orange ; panne 11 : pas de réponse pour « plus du tout, mais seulement la douche » ; pannes 8, 15, 16 et 20 (Q1) n'ont pas de « Je ne sais pas » ; panne 18 « S'il re-saute, fais le diagnostic Disjoncteur qui saute » pourrait devenir un renvoi.
- **Nouveaux schémas** : seulement `siphon` et `disjoncteur` ; André en ajoutera d'autres plus tard (même modèle : nom dans `NOMS_SCHEMAS`, calculs dans `animation.ts`, dessin dans `src/ui/schemas/`).
