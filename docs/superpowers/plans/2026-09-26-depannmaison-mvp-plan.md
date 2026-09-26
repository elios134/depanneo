# Dépann'Maison V1 (MVP) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construire la V1 mobile de Dépann'Maison : 8 diagnostics guidés, 3 gestes d'urgence, 4 mini-tutos, fonctionnant entièrement hors-ligne.

**Architecture:** Expo Router pour la navigation par fichiers, données de diagnostic en JSON typé TypeScript embarqué (pas de backend), état du diagnostic en cours géré localement dans l'écran concerné (pas de state manager global).

**Tech Stack:** React Native + Expo, TypeScript, Expo Router, Jest (`jest-expo`) pour les tests de logique de données.

**Spec:** [docs/superpowers/specs/2026-09-26-depannmaison-mvp-design.md](../specs/2026-09-26-depannmaison-mvp-design.md)

## Global Constraints

- Tout est en français : code UI-facing (textes affichés), messages de commit, noms de fichiers de données.
- Tout diagnostic dont la cause implique le gaz aboutit à un verdict `rouge` avec `numeroUtile` rempli — jamais `vert` ni `orange` sur une piste gaz.
- Aucun contenu (résultat, tuto, geste) n'incite à ouvrir un tableau électrique, intervenir sur une installation gaz, ou travailler en hauteur — toujours renvoyer vers un professionnel dans ces cas.
- Aucun appel réseau : toutes les données (diagnostics, gestes d'urgence, tutos) sont des fichiers TS/JSON embarqués dans l'app.
- Un avertissement fixe doit être visible sur l'écran d'accueil : l'appli donne des conseils, elle ne remplace pas un professionnel.

---

## File Structure

```
app/
  _layout.tsx                 # Stack navigator racine, titres en français
  index.tsx                   # Accueil : gestes d'urgence + entrée diagnostic + avertissement
  diagnostics/
    index.tsx                 # Liste des 8 diagnostics
    [id].tsx                  # Écran diagnostic : question -> question -> résultat
  urgences/
    [id].tsx                  # Écran geste d'urgence (étapes)
  tutos/
    [id].tsx                  # Écran mini-tuto (étapes)

lib/
  types.ts                    # Interfaces TS : Diagnostic, Etape, Reponse, Resultat, Verdict, GesteUrgence, Tuto
  diagnosticEngine.ts          # Fonctions pures : getEtape, getResultat, estResultat
  validateDiagnostic.ts        # Validation d'un arbre (branches orphelines, cohérence)

data/
  diagnostics/
    fuite-eau.json
    wc-bouche.json
    evier-bouche.json
    pas-eau-chaude.json
    disjoncteur-saute.json
    plus-de-courant.json
    odeur-gaz.json
    chaudiere-en-panne.json
    index.ts                  # Importe et type les 8 JSON, exporte `diagnostics: Diagnostic[]`
  gestesUrgence.ts            # 3 gestes d'urgence (eau, courant, gaz)
  tutos.ts                    # 4 mini-tutos

components/
  VerdictBadge.tsx             # Badge visuel 🟢/🟠/🔴 + libellé
  EtapesList.tsx                # Liste numérotée d'étapes (réutilisée par urgences et tutos)

__tests__/
  diagnosticEngine.test.ts
  validateDiagnostic.test.ts
  diagnostics.data.test.ts     # Valide les 8 fichiers JSON réels (pas de branche orpheline, gaz -> rouge)
```

---

### Task 1: Bootstrap du projet Expo + TypeScript + Jest

**Files:**
- Create: projet Expo complet (généré par la commande ci-dessous)
- Modify: `package.json` (config Jest)
- Test: `__tests__/sanity.test.ts`

**Interfaces:**
- Consumes: rien (premier task)
- Produces: structure de projet Expo Router fonctionnelle, commande `npm test` opérationnelle

- [ ] **Step 1: Générer le projet Expo avec le template TypeScript + Expo Router**

```bash
cd "C:/Users/andre/Documents/ZenHome"
npx create-expo-app@latest . --template tabs
```

Quand l'outil demande d'écraser le dossier existant (CLAUDE.md, docs/), répondre non à l'écrasement des fichiers en conflit — seuls les fichiers de template Expo doivent être ajoutés, `CLAUDE.md` et `docs/` doivent rester intacts.

- [ ] **Step 2: Nettoyer le template par défaut**

Supprimer les écrans d'exemple générés par le template (`app/(tabs)/`, composants d'exemple `HelloWave`, `ParallaxScrollView`, etc. non utilisés par ce projet) pour repartir sur une structure `app/` propre correspondant à la section File Structure ci-dessus.

- [ ] **Step 3: Installer Jest pour Expo**

```bash
npx expo install jest-expo jest @types/jest --dev
```

- [ ] **Step 4: Configurer Jest dans `package.json`**

Ajouter dans `package.json` :

```json
{
  "scripts": {
    "test": "jest"
  },
  "jest": {
    "preset": "jest-expo"
  }
}
```

- [ ] **Step 5: Écrire un test de sanity**

```typescript
// __tests__/sanity.test.ts
describe('sanity', () => {
  it('confirme que Jest fonctionne', () => {
    expect(1 + 1).toBe(2);
  });
});
```

- [ ] **Step 6: Lancer le test et vérifier qu'il passe**

Run: `npm test`
Expected: PASS (1 test)

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "Initialise le projet Expo avec TypeScript et Jest"
```

---

### Task 2: Types et moteur de diagnostic

**Files:**
- Create: `lib/types.ts`
- Create: `lib/diagnosticEngine.ts`
- Create: `lib/validateDiagnostic.ts`
- Test: `__tests__/diagnosticEngine.test.ts`
- Test: `__tests__/validateDiagnostic.test.ts`

**Interfaces:**
- Consumes: rien
- Produces:
  - `Verdict = 'vert' | 'orange' | 'rouge'`
  - `interface Reponse { texte: string; suite: string }`
  - `interface Etape { question: string; reponses: Reponse[] }`
  - `interface Resultat { verdict: Verdict; titre: string; conseil: string; tutoId?: string; gesteUrgenceId?: string; numeroUtile?: string }`
  - `interface Diagnostic { id: string; titre: string; icone: string; etapeInitiale: string; etapes: Record<string, Etape>; resultats: Record<string, Resultat> }`
  - `estResultat(diag: Diagnostic, id: string): boolean`
  - `getEtape(diag: Diagnostic, id: string): Etape` (jette une erreur si absent)
  - `getResultat(diag: Diagnostic, id: string): Resultat` (jette une erreur si absent)
  - `validerDiagnostic(diag: Diagnostic): string[]` (liste d'erreurs, vide si arbre valide)

- [ ] **Step 1: Écrire les types**

```typescript
// lib/types.ts
export type Verdict = 'vert' | 'orange' | 'rouge';

export interface Reponse {
  texte: string;
  suite: string;
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
  icone: string;
  etapeInitiale: string;
  etapes: Record<string, Etape>;
  resultats: Record<string, Resultat>;
}

export interface GesteUrgence {
  id: string;
  titre: string;
  etapes: string[];
}

export interface Tuto {
  id: string;
  titre: string;
  etapes: string[];
}
```

- [ ] **Step 2: Écrire les tests du moteur de diagnostic (failing)**

```typescript
// __tests__/diagnosticEngine.test.ts
import { estResultat, getEtape, getResultat } from '../lib/diagnosticEngine';
import type { Diagnostic } from '../lib/types';

const diagTest: Diagnostic = {
  id: 'test',
  titre: 'Test',
  icone: '🔧',
  etapeInitiale: 'q1',
  etapes: {
    q1: {
      question: 'Ça fuit où ?',
      reponses: [{ texte: 'Ici', suite: 'r1' }],
    },
  },
  resultats: {
    r1: { verdict: 'vert', titre: 'OK', conseil: 'Répare ça toi-même.' },
  },
};

describe('diagnosticEngine', () => {
  it('reconnaît un id de résultat', () => {
    expect(estResultat(diagTest, 'r1')).toBe(true);
    expect(estResultat(diagTest, 'q1')).toBe(false);
  });

  it('récupère une étape existante', () => {
    expect(getEtape(diagTest, 'q1').question).toBe('Ça fuit où ?');
  });

  it('jette une erreur si l\'étape n\'existe pas', () => {
    expect(() => getEtape(diagTest, 'inconnue')).toThrow();
  });

  it('récupère un résultat existant', () => {
    expect(getResultat(diagTest, 'r1').verdict).toBe('vert');
  });

  it('jette une erreur si le résultat n\'existe pas', () => {
    expect(() => getResultat(diagTest, 'inconnu')).toThrow();
  });
});
```

- [ ] **Step 3: Lancer les tests et vérifier qu'ils échouent**

Run: `npm test -- diagnosticEngine`
Expected: FAIL (module `../lib/diagnosticEngine` introuvable)

- [ ] **Step 4: Implémenter le moteur de diagnostic**

```typescript
// lib/diagnosticEngine.ts
import type { Diagnostic, Etape, Resultat } from './types';

export function estResultat(diag: Diagnostic, id: string): boolean {
  return id in diag.resultats;
}

export function getEtape(diag: Diagnostic, id: string): Etape {
  const etape = diag.etapes[id];
  if (!etape) {
    throw new Error(`Étape inconnue: ${id}`);
  }
  return etape;
}

export function getResultat(diag: Diagnostic, id: string): Resultat {
  const resultat = diag.resultats[id];
  if (!resultat) {
    throw new Error(`Résultat inconnu: ${id}`);
  }
  return resultat;
}
```

- [ ] **Step 5: Lancer les tests et vérifier qu'ils passent**

Run: `npm test -- diagnosticEngine`
Expected: PASS (5 tests)

- [ ] **Step 6: Écrire les tests de validation (failing)**

```typescript
// __tests__/validateDiagnostic.test.ts
import { validerDiagnostic } from '../lib/validateDiagnostic';
import type { Diagnostic } from '../lib/types';

describe('validerDiagnostic', () => {
  it('ne trouve aucune erreur sur un arbre valide', () => {
    const diag: Diagnostic = {
      id: 'test',
      titre: 'Test',
      icone: '🔧',
      etapeInitiale: 'q1',
      etapes: { q1: { question: 'Q1', reponses: [{ texte: 'A', suite: 'r1' }] } },
      resultats: { r1: { verdict: 'vert', titre: 'OK', conseil: 'ok' } },
    };
    expect(validerDiagnostic(diag)).toEqual([]);
  });

  it('détecte une étape initiale manquante', () => {
    const diag: Diagnostic = {
      id: 'test',
      titre: 'Test',
      icone: '🔧',
      etapeInitiale: 'introuvable',
      etapes: {},
      resultats: {},
    };
    const erreurs = validerDiagnostic(diag);
    expect(erreurs.length).toBeGreaterThan(0);
  });

  it('détecte une branche orpheline (suite vers un id inexistant)', () => {
    const diag: Diagnostic = {
      id: 'test',
      titre: 'Test',
      icone: '🔧',
      etapeInitiale: 'q1',
      etapes: { q1: { question: 'Q1', reponses: [{ texte: 'A', suite: 'nulle_part' }] } },
      resultats: {},
    };
    const erreurs = validerDiagnostic(diag);
    expect(erreurs.length).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 7: Lancer les tests et vérifier qu'ils échouent**

Run: `npm test -- validateDiagnostic`
Expected: FAIL (module `../lib/validateDiagnostic` introuvable)

- [ ] **Step 8: Implémenter la validation**

```typescript
// lib/validateDiagnostic.ts
import type { Diagnostic } from './types';

export function validerDiagnostic(diag: Diagnostic): string[] {
  const erreurs: string[] = [];

  if (!diag.etapes[diag.etapeInitiale]) {
    erreurs.push(`etapeInitiale "${diag.etapeInitiale}" introuvable dans "${diag.id}"`);
  }

  for (const [etapeId, etape] of Object.entries(diag.etapes)) {
    for (const reponse of etape.reponses) {
      const cible = reponse.suite;
      const cibleExiste = Boolean(diag.etapes[cible]) || Boolean(diag.resultats[cible]);
      if (!cibleExiste) {
        erreurs.push(
          `Diagnostic "${diag.id}", étape "${etapeId}": la réponse "${reponse.texte}" pointe vers "${cible}" qui n'existe pas`
        );
      }
    }
  }

  return erreurs;
}
```

- [ ] **Step 9: Lancer les tests et vérifier qu'ils passent**

Run: `npm test -- validateDiagnostic`
Expected: PASS (3 tests)

- [ ] **Step 10: Commit**

```bash
git add lib/types.ts lib/diagnosticEngine.ts lib/validateDiagnostic.ts __tests__/diagnosticEngine.test.ts __tests__/validateDiagnostic.test.ts
git commit -m "Ajoute les types et le moteur de diagnostic"
```

---

### Task 3: Données des 8 diagnostics

**Files:**
- Create: `data/diagnostics/fuite-eau.json`
- Create: `data/diagnostics/wc-bouche.json`
- Create: `data/diagnostics/evier-bouche.json`
- Create: `data/diagnostics/pas-eau-chaude.json`
- Create: `data/diagnostics/disjoncteur-saute.json`
- Create: `data/diagnostics/plus-de-courant.json`
- Create: `data/diagnostics/odeur-gaz.json`
- Create: `data/diagnostics/chaudiere-en-panne.json`
- Create: `data/diagnostics/index.ts`
- Test: `__tests__/diagnostics.data.test.ts`

**Interfaces:**
- Consumes: `Diagnostic` (Task 2, `lib/types.ts`), `validerDiagnostic` (Task 2, `lib/validateDiagnostic.ts`)
- Produces: `diagnostics: Diagnostic[]` exporté depuis `data/diagnostics/index.ts`, utilisé par les écrans (Tasks 7, 8)

- [ ] **Step 1: Créer les 8 fichiers JSON de diagnostic**

```json
// data/diagnostics/fuite-eau.json
{
  "id": "fuite-eau",
  "titre": "Fuite d'eau",
  "icone": "💧",
  "etapeInitiale": "q1",
  "etapes": {
    "q1": {
      "question": "D'où vient la fuite ?",
      "reponses": [
        { "texte": "Sous l'évier ou le lavabo", "suite": "q2" },
        { "texte": "Du compteur d'eau", "suite": "resultat_compteur" },
        { "texte": "Du plafond ou d'en haut", "suite": "resultat_plafond" }
      ]
    },
    "q2": {
      "question": "Le tuyau est-il percé, ou juste un raccord qui goutte ?",
      "reponses": [
        { "texte": "Juste un raccord qui goutte", "suite": "resultat_raccord" },
        { "texte": "Tuyau percé ou cassé", "suite": "resultat_perce" }
      ]
    }
  },
  "resultats": {
    "resultat_raccord": {
      "verdict": "vert",
      "titre": "Tu peux réparer ça toi-même",
      "conseil": "Resserre le raccord ou change le joint.",
      "tutoId": "changer-joint"
    },
    "resultat_perce": {
      "verdict": "orange",
      "titre": "Sécurise en attendant un pro",
      "conseil": "Coupe l'eau au compteur, un pro doit intervenir pour remplacer le tuyau.",
      "gesteUrgenceId": "couper-eau"
    },
    "resultat_compteur": {
      "verdict": "orange",
      "titre": "Sécurise en attendant un pro",
      "conseil": "Une fuite au compteur peut venir du joint ou du compteur lui-même. Coupe l'eau si tu peux, et contacte ton fournisseur d'eau.",
      "gesteUrgenceId": "couper-eau"
    },
    "resultat_plafond": {
      "verdict": "rouge",
      "titre": "Appelle un pro tout de suite",
      "conseil": "Une fuite venant du plafond peut avoir plusieurs origines et présente un risque de dégât des eaux ou électrique. Coupe l'eau si tu peux localiser l'arrivée concernée.",
      "gesteUrgenceId": "couper-eau"
    }
  }
}
```

```json
// data/diagnostics/wc-bouche.json
{
  "id": "wc-bouche",
  "titre": "WC bouché",
  "icone": "🚽",
  "etapeInitiale": "q1",
  "etapes": {
    "q1": {
      "question": "Depuis quand les WC sont bouchés ?",
      "reponses": [
        { "texte": "Ça vient d'arriver", "suite": "resultat_ventouse" },
        { "texte": "Depuis plusieurs jours, l'eau remonte lentement", "suite": "resultat_persistant" }
      ]
    }
  },
  "resultats": {
    "resultat_ventouse": {
      "verdict": "vert",
      "titre": "Tu peux réparer ça toi-même",
      "conseil": "Une ventouse ou un furet suffit dans la plupart des cas.",
      "tutoId": "deboucher-wc"
    },
    "resultat_persistant": {
      "verdict": "orange",
      "titre": "Essaie de déboucher, sinon appelle un pro",
      "conseil": "Si la ventouse et le furet ne suffisent pas, le bouchon est probablement plus loin dans la canalisation. Un plombier pourra intervenir avec un matériel adapté.",
      "tutoId": "deboucher-wc"
    }
  }
}
```

```json
// data/diagnostics/evier-bouche.json
{
  "id": "evier-bouche",
  "titre": "Évier ou lavabo bouché",
  "icone": "🚰",
  "etapeInitiale": "q1",
  "etapes": {
    "q1": {
      "question": "L'eau s'écoule-t-elle un peu, ou plus du tout ?",
      "reponses": [
        { "texte": "Elle s'écoule lentement", "suite": "resultat_deboucher" },
        { "texte": "Elle ne s'écoule plus du tout, et d'autres éviers sont touchés", "suite": "resultat_canalisation" }
      ]
    }
  },
  "resultats": {
    "resultat_deboucher": {
      "verdict": "vert",
      "titre": "Tu peux réparer ça toi-même",
      "conseil": "Un furet ou un produit déboucheur adapté suffit généralement.",
      "tutoId": "deboucher-evier"
    },
    "resultat_canalisation": {
      "verdict": "orange",
      "titre": "Fais appel à un pro",
      "conseil": "Le bouchon est probablement profond dans une canalisation commune. Un plombier sera plus efficace.",
      "tutoId": "deboucher-evier"
    }
  }
}
```

```json
// data/diagnostics/pas-eau-chaude.json
{
  "id": "pas-eau-chaude",
  "titre": "Pas d'eau chaude",
  "icone": "🚿",
  "etapeInitiale": "q1",
  "etapes": {
    "q1": {
      "question": "As-tu un chauffe-eau électrique ou une chaudière ?",
      "reponses": [
        { "texte": "Chauffe-eau électrique", "suite": "q2" },
        { "texte": "Chaudière", "suite": "resultat_chaudiere" }
      ]
    },
    "q2": {
      "question": "Le disjoncteur du chauffe-eau a-t-il sauté ?",
      "reponses": [
        { "texte": "Oui, il est en position basse", "suite": "resultat_rearmer" },
        { "texte": "Non, tout est allumé mais toujours pas d'eau chaude", "suite": "resultat_panne" }
      ]
    }
  },
  "resultats": {
    "resultat_rearmer": {
      "verdict": "vert",
      "titre": "Tu peux réparer ça toi-même",
      "conseil": "Réarme le disjoncteur du chauffe-eau et attends quelques heures que l'eau chauffe.",
      "tutoId": "reparer-disjoncteur"
    },
    "resultat_panne": {
      "verdict": "rouge",
      "titre": "Appelle un pro tout de suite",
      "conseil": "Le chauffe-eau est probablement en panne (résistance ou thermostat). N'ouvre pas le chauffe-eau toi-même, fais appel à un pro."
    },
    "resultat_chaudiere": {
      "verdict": "orange",
      "titre": "Vérifie, sinon appelle un chauffagiste",
      "conseil": "Vérifie que la chaudière est bien alimentée, allumée, et qu'aucun voyant d'erreur n'est affiché. Si le problème persiste, appelle un chauffagiste."
    }
  }
}
```

```json
// data/diagnostics/disjoncteur-saute.json
{
  "id": "disjoncteur-saute",
  "titre": "Disjoncteur qui saute",
  "icone": "⚡",
  "etapeInitiale": "q1",
  "etapes": {
    "q1": {
      "question": "Quand tu réarmes le disjoncteur, re-saute-t-il tout de suite ?",
      "reponses": [
        { "texte": "Non, il tient", "suite": "resultat_reussi" },
        { "texte": "Oui, il re-saute immédiatement", "suite": "resultat_court_circuit" }
      ]
    }
  },
  "resultats": {
    "resultat_reussi": {
      "verdict": "vert",
      "titre": "Tu peux réparer ça toi-même",
      "conseil": "Le disjoncteur a probablement sauté suite à une surcharge ponctuelle. Réarme-le simplement.",
      "tutoId": "reparer-disjoncteur"
    },
    "resultat_court_circuit": {
      "verdict": "rouge",
      "titre": "Appelle un pro tout de suite",
      "conseil": "Un disjoncteur qui re-saute immédiatement signale probablement un court-circuit. N'essaie pas de le réarmer plusieurs fois, et ne touche pas au tableau électrique. Appelle un électricien."
    }
  }
}
```

```json
// data/diagnostics/plus-de-courant.json
{
  "id": "plus-de-courant",
  "titre": "Plus de courant du tout",
  "icone": "🔌",
  "etapeInitiale": "q1",
  "etapes": {
    "q1": {
      "question": "Tes voisins ont-ils aussi une coupure de courant ?",
      "reponses": [
        { "texte": "Oui, c'est coupé chez eux aussi", "suite": "resultat_coupure_generale" },
        { "texte": "Non, juste chez moi", "suite": "q2" }
      ]
    },
    "q2": {
      "question": "Le disjoncteur général est-il en position basse (coupé) ?",
      "reponses": [
        { "texte": "Oui", "suite": "resultat_reenclencher" },
        { "texte": "Non, il est en position haute mais toujours pas de courant", "suite": "resultat_panne_grave" }
      ]
    }
  },
  "resultats": {
    "resultat_coupure_generale": {
      "verdict": "orange",
      "titre": "Attends ou contacte ton fournisseur",
      "conseil": "C'est une coupure générale du réseau. Attends le rétablissement ou contacte ton fournisseur d'électricité."
    },
    "resultat_reenclencher": {
      "verdict": "vert",
      "titre": "Tu peux réparer ça toi-même",
      "conseil": "Remets le disjoncteur général en position haute.",
      "tutoId": "reparer-disjoncteur"
    },
    "resultat_panne_grave": {
      "verdict": "rouge",
      "titre": "Appelle un pro tout de suite",
      "conseil": "Une absence de courant sans disjoncteur coupé est anormale. N'ouvre pas le tableau électrique, appelle un électricien."
    }
  }
}
```

```json
// data/diagnostics/odeur-gaz.json
{
  "id": "odeur-gaz",
  "titre": "Odeur de gaz",
  "icone": "🔥",
  "etapeInitiale": "q1",
  "etapes": {
    "q1": {
      "question": "As-tu déjà ouvert les fenêtres et coupé l'arrivée de gaz si tu peux le faire sans risque ?",
      "reponses": [
        { "texte": "Oui", "suite": "resultat_gaz" },
        { "texte": "Non, pas encore", "suite": "resultat_gaz" }
      ]
    }
  },
  "resultats": {
    "resultat_gaz": {
      "verdict": "rouge",
      "titre": "Appelle un pro tout de suite",
      "conseil": "Ne touche à rien d'électrique (pas d'interrupteur, pas de sonnette), aère si tu peux le faire sans risque, sors du logement et appelle le numéro d'urgence gaz.",
      "gesteUrgenceId": "couper-gaz",
      "numeroUtile": "0800 47 33 33"
    }
  }
}
```

```json
// data/diagnostics/chaudiere-en-panne.json
{
  "id": "chaudiere-en-panne",
  "titre": "Chaudière en panne",
  "icone": "🌡️",
  "etapeInitiale": "q1",
  "etapes": {
    "q1": {
      "question": "Un voyant d'erreur est-il allumé sur la chaudière ?",
      "reponses": [
        { "texte": "Oui", "suite": "resultat_voyant" },
        { "texte": "Non, rien ne s'allume du tout", "suite": "resultat_alimentation" }
      ]
    }
  },
  "resultats": {
    "resultat_voyant": {
      "verdict": "orange",
      "titre": "Note le code, appelle un chauffagiste",
      "conseil": "Note le code d'erreur affiché, ne redémarre pas la chaudière plusieurs fois, et appelle un chauffagiste en lui donnant ce code."
    },
    "resultat_alimentation": {
      "verdict": "orange",
      "titre": "Vérifie, sinon appelle un chauffagiste",
      "conseil": "Vérifie que la chaudière est bien alimentée électriquement et que la pression d'eau est correcte. Si rien ne change, appelle un chauffagiste."
    }
  }
}
```

- [ ] **Step 2: Écrire le test de validation des données réelles (failing)**

```typescript
// __tests__/diagnostics.data.test.ts
import { validerDiagnostic } from '../lib/validateDiagnostic';
import { diagnostics } from '../data/diagnostics';

describe('données de diagnostics', () => {
  it('contient exactement 8 diagnostics', () => {
    expect(diagnostics.length).toBe(8);
  });

  it.each(diagnostics.map((d) => [d.id, d] as const))(
    'le diagnostic "%s" ne contient aucune branche orpheline',
    (_id, diag) => {
      expect(validerDiagnostic(diag)).toEqual([]);
    }
  );

  it('le diagnostic "odeur-gaz" aboutit toujours à un verdict rouge', () => {
    const diagGaz = diagnostics.find((d) => d.id === 'odeur-gaz');
    expect(diagGaz).toBeDefined();
    const verdicts = Object.values(diagGaz!.resultats).map((r) => r.verdict);
    expect(verdicts.every((v) => v === 'rouge')).toBe(true);
    const numeros = Object.values(diagGaz!.resultats).map((r) => r.numeroUtile);
    expect(numeros.every((n) => Boolean(n))).toBe(true);
  });
});
```

- [ ] **Step 3: Lancer le test et vérifier qu'il échoue**

Run: `npm test -- diagnostics.data`
Expected: FAIL (module `../data/diagnostics` introuvable)

- [ ] **Step 4: Créer l'index qui type et exporte les diagnostics**

```typescript
// data/diagnostics/index.ts
import type { Diagnostic } from '../../lib/types';
import fuiteEau from './fuite-eau.json';
import wcBouche from './wc-bouche.json';
import evierBouche from './evier-bouche.json';
import pasEauChaude from './pas-eau-chaude.json';
import disjoncteurSaute from './disjoncteur-saute.json';
import plusDeCourant from './plus-de-courant.json';
import odeurGaz from './odeur-gaz.json';
import chaudiereEnPanne from './chaudiere-en-panne.json';

export const diagnostics: Diagnostic[] = [
  fuiteEau,
  wcBouche,
  evierBouche,
  pasEauChaude,
  disjoncteurSaute,
  plusDeCourant,
  odeurGaz,
  chaudiereEnPanne,
];
```

- [ ] **Step 5: Lancer le test et vérifier qu'il passe**

Run: `npm test -- diagnostics.data`
Expected: PASS (10 tests : 1 + 8 `it.each` + 1)

- [ ] **Step 6: Commit**

```bash
git add data/diagnostics __tests__/diagnostics.data.test.ts
git commit -m "Ajoute les données des 8 diagnostics"
```

---

### Task 4: Données des gestes d'urgence et des mini-tutos

**Files:**
- Create: `data/gestesUrgence.ts`
- Create: `data/tutos.ts`
- Test: `__tests__/gestesEtTutos.data.test.ts`

**Interfaces:**
- Consumes: `GesteUrgence`, `Tuto` (Task 2, `lib/types.ts`)
- Produces: `gestesUrgence: GesteUrgence[]` (utilisé par Task 6 et 9 via `gesteUrgenceId`), `tutos: Tuto[]` (utilisé par Task 8 et 10 via `tutoId`)

- [ ] **Step 1: Écrire le test (failing)**

```typescript
// __tests__/gestesEtTutos.data.test.ts
import { gestesUrgence } from '../data/gestesUrgence';
import { tutos } from '../data/tutos';
import { diagnostics } from '../data/diagnostics';

describe('gestes d\'urgence et tutos', () => {
  it('contient les 3 gestes d\'urgence attendus', () => {
    const ids = gestesUrgence.map((g) => g.id).sort();
    expect(ids).toEqual(['couper-courant', 'couper-eau', 'couper-gaz']);
  });

  it('contient les 4 mini-tutos attendus', () => {
    const ids = tutos.map((t) => t.id).sort();
    expect(ids).toEqual(['changer-joint', 'deboucher-evier', 'deboucher-wc', 'reparer-disjoncteur']);
  });

  it('chaque gesteUrgenceId référencé dans les diagnostics existe dans gestesUrgence', () => {
    const idsExistants = new Set(gestesUrgence.map((g) => g.id));
    for (const diag of diagnostics) {
      for (const resultat of Object.values(diag.resultats)) {
        if (resultat.gesteUrgenceId) {
          expect(idsExistants.has(resultat.gesteUrgenceId)).toBe(true);
        }
      }
    }
  });

  it('chaque tutoId référencé dans les diagnostics existe dans tutos', () => {
    const idsExistants = new Set(tutos.map((t) => t.id));
    for (const diag of diagnostics) {
      for (const resultat of Object.values(diag.resultats)) {
        if (resultat.tutoId) {
          expect(idsExistants.has(resultat.tutoId)).toBe(true);
        }
      }
    }
  });
});
```

- [ ] **Step 2: Lancer le test et vérifier qu'il échoue**

Run: `npm test -- gestesEtTutos`
Expected: FAIL (modules `../data/gestesUrgence` et `../data/tutos` introuvables)

- [ ] **Step 3: Créer les données des gestes d'urgence**

```typescript
// data/gestesUrgence.ts
import type { GesteUrgence } from '../lib/types';

export const gestesUrgence: GesteUrgence[] = [
  {
    id: 'couper-eau',
    titre: 'Couper l\'eau',
    etapes: [
      'Repère le robinet d\'arrêt général, souvent près du compteur d\'eau ou sous l\'évier de la cuisine.',
      'Tourne-le dans le sens des aiguilles d\'une montre jusqu\'à ce qu\'il soit bien fermé.',
      'Vérifie qu\'un robinet ouvert dans la maison ne coule plus.',
    ],
  },
  {
    id: 'couper-courant',
    titre: 'Couper le courant',
    etapes: [
      'Repère le disjoncteur général dans ton tableau électrique (souvent le plus gros interrupteur).',
      'Bascule-le en position basse ou "arrêt".',
      'Vérifie qu\'aucune lumière ni appareil ne fonctionne plus dans le logement.',
    ],
  },
  {
    id: 'couper-gaz',
    titre: 'Couper le gaz',
    etapes: [
      'Repère le robinet d\'arrêt du gaz, en général près du compteur ou juste avant la chaudière.',
      'Tourne-le à 90 degrés pour le mettre en position fermée.',
      'Ne rallume rien et n\'actionne aucun interrupteur électrique avant d\'avoir aéré et appelé un professionnel.',
    ],
  },
];
```

- [ ] **Step 4: Créer les données des mini-tutos**

```typescript
// data/tutos.ts
import type { Tuto } from '../lib/types';

export const tutos: Tuto[] = [
  {
    id: 'deboucher-evier',
    titre: 'Déboucher un évier',
    etapes: [
      'Retire l\'eau stagnante avec un récipient si l\'évier est plein.',
      'Utilise une ventouse en appuyant fermement plusieurs fois sur l\'orifice d\'évacuation.',
      'Si ça ne suffit pas, utilise un furet en le poussant doucement dans la canalisation.',
    ],
  },
  {
    id: 'deboucher-wc',
    titre: 'Déboucher des WC',
    etapes: [
      'Mets des gants et enfonce une ventouse adaptée dans la cuvette.',
      'Effectue des mouvements de va-et-vient fermes pendant une minute.',
      'Si ça ne suffit pas, utilise un furet spécial WC en le poussant doucement.',
    ],
  },
  {
    id: 'changer-joint',
    titre: 'Changer un joint ou resserrer un raccord',
    etapes: [
      'Coupe l\'eau avant de commencer (voir le geste "Couper l\'eau").',
      'Dévisse le raccord qui fuit avec une clé adaptée.',
      'Remplace le joint usé par un joint neuf de même taille, puis resserre sans forcer excessivement.',
      'Rouvre l\'eau doucement et vérifie qu\'il n\'y a plus de fuite.',
    ],
  },
  {
    id: 'reparer-disjoncteur',
    titre: 'Réarmer un disjoncteur',
    etapes: [
      'Repère le disjoncteur en position basse dans le tableau électrique.',
      'Débranche ou éteins l\'appareil qui a pu causer la surcharge, si tu en identifies un.',
      'Remets le disjoncteur en position haute.',
      'Si le disjoncteur re-saute immédiatement, ne réessaie pas plusieurs fois : fais appel à un électricien.',
    ],
  },
];
```

- [ ] **Step 5: Lancer le test et vérifier qu'il passe**

Run: `npm test -- gestesEtTutos`
Expected: PASS (4 tests)

- [ ] **Step 6: Commit**

```bash
git add data/gestesUrgence.ts data/tutos.ts __tests__/gestesEtTutos.data.test.ts
git commit -m "Ajoute les données des gestes d'urgence et mini-tutos"
```

---

### Task 5: Composants UI partagés

**Files:**
- Create: `components/VerdictBadge.tsx`
- Create: `components/EtapesList.tsx`

**Interfaces:**
- Consumes: `Verdict` (Task 2, `lib/types.ts`)
- Produces: `<VerdictBadge verdict={Verdict} />` (utilisé par Task 8), `<EtapesList etapes={string[]} />` (utilisé par Task 9 et 10)

- [ ] **Step 1: Créer le composant VerdictBadge**

```typescript
// components/VerdictBadge.tsx
import { StyleSheet, Text, View } from 'react-native';
import type { Verdict } from '../lib/types';

const CONFIG: Record<Verdict, { emoji: string; libelle: string; couleur: string }> = {
  vert: { emoji: '🟢', libelle: 'Tu peux réparer', couleur: '#2e7d32' },
  orange: { emoji: '🟠', libelle: 'Sécurise en attendant', couleur: '#ef6c00' },
  rouge: { emoji: '🔴', libelle: 'Appelle un pro', couleur: '#c62828' },
};

export function VerdictBadge({ verdict }: { verdict: Verdict }) {
  const config = CONFIG[verdict];
  return (
    <View style={[styles.container, { borderColor: config.couleur }]}>
      <Text style={styles.emoji}>{config.emoji}</Text>
      <Text style={[styles.libelle, { color: config.couleur }]}>{config.libelle}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderRadius: 8,
    padding: 12,
    gap: 8,
  },
  emoji: {
    fontSize: 24,
  },
  libelle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});
```

- [ ] **Step 2: Créer le composant EtapesList**

```typescript
// components/EtapesList.tsx
import { StyleSheet, Text, View } from 'react-native';

export function EtapesList({ etapes }: { etapes: string[] }) {
  return (
    <View style={styles.container}>
      {etapes.map((etape, index) => (
        <View key={index} style={styles.ligne}>
          <Text style={styles.numero}>{index + 1}</Text>
          <Text style={styles.texte}>{etape}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  ligne: {
    flexDirection: 'row',
    gap: 12,
  },
  numero: {
    fontSize: 16,
    fontWeight: 'bold',
    width: 24,
  },
  texte: {
    fontSize: 16,
    flex: 1,
  },
});
```

- [ ] **Step 3: Vérification manuelle**

Pas de test automatisé pour ces composants purement visuels (cohérent avec la spec : les écrans sont vérifiés manuellement). La vérification se fait à l'usage dans les Tasks 8, 9 et 10 une fois les écrans branchés.

- [ ] **Step 4: Commit**

```bash
git add components/VerdictBadge.tsx components/EtapesList.tsx
git commit -m "Ajoute les composants VerdictBadge et EtapesList"
```

---

### Task 6: Écran Accueil et layout racine

**Files:**
- Create: `app/_layout.tsx`
- Create: `app/index.tsx`

**Interfaces:**
- Consumes: `gestesUrgence` (Task 4, `data/gestesUrgence.ts`)
- Produces: route `/` et layout `Stack` racine utilisé par toutes les autres routes

- [ ] **Step 1: Créer le layout racine**

```typescript
// app/_layout.tsx
import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Dépann\'Maison' }} />
      <Stack.Screen name="diagnostics/index" options={{ title: 'Diagnostiquer une panne' }} />
      <Stack.Screen name="diagnostics/[id]" options={{ title: 'Diagnostic' }} />
      <Stack.Screen name="urgences/[id]" options={{ title: 'Geste d\'urgence' }} />
      <Stack.Screen name="tutos/[id]" options={{ title: 'Tuto' }} />
    </Stack>
  );
}
```

- [ ] **Step 2: Créer l'écran d'accueil**

```typescript
// app/index.tsx
import { Link } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { gestesUrgence } from '../data/gestesUrgence';

export default function Accueil() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.titre}>Une panne à la maison ?</Text>

      <Link href="/diagnostics" style={styles.boutonPrincipal}>
        <Text style={styles.boutonPrincipalTexte}>Diagnostiquer une panne</Text>
      </Link>

      <Text style={styles.sousTitre}>Gestes d'urgence</Text>
      <View style={styles.gestes}>
        {gestesUrgence.map((geste) => (
          <Link key={geste.id} href={`/urgences/${geste.id}`} style={styles.boutonGeste}>
            <Text style={styles.boutonGesteTexte}>{geste.titre}</Text>
          </Link>
        ))}
      </View>

      <Text style={styles.avertissement}>
        Dépann'Maison donne des conseils, mais ne remplace pas un professionnel.
        En cas de doute ou de danger, appelle un pro.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    gap: 20,
  },
  titre: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  sousTitre: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 12,
  },
  boutonPrincipal: {
    backgroundColor: '#1565c0',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  boutonPrincipalTexte: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  gestes: {
    gap: 10,
  },
  boutonGeste: {
    backgroundColor: '#eeeeee',
    borderRadius: 8,
    padding: 14,
  },
  boutonGesteTexte: {
    fontSize: 16,
  },
  avertissement: {
    fontSize: 13,
    color: '#666666',
    marginTop: 24,
    textAlign: 'center',
  },
});
```

- [ ] **Step 3: Vérification manuelle**

Run: `npx expo start`, ouvrir sur simulateur/device.
Expected: l'écran d'accueil affiche le titre, le bouton "Diagnostiquer une panne", les 3 gestes d'urgence, et l'avertissement en bas.

- [ ] **Step 4: Commit**

```bash
git add app/_layout.tsx app/index.tsx
git commit -m "Ajoute l'écran d'accueil et le layout racine"
```

---

### Task 7: Écran Liste des diagnostics

**Files:**
- Create: `app/diagnostics/index.tsx`

**Interfaces:**
- Consumes: `diagnostics` (Task 3, `data/diagnostics/index.ts`)
- Produces: route `/diagnostics`, navigue vers `/diagnostics/[id]` (Task 8)

- [ ] **Step 1: Créer l'écran de liste**

```typescript
// app/diagnostics/index.tsx
import { Link } from 'expo-router';
import { FlatList, StyleSheet, Text } from 'react-native';
import { diagnostics } from '../../data/diagnostics';

export default function ListeDiagnostics() {
  return (
    <FlatList
      contentContainerStyle={styles.container}
      data={diagnostics}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <Link href={`/diagnostics/${item.id}`} style={styles.ligne}>
          <Text style={styles.icone}>{item.icone}</Text>
          <Text style={styles.titre}>{item.titre}</Text>
        </Link>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    gap: 10,
  },
  ligne: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#eeeeee',
    borderRadius: 8,
    padding: 14,
  },
  icone: {
    fontSize: 22,
  },
  titre: {
    fontSize: 16,
  },
});
```

- [ ] **Step 2: Vérification manuelle**

Run: `npx expo start`, naviguer depuis l'accueil vers "Diagnostiquer une panne".
Expected: liste des 8 diagnostics affichée avec icône + titre, chaque ligne navigue vers l'écran de diagnostic correspondant.

- [ ] **Step 3: Commit**

```bash
git add app/diagnostics/index.tsx
git commit -m "Ajoute l'écran de liste des diagnostics"
```

---

### Task 8: Écran Diagnostic (arbre de questions + résultat)

**Files:**
- Create: `app/diagnostics/[id].tsx`

**Interfaces:**
- Consumes: `diagnostics` (Task 3), `estResultat`, `getEtape`, `getResultat` (Task 2, `lib/diagnosticEngine.ts`), `<VerdictBadge />` (Task 5)
- Produces: route `/diagnostics/[id]`, navigue vers `/tutos/[id]` et `/urgences/[id]` (Tasks 9, 10)

- [ ] **Step 1: Créer l'écran de diagnostic**

```typescript
// app/diagnostics/[id].tsx
import { Link, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { VerdictBadge } from '../../components/VerdictBadge';
import { diagnostics } from '../../data/diagnostics';
import { estResultat, getEtape, getResultat } from '../../lib/diagnosticEngine';

export default function EcranDiagnostic() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const diagnostic = diagnostics.find((d) => d.id === id);
  const [etapeActuelle, setEtapeActuelle] = useState(diagnostic?.etapeInitiale ?? '');

  if (!diagnostic) {
    return (
      <View style={styles.container}>
        <Text>Diagnostic introuvable.</Text>
      </View>
    );
  }

  if (estResultat(diagnostic, etapeActuelle)) {
    const resultat = getResultat(diagnostic, etapeActuelle);
    return (
      <ScrollView contentContainerStyle={styles.container}>
        <VerdictBadge verdict={resultat.verdict} />
        <Text style={styles.titreResultat}>{resultat.titre}</Text>
        <Text style={styles.conseil}>{resultat.conseil}</Text>

        {resultat.numeroUtile && (
          <Text style={styles.numero}>Numéro utile : {resultat.numeroUtile}</Text>
        )}

        {resultat.gesteUrgenceId && (
          <Link href={`/urgences/${resultat.gesteUrgenceId}`} style={styles.boutonSecondaire}>
            <Text style={styles.boutonSecondaireTexte}>Voir le geste d'urgence</Text>
          </Link>
        )}

        {resultat.tutoId && (
          <Link href={`/tutos/${resultat.tutoId}`} style={styles.boutonPrincipal}>
            <Text style={styles.boutonPrincipalTexte}>Voir le mini-tuto</Text>
          </Link>
        )}
      </ScrollView>
    );
  }

  const etape = getEtape(diagnostic, etapeActuelle);
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.question}>{etape.question}</Text>
      <View style={styles.reponses}>
        {etape.reponses.map((reponse) => (
          <TouchableOpacity
            key={reponse.texte}
            style={styles.boutonReponse}
            onPress={() => setEtapeActuelle(reponse.suite)}
          >
            <Text style={styles.boutonReponseTexte}>{reponse.texte}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    gap: 16,
  },
  question: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  reponses: {
    gap: 10,
  },
  boutonReponse: {
    backgroundColor: '#eeeeee',
    borderRadius: 8,
    padding: 14,
  },
  boutonReponseTexte: {
    fontSize: 16,
  },
  titreResultat: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  conseil: {
    fontSize: 16,
  },
  numero: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  boutonPrincipal: {
    backgroundColor: '#1565c0',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  boutonPrincipalTexte: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  boutonSecondaire: {
    backgroundColor: '#eeeeee',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  boutonSecondaireTexte: {
    fontSize: 16,
  },
});
```

- [ ] **Step 2: Vérification manuelle**

Run: `npx expo start`, parcourir au moins 3 diagnostics jusqu'au résultat, y compris "Odeur de gaz".
Expected: chaque question mène bien à la suivante ou à un résultat ; le diagnostic gaz aboutit toujours à 🔴 avec le numéro d'urgence affiché ; les liens vers tuto/geste d'urgence s'affichent quand ils sont définis.

- [ ] **Step 3: Commit**

```bash
git add "app/diagnostics/[id].tsx"
git commit -m "Ajoute l'écran de diagnostic (arbre de questions et résultat)"
```

---

### Task 9: Écran Geste d'urgence

**Files:**
- Create: `app/urgences/[id].tsx`

**Interfaces:**
- Consumes: `gestesUrgence` (Task 4), `<EtapesList />` (Task 5)
- Produces: route `/urgences/[id]`

- [ ] **Step 1: Créer l'écran**

```typescript
// app/urgences/[id].tsx
import { useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { EtapesList } from '../../components/EtapesList';
import { gestesUrgence } from '../../data/gestesUrgence';

export default function EcranGesteUrgence() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const geste = gestesUrgence.find((g) => g.id === id);

  if (!geste) {
    return (
      <View style={styles.container}>
        <Text>Geste d'urgence introuvable.</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.titre}>{geste.titre}</Text>
      <EtapesList etapes={geste.etapes} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    gap: 20,
  },
  titre: {
    fontSize: 22,
    fontWeight: 'bold',
  },
});
```

- [ ] **Step 2: Vérification manuelle**

Run: `npx expo start`, ouvrir les 3 gestes d'urgence depuis l'accueil.
Expected: chaque geste affiche son titre et ses étapes numérotées.

- [ ] **Step 3: Commit**

```bash
git add "app/urgences/[id].tsx"
git commit -m "Ajoute l'écran des gestes d'urgence"
```

---

### Task 10: Écran Mini-tuto

**Files:**
- Create: `app/tutos/[id].tsx`

**Interfaces:**
- Consumes: `tutos` (Task 4), `<EtapesList />` (Task 5)
- Produces: route `/tutos/[id]`

- [ ] **Step 1: Créer l'écran**

```typescript
// app/tutos/[id].tsx
import { useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { EtapesList } from '../../components/EtapesList';
import { tutos } from '../../data/tutos';

export default function EcranTuto() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const tuto = tutos.find((t) => t.id === id);

  if (!tuto) {
    return (
      <View style={styles.container}>
        <Text>Tuto introuvable.</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.titre}>{tuto.titre}</Text>
      <EtapesList etapes={tuto.etapes} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    gap: 20,
  },
  titre: {
    fontSize: 22,
    fontWeight: 'bold',
  },
});
```

- [ ] **Step 2: Vérification manuelle**

Run: `npx expo start`, atteindre chacun des 4 tutos via un diagnostic aboutissant à un verdict 🟢.
Expected: chaque tuto affiche son titre et ses étapes numérotées.

- [ ] **Step 3: Commit**

```bash
git add "app/tutos/[id].tsx"
git commit -m "Ajoute l'écran des mini-tutos"
```

---

### Task 11: Vérification end-to-end complète

**Files:**
- Aucun fichier créé — task de vérification manuelle globale

**Interfaces:**
- Consumes: l'application complète (Tasks 1 à 10)
- Produces: confirmation que le MVP est fonctionnel de bout en bout

- [ ] **Step 1: Lancer toute la suite de tests automatisés**

Run: `npm test`
Expected: PASS (tous les tests des Tasks 1 à 4)

- [ ] **Step 2: Parcourir manuellement les 8 diagnostics jusqu'au bout**

Pour chacun des 8 diagnostics, suivre tous les chemins de réponse possibles jusqu'à un résultat. Vérifier que :
- le verdict affiché correspond à la couleur attendue
- le diagnostic "Odeur de gaz" affiche toujours 🔴 avec le numéro d'urgence
- les liens vers tuto/geste d'urgence, quand présents, ouvrent le bon écran

- [ ] **Step 3: Vérifier les 3 gestes d'urgence et les 4 tutos depuis l'accueil et depuis les résultats de diagnostic**

Expected: chaque écran affiche des étapes cohérentes et lisibles.

- [ ] **Step 4: Vérifier l'avertissement légal sur l'écran d'accueil**

Expected: le texte "Dépann'Maison donne des conseils, mais ne remplace pas un professionnel" est visible sans avoir à scroller sur un écran de taille standard.

- [ ] **Step 5: Vérifier le fonctionnement hors-ligne**

Couper le Wi-Fi/données mobiles du device/simulateur, relancer l'app, refaire un parcours de diagnostic complet.
Expected: aucune erreur, aucun écran de chargement bloqué — tout fonctionne car les données sont embarquées.

- [ ] **Step 6: Commit final**

```bash
git add -A
git commit -m "Valide le parcours complet du MVP Dépann'Maison"
```
