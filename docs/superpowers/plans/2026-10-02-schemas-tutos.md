# Schémas animés des tutos — plan d'implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Intégrer dans l'appli les 26 schémas animés validés (maquette 9) et les nouveaux contenus des tutos dictés par André (10 tutos, encadré en haut, partie « Plan B », pannes ajustées).

**Architecture:** Plutôt qu'un composant React par schéma (26 composants), un petit **moteur de schémas dessinés** : chaque schéma est une *donnée* (liste de formes SVG + clés d'animation, comme les `@keyframes` CSS de la maquette), un seul composant `SchemaDessine` les dessine avec `react-native-svg`. Le calcul « où est chaque forme à l'instant t » est une fonction pure testée. Les deux schémas existants (`siphon`, `disjoncteur`) restent tels quels. Le modèle `Tuto` gagne un `encadre` optionnel et une partie `planB` optionnelle.

**Tech Stack:** Expo SDK 57, React Native 0.86, react-native-svg 15.15, Expo Router, TypeScript strict, Jest (jest-expo).

**Spec / sources :**
- Contenu validé : `docs/contenu/tutos-v2.md`
- Maquette validée (source de vérité des schémas, positions et timings) : `docs/design/maquettes-v2/9-schemas-tutos.html`
- Spec générale : `docs/superpowers/specs/2026-09-30-depannmaison-v2-design.md`

## Global Constraints

- Tout en français : interface, noms de code métier, commentaires, messages de commit (simples, sans jargon).
- Aucune couleur en dur hors de `src/theme/` (le test `src/theme/couleursEnDur.test.ts` le vérifie : ni `#xxxxxx` ni `rgba(` ailleurs).
- Pas de Reanimated. Animation = temps en boucle `useTempsBoucle` (déjà existant, pause quand l'écran n'est pas affiché) + calcul pur.
- Mouvement réduit (`useMouvementReduit`) : le schéma est figé sur une image fixe lisible.
- `app/` = routes uniquement. Partagé par ≥ 2 fonctionnalités → `src/ui/`. Logique pure → testée, test à côté du fichier.
- Tailles : composant 80–150 lignes (plafond ~250), hook/lib 100–200 (~300). Un fichier de données de dessins ≤ ~300 lignes.
- Ne jamais lancer `npx expo export`. Vérification web : `npx expo start --web --port 8099` (ne pas toucher au Metro d'André sur 8081/8082).
- Identité git locale déjà réglée (elios134). Ne jamais toucher la config git globale.
- Commandes : tests `npx jest <chemin>` ; types `npx tsc --noEmit`.

---

## Carte des fichiers

| Fichier | Rôle |
|---|---|
| `src/theme/tokens.ts` (modifié) | + couleurs des schémas (`schemaPiece`, `schemaSale`, `schemaTartre`, `schemaJoint`, `schemaFlexible`, `schemaEponge`, `schemaChiffon`, `schemaVinaigre`) |
| `src/ui/schemas/dessin.ts` (créé) | Types `Dessin`, `Forme`, `Anim`, `Peinture`, `Teinte` + fonctions pures `tempsLocal`, `etatAnim`, `validerDessin` |
| `src/ui/schemas/dessin.test.ts` (créé) | Tests du moteur |
| `src/ui/schemas/peinture.ts` (créé) | Traduit `Peinture`/`Teinte` en couleurs du thème (pur) |
| `src/ui/schemas/SchemaDessine.tsx` (créé) | Dessine un `Dessin` avec react-native-svg |
| `src/ui/schemas/dessins/communs.ts` (créé) | Formes réutilisées (seau, cuvette, réservoir…) |
| `src/ui/schemas/dessins/evier.ts`, `wc.ts`, `raccord.ts`, `flotteur.ts`, `mecanisme.ts`, `divers.ts` (créés) | Les 26 dessins, regroupés par tuto |
| `src/ui/schemas/dessins/index.ts` (créé) | Registre `DESSINS: Record<NomDessine, Dessin>` |
| `src/ui/schemas/dessins/dessins.test.ts` (créé) | Chaque dessin est valide |
| `src/domaine/etapes.ts` (modifié) | `NOMS_SCHEMAS` : + les 26 noms ; `NomDessine` |
| `src/ui/schemas/SchemaAnime.tsx` (modifié) | Choisit siphon / disjoncteur / dessin |
| `src/domaine/types.ts` (modifié) | `Tuto.encadre?`, `Tuto.planB?` |
| `src/domaine/renvoi.ts` (créé, déplacé) | `decrireRenvoi` (sorti de la fonctionnalité diagnostic, partagé) |
| `src/ui/CarteRenvoi.tsx` (déplacé) | Carte de renvoi, désormais partagée diagnostic + tutos |
| `src/ui/EtapesList.tsx` (modifié) | prop `premierNumero` |
| `src/fonctionnalites/tutos/components/EncadreTuto.tsx` (créé) | Encadré alerte / info en haut du tuto |
| `src/fonctionnalites/tutos/components/SeparateurPlanB.tsx` (créé) | Séparateur « Plan B » |
| `src/fonctionnalites/tutos/EcranTuto.tsx` (modifié) | Affiche encadré, étapes, Plan B |
| `src/donnees/tutos.ts` (réécrit) | Les 10 tutos |
| `src/donnees/diagnostics/*.json` (7 modifiés) | Liens de tutos et conseils ajustés |
| `src/donnees/gestesEtTutos.data.test.ts` (modifié) | Nouveaux tutos |
| `CLAUDE.md`, spec §6/§8, `docs/contenu/tutos-v2.md` (modifiés) | Documentation |

---

## Règles de conversion maquette → dessin (Tâches 2 à 4)

La maquette `docs/design/maquettes-v2/9-schemas-tutos.html` est générée à partir des définitions SVG + CSS de chaque schéma (bloc `<style>` = les `@keyframes`, classes `sN-…` ; un `<svg viewBox="0 0 220 120">` par schéma, dans l'ordre des tutos). Chaque dessin doit reproduire **exactement** les formes, positions et timings de la maquette :

1. **Formes** : `<rect x y width height rx>` → `{ type: 'rect', x, y, l: width, h: height, rx }` ; `<path d>` → `{ type: 'chemin', d }` ; `<circle>` → `cercle` ; `<ellipse>` → `ellipse` ; `<text class="lbl">` → `{ type: 'texte', x, y, texte }` (si `style="fill:#ff6b6b"` → `teinte: 'danger'`, si vert → `'succes'`) ; `<path class="fl" marker-end>` → `{ type: 'fleche', d }` ; le groupe « ok » (rond vert + coche) en `(x, y)` → `{ type: 'coche', x, y }` ; `<g>` → `{ type: 'groupe', formes }` ; `<g clip-path>` → `groupe` avec `decoupe` = le `d` (ou le rectangle converti en chemin `M x y H x+l V y+h H x Z`) du `<clipPath>`.
2. **Peinture** (classes CSS de la maquette) : `obj` → `'objet'` ; `trait` → `'trait'` ; `piece` → `'piece'` ; `eau` → `{ remplir: 'eau', opacite: 0.75 }` ; `outil` → `{ remplir: 'outil' }` ; `outil-t` → `{ contour: 'outil', epaisseur: 4, bout: 'rond' }` (garder l'épaisseur du `style` si précisée) ; `sale` → `{ remplir: 'sale' }`. Couleurs littérales de la maquette : `#4FA3FF` → `eau`, `#f5a623` → `outil`, `#ff6b6b` → `danger`, `#2ee9a5` → `succes`, `#9b7653` → `sale`, `#ece6cc` → `tartre`, `#d9c7a0` → `joint`, `#c9ced8` → `flexible`, `#f5d76e` → `eponge`, `#7d8fae` → `chiffon`, `#f3e9b0` → `vinaigre`, `#a39c8a` (vieux joint) → `{ contour: 'trait' }` en épaisseur 6, `#0b0d14` (fissure) → `{ contour: 'fond' }`, `rgba(255,255,255,.6/.7)` en contour → `'trait'`, `rgba(0,0,0,.6)` (joint du mécanisme) → `{ remplir: 'trait', contour: 'trait' }`. Un `opacity` ou `style="opacity:…"` sur l'élément → `opacite` dans la peinture. `stroke-dasharray` → `tirets`.
3. **Animations** : chaque `@keyframes` devient des clés `[instant 0..1, valeur]`. `0%,35%{…}` donne deux clés de même valeur (0 et 0.35). Un pourcentage absent d'une propriété n'a pas de clé pour elle. `translateX/translateY/translate(x,y)` → `x`/`y` ; `rotate(Ndeg)` → `rotation` ; `scale(s)` → `echelle` ; `scaleX(s)` → `echelleX` ; `opacity` → `opacite` ; `stroke-dashoffset` → `tiret`. Une propriété absente d'une clé vaut sa valeur au repos (0 pour les déplacements et rotations, 1 pour opacité et échelles) — n'écrire que ce qui bouge. Si l'élément a `opacity:0` au repos (CSS de la classe), mettre une clé d'opacité 0 aux instants où le keyframe ne la précise pas.
4. **Pivot** : rotations et échelles tournent autour de `anim.pivot` (obligatoire, `validerDessin` le vérifie). Si la maquette donne `transform-box:view-box; transform-origin:Xpx Ypx` → `pivot: [X, Y]` ; sinon (règle générale `transform-box: fill-box; transform-origin: center`) → le **centre de la boîte englobante** de l'élément animé (ex. ellipse `cx=166 cy=60` → `[166, 60]` ; groupe de deux rectangles → centre du rectangle qui les englobe).
5. **Courbes** : `ease-in-out`, `ease`, `ease-in`, `ease-out` → `doux: true` ; `linear` ou rien de précisé avec des paliers (clignotements, opacités) → `doux: false` (défaut).
6. **Durées** : `dureeMs` du dessin = la durée de l'animation principale (4 s sauf : `evier-furet` 6 s, `wc-ecoulement-lent` 5 s, `wc-acide` 5 s, `reservoir-remplissage` 5 s, `mousseur-tremper` 5 s). Une animation plus courte (ex. `.8s`, `1.2s`, `.6s`, `1.5s`, `1.6s`) → `repetitions = Math.round(dureeMs / durée)`. `animation-delay: Ds` → `retard = D / (dureeMs/1000)` (fraction du tour). Une rotation continue `to{transform:rotate(360deg)}` → `rotation: [[0, 0], [1, 360]]`.
7. **Deux animations sur un même élément** (ex. `s9-b` : tirets + opacité, de périodes différentes) → un `groupe` porte l'une (opacité), l'élément à l'intérieur porte l'autre (tirets).
8. **Zigzag du furet** (`evier-furet`) : la maquette le calcule ; dans le code, écrire la fonction `zigzag(x0, x1, y)` dans `communs.ts` (même calcul : départ `M x0 y`, puis tous les 5 px un point alternativement à `y-4` et `y+4`).
9. **Image figée** (`instantFige`) et **description** (lue par le lecteur d'écran) : prendre les valeurs du tableau ci-dessous.

| id | tuto · étape | dureeMs | instantFige | description |
|---|---|---|---|---|
| evier-devisser-siphon | évier 1 | 4000 | 0.7 | Schéma : le bouchon du siphon se dévisse et tombe dans le seau, l'eau coule dans le seau. |
| evier-nettoyer | évier 3 | 4000 | 0.5 | Schéma : une baguette racle l'intérieur du siphon ouvert, les saletés tombent dans le seau. |
| evier-ventouse | évier 6 | 4000 | 0.32 | Schéma : une éponge bouche le trop-plein, la ventouse pousse sur la bonde. |
| evier-demonter-siphon | évier 7 | 4000 | 0.7 | Schéma : le siphon entier se détache, les joints sont rangés à côté. |
| evier-furet | évier 8 | 6000 | 0.6 | Schéma : le furet avance de 5 cm, tourne, puis avance encore jusqu'au bouchon. |
| wc-ecoulement-lent | WC 1 | 5000 | 0.5 | Schéma : l'eau de la cuvette descend lentement à cause d'un bouchon dans le tuyau. |
| wc-ventouse | WC 2 | 4000 | 0.85 | Schéma : la ventouse pousse au fond de la cuvette et le bouchon part. |
| wc-acide | WC 5 | 5000 | 0.5 | Schéma : le flacon se vide dans la cuvette et le bouchon se dissout, sans ventouse. |
| couper-eau | raccord 1 | 4000 | 0.6 | Schéma : la manette du robinet d'arrêt tourne d'un quart de tour et l'eau s'arrête. |
| raccord-resserrer | raccord 2 | 4000 | 0.8 | Schéma : la clé resserre doucement l'écrou et la fuite s'arrête. |
| raccord-devisser | raccord 5 | 4000 | 0.7 | Schéma : l'écrou se dévisse et glisse, le joint apparaît. |
| joint-comparer | raccord 6 | 4000 | 0.75 | Schéma : le vieux joint se pose sur le joint neuf de la même taille. |
| joint-remonter | raccord 7 | 4000 | 0.85 | Schéma : le joint neuf se place et l'écrou se revisse. |
| flotteur-sortir | flotteur 3 | 4000 | 0.12 | Schéma : la pince dévisse l'écrou sous le réservoir, puis le robinet flotteur sort par le haut. |
| flotteur-nettoyer | flotteur 4 | 4000 | 0.85 | Schéma : un chiffon frotte le robinet flotteur et le tartre disparaît. |
| reservoir-remplissage | flotteur 5 | 5000 | 0.8 | Schéma : le réservoir se remplit, le flotteur monte et l'eau s'arrête toute seule. |
| reservoir-vidange | mécanisme 1 | 4000 | 0.5 | Schéma : le bouton de chasse s'enfonce et le réservoir se vide. |
| mecanisme-quart-tour | mécanisme 3 | 4000 | 0.2 | Schéma : la colonne du mécanisme tourne d'un quart de tour puis sort avec son joint. |
| tuyau-alimentation | mécanisme 6 | 4000 | 0.2 | Schéma : l'écrou du tuyau sous le réservoir se dévisse et le tuyau se détache. |
| papillons | mécanisme 7 | 4000 | 0.2 | Schéma : sous le réservoir, les deux écrous papillons se dévissent et tombent. |
| reservoir-retirer | mécanisme 8 | 4000 | 0.7 | Schéma : le réservoir se soulève et se décale de la cuvette, le joint apparaît. |
| mecanisme-ecrou | mécanisme 9 | 4000 | 0.15 | Schéma : le gros écrou sous le réservoir se dévisse, puis le mécanisme sort par le haut. |
| mousseur-devisser | mousseur 2 | 4000 | 0.2 | Schéma : le petit embout au bout du robinet se dévisse à la main. |
| mousseur-tremper | mousseur 4 | 5000 | 0.85 | Schéma : le mousseur trempe dans le vinaigre blanc et le tartre disparaît. |
| flexible-devisser | flexible 2 | 4000 | 0.2 | Schéma : l'écrou du flexible se dévisse à la main sous le robinet. |
| ampoule-devisser | ampoule 5 | 4000 | 0.2 | Schéma : le disjoncteur est coupé, l'ampoule se dévisse et sort de la douille. |

Vérification visuelle de chaque groupe : comparer côte à côte la maquette et l'écran du tuto sur le web (port 8099).

---

### Task 1: Moteur des schémas dessinés (pur) + couleurs du thème

**Files:**
- Modify: `src/theme/tokens.ts` (interface `Couleurs` + les deux thèmes)
- Create: `src/ui/schemas/dessin.ts`, `src/ui/schemas/dessin.test.ts`
- Create: `src/ui/schemas/peinture.ts`, `src/ui/schemas/peinture.test.ts`

**Interfaces:**
- Consumes: `interpoler`, `type Cle` de `src/ui/schemas/animation.ts` (existant) ; `Couleurs` de `src/theme/tokens.ts`.
- Produces: types `Teinte`, `Peinture`, `Anim`, `Forme`, `Dessin`, `EtatAnim` ; `tempsLocal(t, anim): number` ; `etatAnim(anim | undefined, t): EtatAnim` ; `validerDessin(dessin): string[]` ; `couleurTeinte(teinte, couleurs): string` ; `stylePeinture(peinture, couleurs): StylePeinture` avec `StylePeinture = { fill: string; fillOpacity?: number; stroke?: string; strokeWidth?: number; strokeOpacity?: number; strokeDasharray?: string; strokeLinecap?: 'round'; strokeLinejoin?: 'round'; opacity?: number }`.

- [ ] **Step 1 : couleurs du thème.** Dans `src/theme/tokens.ts`, ajouter à l'interface `Couleurs` (après `carteEau`) :

```ts
  schemaPiece: string;
  schemaSale: string;
  schemaTartre: string;
  schemaJoint: string;
  schemaFlexible: string;
  schemaEponge: string;
  schemaChiffon: string;
  schemaVinaigre: string;
```

Thème `sombre` :

```ts
    schemaPiece: 'rgba(255,255,255,0.2)',
    schemaSale: '#9b7653',
    schemaTartre: '#ece6cc',
    schemaJoint: '#d9c7a0',
    schemaFlexible: '#c9ced8',
    schemaEponge: '#f5d76e',
    schemaChiffon: '#7d8fae',
    schemaVinaigre: '#f3e9b0',
```

Thème `clair` (plus foncés pour rester visibles sur fond blanc) :

```ts
    schemaPiece: 'rgba(15,23,42,0.12)',
    schemaSale: '#8a6440',
    schemaTartre: '#c9bf98',
    schemaJoint: '#b89f6a',
    schemaFlexible: '#8b93a3',
    schemaEponge: '#e0b93a',
    schemaChiffon: '#6b7d9c',
    schemaVinaigre: '#e6d68a',
```

- [ ] **Step 2 : tests du moteur (doivent échouer).** Créer `src/ui/schemas/dessin.test.ts` :

```ts
import { etatAnim, tempsLocal, validerDessin, type Dessin } from './dessin';

describe('tempsLocal', () => {
  it('vaut t sans répétition ni retard', () => {
    expect(tempsLocal(0.3, {})).toBeCloseTo(0.3);
  });
  it('tourne N fois par tour', () => {
    expect(tempsLocal(0.3, { repetitions: 5 })).toBeCloseTo(0.5);
  });
  it('décale avec le retard et reste entre 0 et 1', () => {
    expect(tempsLocal(0.1, { retard: 0.25 })).toBeCloseTo(0.85);
  });
});

describe('etatAnim', () => {
  it('sans animation : rien ne bouge', () => {
    expect(etatAnim(undefined, 0.5)).toEqual({ transform: undefined, opacite: 1, tiret: undefined });
  });
  it('déplace selon les clés', () => {
    const e = etatAnim({ y: [[0, 0], [0.5, 20], [1, 20]] }, 0.25);
    expect(e.transform).toBe('translate(0 10)');
  });
  it('tourne autour du pivot', () => {
    const e = etatAnim({ rotation: [[0, 0], [1, -90]], pivot: [112, 44] }, 1);
    expect(e.transform).toBe('rotate(-90 112 44)');
  });
  it('enchaîne déplacement puis rotation', () => {
    const e = etatAnim({ x: [[0, 10], [1, 10]], rotation: [[0, 30], [1, 30]], pivot: [5, 6] }, 0.5);
    expect(e.transform).toBe('translate(10 0) rotate(30 5 6)');
  });
  it('met à l\'échelle autour du pivot', () => {
    const e = etatAnim({ echelle: [[0, 0.5], [1, 0.5]], pivot: [100, 60] }, 0.2);
    expect(e.transform).toBe('translate(100 60) scale(0.5 0.5) translate(-100 -60)');
  });
  it('échelle horizontale seule', () => {
    const e = etatAnim({ echelleX: [[0, -1], [1, -1]], pivot: [62, 73] }, 0.2);
    expect(e.transform).toBe('translate(62 73) scale(-1 1) translate(-62 -73)');
  });
  it('calcule opacité et tirets', () => {
    const e = etatAnim({ opacite: [[0, 0], [1, 1]], tiret: [[0, 24], [1, 0]] }, 0.5);
    expect(e.opacite).toBeCloseTo(0.5);
    expect(e.tiret).toBeCloseTo(12);
  });
});

describe('validerDessin', () => {
  const base: Dessin = { dureeMs: 4000, instantFige: 0.5, description: 'Schéma : test.', formes: [] };
  it('accepte un dessin correct', () => {
    expect(validerDessin({ ...base, formes: [{ type: 'rect', x: 0, y: 0, l: 1, h: 1, peinture: 'objet' }] })).toEqual([]);
  });
  it('refuse un dessin vide, une durée nulle ou un instant figé hors de [0, 1]', () => {
    expect(validerDessin({ ...base, dureeMs: 0, instantFige: 2 }).length).toBe(3);
  });
  it('refuse des clés mal rangées ou hors de [0, 1]', () => {
    const d: Dessin = { ...base, formes: [{ type: 'coche', x: 0, y: 0, anim: { opacite: [[0.5, 0], [0.2, 1], [1.2, 1]] } }] };
    expect(validerDessin(d)).toContain('clés mal rangées (opacite)');
  });
  it('exige un pivot pour une rotation, même dans un groupe', () => {
    const d: Dessin = { ...base, formes: [{ type: 'groupe', formes: [{ type: 'coche', x: 0, y: 0, anim: { rotation: [[0, 0], [1, 90]] } }] }] };
    expect(validerDessin(d)).toContain('pivot manquant');
  });
});
```

- [ ] **Step 3 : lancer, vérifier l'échec.** `npx jest src/ui/schemas/dessin.test.ts` → FAIL (module `./dessin` introuvable).

- [ ] **Step 4 : implémenter `src/ui/schemas/dessin.ts`.**

```ts
// Moteur des schémas dessinés : un schéma = une liste de formes SVG (viewBox 220 × 120),
// chacune pouvant bouger selon des clés, comme les @keyframes CSS de la maquette 9.
// Tout ici est pur : pour un instant t (0 à 1), on calcule où est chaque forme.
import { interpoler, type Cle } from './animation';

/** Rôle d'une couleur ; traduit en vraie couleur du thème par `peinture.ts`. */
export type Teinte =
  | 'trait' | 'piece' | 'fond' | 'eau' | 'outil' | 'sale' | 'tartre' | 'joint'
  | 'flexible' | 'eponge' | 'chiffon' | 'vinaigre' | 'succes' | 'danger';

/** Comment une forme est peinte. */
export type Peinture =
  | 'objet' // fond très léger + contour (tuyau, réservoir…)
  | 'trait' // contour seul
  | 'piece' // pièce qu'on manipule : fond plus marqué + contour fin
  | { remplir?: Teinte; contour?: Teinte; epaisseur?: number; opacite?: number; tirets?: string; bout?: 'rond' };

export interface Anim {
  x?: readonly Cle[];
  y?: readonly Cle[];
  /** Degrés, autour de `pivot`. */
  rotation?: readonly Cle[];
  /** Autour de `pivot`. */
  echelle?: readonly Cle[];
  /** Autour de `pivot`. */
  echelleX?: readonly Cle[];
  opacite?: readonly Cle[];
  /** Décalage des tirets (strokeDashoffset). */
  tiret?: readonly Cle[];
  /** Mouvement adouci entre les clés (comme ease-in-out). */
  doux?: boolean;
  /** L'animation tourne N fois pendant un tour du schéma. */
  repetitions?: number;
  /** Retard, en fraction de tour (0 à 1). */
  retard?: number;
  pivot?: readonly [number, number];
}

interface Base {
  anim?: Anim;
}

export type Forme =
  | (Base & { type: 'rect'; x: number; y: number; l: number; h: number; rx?: number; peinture: Peinture })
  | (Base & { type: 'chemin'; d: string; peinture: Peinture })
  | (Base & { type: 'cercle'; cx: number; cy: number; r: number; peinture: Peinture })
  | (Base & { type: 'ellipse'; cx: number; cy: number; rx: number; ry: number; peinture: Peinture })
  | (Base & { type: 'texte'; x: number; y: number; texte: string; teinte?: Teinte })
  /** Flèche verte avec une pointe au bout du chemin. */
  | (Base & { type: 'fleche'; d: string })
  /** Coche verte dans un rond, centrée en (x, y). */
  | (Base & { type: 'coche'; x: number; y: number })
  /** `decoupe` : chemin SVG qui limite ce qu'on voit du groupe (ex. l'eau dans un seau). */
  | (Base & { type: 'groupe'; formes: Forme[]; decoupe?: string });

export interface Dessin {
  dureeMs: number;
  /** Lue par le lecteur d'écran. */
  description: string;
  /** Instant (0 à 1) affiché quand le téléphone demande de réduire les animations. */
  instantFige: number;
  formes: Forme[];
}

export interface EtatAnim {
  transform: string | undefined;
  opacite: number;
  tiret: number | undefined;
}

export function tempsLocal(t: number, anim: Anim): number {
  const v = (t - (anim.retard ?? 0)) * (anim.repetitions ?? 1);
  return ((v % 1) + 1) % 1;
}

const arrondi = (v: number) => Math.round(v * 1000) / 1000;

export function etatAnim(anim: Anim | undefined, t: number): EtatAnim {
  if (!anim) return { transform: undefined, opacite: 1, tiret: undefined };
  const u = tempsLocal(t, anim);
  const val = (cles: readonly Cle[] | undefined, repos: number) =>
    cles ? arrondi(interpoler(u, cles, anim.doux)) : repos;
  const [px, py] = anim.pivot ?? [0, 0];
  const morceaux: string[] = [];
  const x = val(anim.x, 0);
  const y = val(anim.y, 0);
  if (x !== 0 || y !== 0) morceaux.push(`translate(${x} ${y})`);
  const r = val(anim.rotation, 0);
  if (r !== 0) morceaux.push(`rotate(${r} ${px} ${py})`);
  const e = val(anim.echelle, 1);
  const sx = arrondi(e * val(anim.echelleX, 1));
  if (sx !== 1 || e !== 1) morceaux.push(`translate(${px} ${py}) scale(${sx} ${e}) translate(${-px} ${-py})`);
  return {
    transform: morceaux.length ? morceaux.join(' ') : undefined,
    opacite: val(anim.opacite, 1),
    tiret: anim.tiret ? val(anim.tiret, 0) : undefined,
  };
}

const PROPRIETES = ['x', 'y', 'rotation', 'echelle', 'echelleX', 'opacite', 'tiret'] as const;

function erreursForme(forme: Forme): string[] {
  const erreurs: string[] = [];
  const anim = forme.anim;
  if (anim) {
    for (const p of PROPRIETES) {
      const cles = anim[p];
      if (!cles) continue;
      const ok = cles.length > 0 && cles.every(([i], n) => i >= 0 && i <= 1 && (n === 0 || i >= cles[n - 1][0]));
      if (!ok) erreurs.push(`clés mal rangées (${p})`);
    }
    if ((anim.rotation || anim.echelle || anim.echelleX) && !anim.pivot) erreurs.push('pivot manquant');
  }
  if (forme.type === 'groupe') erreurs.push(...forme.formes.flatMap(erreursForme));
  return erreurs;
}

/** Liste des problèmes d'un dessin (vide si tout va bien). */
export function validerDessin(dessin: Dessin): string[] {
  const erreurs: string[] = [];
  if (dessin.formes.length === 0) erreurs.push('dessin vide');
  if (!(dessin.dureeMs > 0)) erreurs.push('durée nulle');
  if (dessin.instantFige < 0 || dessin.instantFige > 1) erreurs.push('instant figé hors de [0, 1]');
  return [...erreurs, ...dessin.formes.flatMap(erreursForme)];
}
```

- [ ] **Step 5 : lancer, vérifier que ça passe.** `npx jest src/ui/schemas/dessin.test.ts` → PASS.

- [ ] **Step 6 : tests de la peinture (doivent échouer).** Créer `src/ui/schemas/peinture.test.ts` :

```ts
import { COULEURS } from '@/theme/tokens';
import { couleurTeinte, stylePeinture } from './peinture';

const c = COULEURS.sombre;

describe('peinture des schémas', () => {
  it('traduit chaque teinte en couleur du thème', () => {
    expect(couleurTeinte('eau', c)).toBe(c.accent);
    expect(couleurTeinte('outil', c)).toBe(c.verdictOrange);
    expect(couleurTeinte('succes', c)).toBe(c.verdictVert);
    expect(couleurTeinte('trait', c)).toBe(c.texteDiscret);
    expect(couleurTeinte('sale', c)).toBe(c.schemaSale);
  });
  it('« objet » : fond léger et contour', () => {
    expect(stylePeinture('objet', c)).toEqual({ fill: c.carte, stroke: c.texteDiscret, strokeWidth: 2 });
  });
  it('« trait » : contour seul, bouts arrondis', () => {
    expect(stylePeinture('trait', c)).toEqual({
      fill: 'none', stroke: c.texteDiscret, strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round',
    });
  });
  it('« piece » : fond marqué, contour fin', () => {
    expect(stylePeinture('piece', c)).toEqual({ fill: c.schemaPiece, stroke: c.texte, strokeWidth: 1.5, strokeOpacity: 0.8 });
  });
  it('peinture libre : remplissage seul avec opacité', () => {
    expect(stylePeinture({ remplir: 'eau', opacite: 0.75 }, c)).toEqual({ fill: c.accent, opacity: 0.75 });
  });
  it('peinture libre : contour d\'outil arrondi', () => {
    expect(stylePeinture({ contour: 'outil', epaisseur: 4, bout: 'rond' }, c)).toEqual({
      fill: 'none', stroke: c.verdictOrange, strokeWidth: 4, strokeLinecap: 'round', strokeLinejoin: 'round',
    });
  });
});
```

- [ ] **Step 7 :** `npx jest src/ui/schemas/peinture.test.ts` → FAIL.

- [ ] **Step 8 : implémenter `src/ui/schemas/peinture.ts`.**

```ts
// Traduit la peinture d'une forme (rôle de couleur) en vraies couleurs du thème.
import type { Couleurs } from '@/theme/tokens';
import type { Peinture, Teinte } from './dessin';

export interface StylePeinture {
  fill: string;
  fillOpacity?: number;
  stroke?: string;
  strokeWidth?: number;
  strokeOpacity?: number;
  strokeDasharray?: string;
  strokeLinecap?: 'round';
  strokeLinejoin?: 'round';
  opacity?: number;
}

export function couleurTeinte(teinte: Teinte, c: Couleurs): string {
  switch (teinte) {
    case 'trait': return c.texteDiscret;
    case 'piece': return c.schemaPiece;
    case 'fond': return c.fond;
    case 'eau': return c.accent;
    case 'outil': return c.verdictOrange;
    case 'succes': return c.verdictVert;
    case 'danger': return c.danger;
    case 'sale': return c.schemaSale;
    case 'tartre': return c.schemaTartre;
    case 'joint': return c.schemaJoint;
    case 'flexible': return c.schemaFlexible;
    case 'eponge': return c.schemaEponge;
    case 'chiffon': return c.schemaChiffon;
    case 'vinaigre': return c.schemaVinaigre;
  }
}

export function stylePeinture(peinture: Peinture, c: Couleurs): StylePeinture {
  if (peinture === 'objet') return { fill: c.carte, stroke: c.texteDiscret, strokeWidth: 2 };
  if (peinture === 'trait') {
    return { fill: 'none', stroke: c.texteDiscret, strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' };
  }
  if (peinture === 'piece') return { fill: c.schemaPiece, stroke: c.texte, strokeWidth: 1.5, strokeOpacity: 0.8 };
  const style: StylePeinture = { fill: peinture.remplir ? couleurTeinte(peinture.remplir, c) : 'none' };
  if (peinture.contour) {
    style.stroke = couleurTeinte(peinture.contour, c);
    style.strokeWidth = peinture.epaisseur ?? 2;
  }
  if (peinture.bout === 'rond') {
    style.strokeLinecap = 'round';
    style.strokeLinejoin = 'round';
  }
  if (peinture.tirets) style.strokeDasharray = peinture.tirets;
  if (peinture.opacite !== undefined) style.opacity = peinture.opacite;
  return style;
}
```

- [ ] **Step 9 :** `npx jest src/ui/schemas src/theme` → PASS (dont `couleursEnDur`). `npx tsc --noEmit` → 0 erreur.

- [ ] **Step 10 : commit.**

```bash
git add src/theme/tokens.ts src/ui/schemas/dessin.ts src/ui/schemas/dessin.test.ts src/ui/schemas/peinture.ts src/ui/schemas/peinture.test.ts
git commit -m "Ajoute le moteur des schémas dessinés et leurs couleurs"
```

---

### Task 2: Rendu `SchemaDessine` + les 5 schémas de l'évier

**Files:**
- Create: `src/ui/schemas/SchemaDessine.tsx`
- Create: `src/ui/schemas/dessins/communs.ts`, `src/ui/schemas/dessins/evier.ts`, `src/ui/schemas/dessins/index.ts`, `src/ui/schemas/dessins/dessins.test.ts`
- Modify: `src/domaine/etapes.ts`, `src/ui/schemas/SchemaAnime.tsx`

**Interfaces:**
- Consumes (Task 1): `Dessin`, `Forme`, `etatAnim`, `stylePeinture`, `couleurTeinte` ; existants : `useTempsBoucle(dureeMs, actif)`, `useMouvementReduit()`, `POLICE_SCHEMA`, `useTheme()`.
- Produces: `NOMS_SCHEMAS` (ajout des noms au fil des tâches), `type NomDessine = Exclude<NomSchema, 'siphon' | 'disjoncteur'>` exporté depuis `src/domaine/etapes.ts` ; `DESSINS: Record<NomDessine, Dessin>` depuis `src/ui/schemas/dessins/index.ts` ; `SchemaDessine({ dessin, immobile })` ; dans `communs.ts` : `SEAU: string` (chemin de découpe du seau), `CUVETTE: string`, `zigzag(x0, x1, y): string`, `fondEvier(): Forme[]` (fond d'évier + tuyau du haut + tuyau de sortie), `seau(): Forme[]` (contour du seau).

- [ ] **Step 1 : noms des schémas.** Dans `src/domaine/etapes.ts`, remplacer la déclaration de `NOMS_SCHEMAS` et ajouter `NomDessine` :

```ts
// Une étape de tuto : un texte, ou un texte accompagné d'un petit schéma animé.
export const NOMS_SCHEMAS = [
  'siphon',
  'disjoncteur',
  'evier-devisser-siphon',
  'evier-nettoyer',
  'evier-ventouse',
  'evier-demonter-siphon',
  'evier-furet',
] as const;

export type NomSchema = (typeof NOMS_SCHEMAS)[number];

/** Schémas décrits comme des données (moteur `src/ui/schemas/dessin.ts`) ; siphon et disjoncteur ont leur propre composant. */
export type NomDessine = Exclude<NomSchema, 'siphon' | 'disjoncteur'>;
```

- [ ] **Step 2 : test des dessins (doit échouer).** Créer `src/ui/schemas/dessins/dessins.test.ts` :

```ts
import { NOMS_SCHEMAS } from '@/domaine/etapes';
import { validerDessin } from '../dessin';
import { DESSINS } from './index';

describe('dessins des tutos', () => {
  const noms = NOMS_SCHEMAS.filter((n) => n !== 'siphon' && n !== 'disjoncteur');

  it('chaque nom de schéma a son dessin, et rien de plus', () => {
    expect(Object.keys(DESSINS).sort()).toEqual([...noms].sort());
  });

  it.each(noms)('%s est valide', (nom) => {
    expect(validerDessin(DESSINS[nom])).toEqual([]);
  });

  it.each(noms)('%s a une description lisible', (nom) => {
    expect(DESSINS[nom].description).toMatch(/^Schéma : .+\.$/);
  });
});
```

- [ ] **Step 3 :** `npx jest src/ui/schemas/dessins` → FAIL (`./index` introuvable).

- [ ] **Step 4 : formes communes.** Créer `src/ui/schemas/dessins/communs.ts` :

```ts
// Morceaux de dessin réutilisés par plusieurs schémas (maquette 9).
import type { Forme } from '../dessin';

/** Contour du seau, fermé : sert de découpe pour l'eau qui le remplit. */
export const SEAU = 'M66 92 L74 119 H140 L148 92Z';

/** Cuvette des WC vue en coupe (entonnoir), fermée : sert aussi de découpe pour l'eau. */
export const CUVETTE = 'M30 20 H170 L124 78 H76 Z';

/** Ressort du furet : un point tous les 5 px, alternativement 4 px au-dessus et au-dessous. */
export function zigzag(x0: number, x1: number, y: number): string {
  let d = `M${x0} ${y}`;
  let haut = true;
  for (let x = x0 + 5; x <= x1; x += 5) {
    d += ` L${x} ${y + (haut ? -4 : 4)}`;
    haut = !haut;
  }
  return d;
}

/** Fond d'évier, tuyau qui descend vers le siphon et tuyau de sortie vers le mur. */
export function fondEvier(): Forme[] {
  return [
    { type: 'rect', x: 30, y: 0, l: 160, h: 7, peinture: 'objet' },
    { type: 'rect', x: 100, y: 7, l: 14, h: 24, peinture: 'objet' },
    { type: 'rect', x: 124, y: 38, l: 76, h: 11, peinture: 'objet' },
  ];
}

/** Contour ouvert du seau (le haut n'est pas fermé). */
export function seau(): Forme[] {
  return [{ type: 'chemin', d: 'M66 92 L74 119 H140 L148 92', peinture: 'trait' }];
}

/** Cuvette des WC + tuyau d'évacuation. */
export function cuvette(): Forme[] {
  return [
    { type: 'chemin', d: CUVETTE, peinture: 'objet' },
    { type: 'rect', x: 86, y: 78, l: 28, h: 42, peinture: 'objet' },
  ];
}
```

- [ ] **Step 5 : les 5 dessins de l'évier.** Créer `src/ui/schemas/dessins/evier.ts`. Le premier dessin est donné en entier ; les 4 suivants (`evierNettoyer`, `evierVentouse`, `evierDemonterSiphon`, `evierFuret`) se traduisent de la maquette (classes `s2-…` à `s5-…`) avec les **Règles de conversion** ci-dessus et le tableau (durée, instant figé, description). Exemple complet, à reproduire dans ce style :

```ts
// Schémas du tuto « Déboucher un évier » (maquette 9, classes s1 à s5).
import type { Dessin, Forme } from '../dessin';
import { fondEvier, seau, SEAU, zigzag } from './communs';

const EAU = { remplir: 'eau', opacite: 0.75 } as const;

/** Une goutte qui tombe du siphon ouvert dans le seau (keyframes s1g), décalée de `retardS` secondes. */
function goutte(retardS: number): Forme {
  return {
    type: 'cercle', cx: 107, cy: 72, r: 2.5, peinture: EAU,
    anim: {
      y: [[0, 0], [0.45, 0], [0.62, 30], [1, 30]],
      opacite: [[0, 0], [0.45, 0], [0.47, 1], [0.62, 1], [0.63, 0], [1, 0]],
      retard: retardS / 4,
    },
  };
}

export const evierDevisserSiphon: Dessin = {
  dureeMs: 4000,
  instantFige: 0.7,
  description: 'Schéma : le bouchon du siphon se dévisse et tombe dans le seau, l\'eau coule dans le seau.',
  formes: [
    ...fondEvier(),
    { type: 'rect', x: 88, y: 30, l: 38, h: 40, rx: 6, peinture: 'objet' },
    {
      type: 'groupe', decoupe: SEAU,
      formes: [{
        type: 'rect', x: 60, y: 100, l: 100, h: 24, peinture: EAU,
        anim: { y: [[0, 14], [0.45, 14], [0.85, 4], [1, 4]], doux: true },
      }],
    },
    ...seau(),
    goutte(0), goutte(0.35), goutte(0.7),
    {
      type: 'rect', x: 90, y: 70, l: 34, h: 11, rx: 3, peinture: 'piece',
      anim: {
        y: [[0, 0], [0.35, 0], [0.55, 26], [1, 26]],
        opacite: [[0, 1], [0.85, 1], [0.95, 0], [1, 0]],
        doux: true,
      },
    },
    { type: 'fleche', d: 'M84 77 A24 8 0 0 0 132 77', anim: { opacite: CLIGNE_DEBUT } },
    { type: 'texte', x: 152, y: 80, texte: 'dévisse', anim: { opacite: CLIGNE_DEBUT } },
  ],
};
```

avec, en haut du fichier : `const CLIGNE_DEBUT = [[0, 0], [0.05, 0], [0.1, 1], [0.32, 1], [0.38, 0], [1, 0]] as const;` (keyframes `s1fl`). `zigzag` sert à `evierFuret` (ressort de `-40` à `110`, `y = 60`, contour `outil` épaisseur 2.5).

- [ ] **Step 6 : registre.** Créer `src/ui/schemas/dessins/index.ts` :

```ts
// Registre des schémas dessinés, par nom (voir NOMS_SCHEMAS).
import type { NomDessine } from '@/domaine/etapes';
import type { Dessin } from '../dessin';
import { evierDemonterSiphon, evierDevisserSiphon, evierFuret, evierNettoyer, evierVentouse } from './evier';

export const DESSINS: Record<NomDessine, Dessin> = {
  'evier-devisser-siphon': evierDevisserSiphon,
  'evier-nettoyer': evierNettoyer,
  'evier-ventouse': evierVentouse,
  'evier-demonter-siphon': evierDemonterSiphon,
  'evier-furet': evierFuret,
};
```

- [ ] **Step 7 :** `npx jest src/ui/schemas/dessins` → PASS.

- [ ] **Step 8 : le composant de rendu.** Créer `src/ui/schemas/SchemaDessine.tsx` :

```tsx
// src/ui/schemas/SchemaDessine.tsx — dessine un schéma décrit en données (moteur dessin.ts, maquette 9).
import { useId } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, ClipPath, Defs, Ellipse, G, Marker, Path, Rect, Text as SvgText } from 'react-native-svg';
import type { Couleurs } from '@/theme/tokens';
import { useTheme } from '@/theme/ThemeProvider';
import { etatAnim, type Dessin, type Forme } from './dessin';
import { couleurTeinte, stylePeinture } from './peinture';
import { POLICE_SCHEMA } from './policeSchema';
import { useTempsBoucle } from './useTempsBoucle';

interface Contexte {
  couleurs: Couleurs;
  t: number;
  /** Préfixe unique des id SVG (pointe de flèche, découpes) : plusieurs schémas peuvent être à l'écran. */
  prefixe: string;
}

function contenu(forme: Forme, ctx: Contexte, chemin: string, tiret: number | undefined) {
  const { couleurs } = ctx;
  switch (forme.type) {
    case 'rect':
      return <Rect x={forme.x} y={forme.y} width={forme.l} height={forme.h} rx={forme.rx} {...stylePeinture(forme.peinture, couleurs)} strokeDashoffset={tiret} />;
    case 'chemin':
      return <Path d={forme.d} {...stylePeinture(forme.peinture, couleurs)} strokeDashoffset={tiret} />;
    case 'cercle':
      return <Circle cx={forme.cx} cy={forme.cy} r={forme.r} {...stylePeinture(forme.peinture, couleurs)} />;
    case 'ellipse':
      return <Ellipse cx={forme.cx} cy={forme.cy} rx={forme.rx} ry={forme.ry} {...stylePeinture(forme.peinture, couleurs)} />;
    case 'texte':
      return (
        <SvgText fontFamily={POLICE_SCHEMA} x={forme.x} y={forme.y} fontSize={9} fill={couleurTeinte(forme.teinte ?? 'trait', couleurs)}>
          {forme.texte}
        </SvgText>
      );
    case 'fleche':
      return (
        <Path d={forme.d} fill="none" stroke={couleurs.verdictVert} strokeWidth={2.5} strokeLinecap="round"
          strokeLinejoin="round" markerEnd={`url(#${ctx.prefixe}-pointe)`} />
      );
    case 'coche':
      return (
        <G>
          <Circle cx={forme.x} cy={forme.y} r={12} fill={couleurs.verdictVert} fillOpacity={0.13} />
          <Path d={`M${forme.x - 6} ${forme.y} l4 4 l8 -9`} fill="none" stroke={couleurs.verdictVert}
            strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
        </G>
      );
    case 'groupe': {
      const idDecoupe = `${ctx.prefixe}-d${chemin}`;
      return (
        <G clipPath={forme.decoupe ? `url(#${idDecoupe})` : undefined}>
          {forme.decoupe ? (
            <Defs>
              <ClipPath id={idDecoupe}>
                <Path d={forme.decoupe} />
              </ClipPath>
            </Defs>
          ) : null}
          {forme.formes.map((f, i) => (
            <FormeAnimee key={i} forme={f} ctx={ctx} chemin={`${chemin}-${i}`} />
          ))}
        </G>
      );
    }
  }
}

function FormeAnimee({ forme, ctx, chemin }: { forme: Forme; ctx: Contexte; chemin: string }) {
  const etat = etatAnim(forme.anim, ctx.t);
  if (etat.opacite <= 0.001) return null;
  return (
    <G transform={etat.transform} opacity={etat.opacite}>
      {contenu(forme, ctx, chemin, etat.tiret)}
    </G>
  );
}

export function SchemaDessine({ dessin, immobile }: { dessin: Dessin; immobile: boolean }) {
  const { couleurs } = useTheme();
  const tBoucle = useTempsBoucle(dessin.dureeMs, !immobile);
  const prefixe = `s${useId().replace(/:/g, '')}`;
  const ctx: Contexte = { couleurs, t: immobile ? dessin.instantFige : tBoucle, prefixe };
  return (
    <View style={styles.zone}>
      <Svg width="100%" height="100%" viewBox="0 0 220 120">
        <Defs>
          <Marker id={`${prefixe}-pointe`} viewBox="0 0 10 10" refX={6} refY={5} markerWidth={5} markerHeight={5} orient="auto">
            <Path d="M0 0 L10 5 L0 10 Z" fill={couleurs.verdictVert} />
          </Marker>
        </Defs>
        {dessin.formes.map((f, i) => (
          <FormeAnimee key={i} forme={f} ctx={ctx} chemin={`${i}`} />
        ))}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  zone: { width: '100%', aspectRatio: 220 / 120, overflow: 'hidden' },
});
```

- [ ] **Step 9 : brancher dans `SchemaAnime`.** Dans `src/ui/schemas/SchemaAnime.tsx`, remplacer `DESCRIPTIONS` et le rendu :

```tsx
import { DESSINS } from './dessins';
import { SchemaDessine } from './SchemaDessine';
// …
const DESCRIPTIONS_COMPOSANTS = {
  siphon: 'Schéma : l\'eau remplit le coude du siphon et bloque les odeurs.',
  disjoncteur: 'Schéma : le levier du disjoncteur remonte de 0 (coupé) à I (marche).',
} as const;

function description(nom: NomSchema): string {
  return nom === 'siphon' || nom === 'disjoncteur' ? DESCRIPTIONS_COMPOSANTS[nom] : DESSINS[nom].description;
}
```

et dans le JSX : `accessibilityLabel={description(nom)}` ; contenu :

```tsx
      {nom === 'siphon' ? (
        <SchemaSiphon immobile={immobile} />
      ) : nom === 'disjoncteur' ? (
        <SchemaDisjoncteur immobile={immobile} />
      ) : (
        <SchemaDessine dessin={DESSINS[nom]} immobile={immobile} />
      )}
```

- [ ] **Step 10 : branchement provisoire pour voir le rendu.** Dans `src/donnees/tutos.ts`, tuto `deboucher-evier`, remplacer **temporairement** la première étape par `{ texte: '<texte actuel>', schema: 'evier-devisser-siphon' }` et ajouter à la fin les 4 autres schémas sur les étapes existantes (n'importe lesquelles) — la Tâche 6 réécrit ce tuto. Lancer `npx expo start --web --port 8099`, ouvrir `http://localhost:8099/tutos/deboucher-evier`, comparer chaque schéma à la maquette (positions, couleurs, mouvement, pointe de flèche). Vérifier aussi le thème clair (Réglages → Thème clair). Corriger jusqu'à ce que ce soit identique.

- [ ] **Step 11 :** `npx jest` (tout) → PASS ; `npx tsc --noEmit` → 0 erreur.

- [ ] **Step 12 : commit.**

```bash
git add src/domaine/etapes.ts src/ui/schemas src/donnees/tutos.ts
git commit -m "Dessine les schémas animés de l'évier avec le nouveau moteur"
```

---

### Task 3: Schémas WC, raccord, mousseur, flexible et ampoule (12)

**Files:**
- Create: `src/ui/schemas/dessins/wc.ts`, `src/ui/schemas/dessins/raccord.ts`, `src/ui/schemas/dessins/divers.ts`
- Modify: `src/domaine/etapes.ts`, `src/ui/schemas/dessins/index.ts`

**Interfaces:**
- Consumes: Task 1 (`Dessin`, `Forme`), Task 2 (`communs.ts` : `CUVETTE`, `cuvette()` ; registre `DESSINS` ; test `dessins.test.ts` qui vérifie automatiquement tout nouveau nom).
- Produces: dessins exportés `wcEcoulementLent`, `wcVentouse`, `wcAcide` (wc.ts) ; `couperEau`, `raccordResserrer`, `raccordDevisser`, `jointComparer`, `jointRemonter` (raccord.ts) ; `mousseurDevisser`, `mousseurTremper`, `flexibleDevisser`, `ampouleDevisser` (divers.ts) ; noms correspondants dans `NOMS_SCHEMAS`.

- [ ] **Step 1 : noms.** Ajouter à `NOMS_SCHEMAS` (après `'evier-furet'`) : `'wc-ecoulement-lent', 'wc-ventouse', 'wc-acide', 'couper-eau', 'raccord-resserrer', 'raccord-devisser', 'joint-comparer', 'joint-remonter', 'mousseur-devisser', 'mousseur-tremper', 'flexible-devisser', 'ampoule-devisser'`.
- [ ] **Step 2 :** `npx jest src/ui/schemas/dessins` → FAIL (12 noms sans dessin) ; `npx tsc --noEmit` signale le `Record` incomplet : c'est attendu.
- [ ] **Step 3 : écrire les 12 dessins** depuis la maquette (classes `s6` à `s13` et `s23` à `s26`) avec les Règles de conversion et le tableau. Points d'attention :
  - `wc-acide` : le flacon tourne autour de `pivot: [163, 26]` (view-box) ; le jet utilise `tirets: '4 4'` et une anim `tiret` de 40 à 0 entre 0.18 et 0.64.
  - `couper-eau` : manette `pivot: [112, 44]` ; écoulement = deux chemins `tirets: '6 6'`, `tiret: [[0, 24], [1, 0]]`, `repetitions: 7` ; celui d'aval est dans un `groupe` qui porte l'opacité `s9b`.
  - `raccord-resserrer` : clé `pivot: [114, 61]`.
  - `mousseur-tremper` : aiguille de l'horloge `rotation: [[0, 0], [1, 360]]`, `pivot: [190, 30]` ; bulles `repetitions: 3`, `retard` 0, 0.1, 0.2 ; le vinaigre est un `groupe` avec `decoupe: 'M60 40 H160 L150 110 H70 Z'`.
  - `ampoule-devisser` : « coupé » et le levier en `danger`.
- [ ] **Step 4 :** ajouter les 12 au registre `DESSINS` ; `npx jest src/ui/schemas` → PASS ; `npx tsc --noEmit` → 0 erreur.
- [ ] **Step 5 : vérification visuelle.** Branchement provisoire comme en Tâche 2 (étapes des tutos `deboucher-wc`, `changer-joint`, `detartrer-mousseur`, `changer-flexible-douche`, `changer-ampoule`), comparer chaque schéma à la maquette sur le web (port 8099), thèmes sombre et clair. Corriger.
- [ ] **Step 6 : commit.**

```bash
git add src/domaine/etapes.ts src/ui/schemas/dessins src/donnees/tutos.ts
git commit -m "Ajoute les schémas animés des WC, des raccords, du mousseur, du flexible et de l'ampoule"
```

---

### Task 4: Schémas robinet flotteur et mécanisme de chasse (9)

**Files:**
- Create: `src/ui/schemas/dessins/flotteur.ts`, `src/ui/schemas/dessins/mecanisme.ts`
- Modify: `src/domaine/etapes.ts`, `src/ui/schemas/dessins/index.ts`

**Interfaces:**
- Consumes: Tasks 1–3 (moteur, `communs.ts`, registre, test automatique).
- Produces: `flotteurSortir`, `flotteurNettoyer`, `reservoirRemplissage` (flotteur.ts) ; `reservoirVidange`, `mecanismeQuartTour`, `tuyauAlimentation`, `papillons`, `reservoirRetirer`, `mecanismeEcrou` (mecanisme.ts) ; noms dans `NOMS_SCHEMAS`. Ajouter dans `communs.ts` `reservoirOuvert(): Forme[]` (chemin `M30 8 V96 H190 V8`, peinture `objet`) s'il sert à plus d'un dessin.

- [ ] **Step 1 : noms.** Ajouter à `NOMS_SCHEMAS` : `'flotteur-sortir', 'flotteur-nettoyer', 'reservoir-remplissage', 'reservoir-vidange', 'mecanisme-quart-tour', 'tuyau-alimentation', 'papillons', 'reservoir-retirer', 'mecanisme-ecrou'`.
- [ ] **Step 2 :** `npx jest src/ui/schemas/dessins` → FAIL (9 noms sans dessin).
- [ ] **Step 3 : écrire les 9 dessins** depuis la maquette (classes `s14` à `s22`). Points d'attention :
  - `flotteur-sortir` : pince `pivot: [61, 101]` ; l'étiquette « écrou sous le réservoir » ne tourne pas (anim d'opacité seule, keyframes `s14l`).
  - `flotteur-nettoyer` : chiffon `repetitions: 3` (1.2 s ≈ 4 s / 3), `doux: true`.
  - `papillons` : chaque écrou papillon est un `groupe` animé (`echelleX` + `y` + `opacite`), `pivot` = centre de son moyeu (`[62, 73]` et `[158, 73]`).
  - `reservoir-retirer` : « lourd et fragile » en `danger`.
- [ ] **Step 4 :** registre complété ; `npx jest src/ui/schemas` → PASS ; `npx tsc --noEmit` → 0 erreur.
- [ ] **Step 5 : vérification visuelle** (branchement provisoire sur `detartrer-flotteur` et `changer-joint-clapet`, web 8099, sombre et clair). Corriger.
- [ ] **Step 6 : commit.**

```bash
git add src/domaine/etapes.ts src/ui/schemas/dessins src/donnees/tutos.ts
git commit -m "Ajoute les schémas animés du robinet flotteur et du mécanisme de chasse"
```

---

### Task 5: Encadré en haut du tuto et partie « Plan B »

**Files:**
- Modify: `src/domaine/types.ts`, `src/domaine/etapes.ts`
- Create: `src/domaine/renvoi.ts`, `src/domaine/renvoi.test.ts` (déplacés depuis `src/fonctionnalites/diagnostic/lib/renvoi.ts` et `renvoi.test.ts` pour `decrireRenvoi`)
- Move: `src/fonctionnalites/diagnostic/components/CarteRenvoi.tsx` → `src/ui/CarteRenvoi.tsx`
- Modify: `src/fonctionnalites/diagnostic/lib/renvoi.ts` (garde seulement `prosVisibles`), `src/fonctionnalites/diagnostic/lib/renvoi.test.ts`, `src/fonctionnalites/diagnostic/components/CarteResultat.tsx` (import)
- Modify: `src/ui/EtapesList.tsx`
- Create: `src/fonctionnalites/tutos/components/EncadreTuto.tsx`, `src/fonctionnalites/tutos/components/SeparateurPlanB.tsx`
- Modify: `src/fonctionnalites/tutos/EcranTuto.tsx`

**Interfaces:**
- Consumes: `Renvoi` (types.ts), `CarteListe` (src/ui), `teinte`, `useTheme`.
- Produces:
  - `interface EncadreTuto { ton: 'alerte' | 'info'; titre?: string; texte: string; renvoi?: Renvoi }` et `interface PlanB { sousTitre: string; etapes: EtapeTuto[] }` dans `src/domaine/types.ts` ; `Tuto` gagne `encadre?: EncadreTuto; planB?: PlanB`.
  - `toutesLesEtapes(tuto: Pick<Tuto, 'etapes' | 'planB'>): EtapeTuto[]` dans `src/domaine/etapes.ts`… (attention aux imports circulaires : `etapes.ts` ne doit pas importer `types.ts` ; la signature prend `{ etapes: EtapeTuto[]; planB?: { etapes: EtapeTuto[] } }`).
  - `decrireRenvoi` exporté depuis `@/domaine/renvoi` ; `CarteRenvoi` depuis `@/ui/CarteRenvoi`.
  - `EtapesList({ etapes, premierNumero = 1 })`.

- [ ] **Step 1 : test de `toutesLesEtapes` (doit échouer).** Ajouter à un nouveau fichier `src/domaine/etapes.test.ts` :

```ts
import { toutesLesEtapes } from './etapes';

describe('toutesLesEtapes', () => {
  it('met les étapes du Plan B à la suite', () => {
    expect(toutesLesEtapes({ etapes: ['a', 'b'], planB: { etapes: ['c'] } })).toEqual(['a', 'b', 'c']);
  });
  it('sans Plan B : les étapes seules', () => {
    expect(toutesLesEtapes({ etapes: ['a'] })).toEqual(['a']);
  });
});
```

- [ ] **Step 2 :** `npx jest src/domaine/etapes.test.ts` → FAIL.
- [ ] **Step 3 : implémenter** dans `src/domaine/etapes.ts` :

```ts
/** Toutes les étapes d'un tuto, Plan B compris, dans l'ordre d'affichage. */
export function toutesLesEtapes(tuto: { etapes: EtapeTuto[]; planB?: { etapes: EtapeTuto[] } }): EtapeTuto[] {
  return [...tuto.etapes, ...(tuto.planB?.etapes ?? [])];
}
```

et dans `src/domaine/types.ts` :

```ts
/** Encadré en haut d'un tuto : alerte (rouge) ou info (bleu), avec éventuellement un bouton de renvoi. */
export interface EncadreTuto {
  ton: 'alerte' | 'info';
  titre?: string;
  texte: string;
  renvoi?: Renvoi;
}

/** Suite du tuto si les premières étapes n'ont pas suffi ; la numérotation continue. */
export interface PlanB {
  sousTitre: string;
  etapes: EtapeTuto[];
}
```

`Tuto` : ajouter `encadre?: EncadreTuto;` et `planB?: PlanB;`.

- [ ] **Step 4 :** `npx jest src/domaine` → PASS.
- [ ] **Step 5 : déplacer le renvoi.** `git mv src/fonctionnalites/diagnostic/components/CarteRenvoi.tsx src/ui/CarteRenvoi.tsx`. Créer `src/domaine/renvoi.ts` avec `DescriptionRenvoi` et `decrireRenvoi` (code actuel inchangé, copié de `src/fonctionnalites/diagnostic/lib/renvoi.ts`), et `src/domaine/renvoi.test.ts` avec les tests de `decrireRenvoi` (copiés de `renvoi.test.ts`). Dans `src/fonctionnalites/diagnostic/lib/renvoi.ts`, ne garder que `prosVisibles` (et ses tests dans `renvoi.test.ts`). Dans `src/ui/CarteRenvoi.tsx`, importer `decrireRenvoi` depuis `@/domaine/renvoi` ; mettre à jour l'en-tête du fichier (`// src/ui/CarteRenvoi.tsx — bouton « continuer avec… » (résultat de diagnostic, encadré de tuto ; maquettes 8 et 9).`). Dans `CarteResultat.tsx`, importer `CarteRenvoi` depuis `@/ui/CarteRenvoi`. `npx jest src/domaine src/fonctionnalites/diagnostic` → PASS ; `npx tsc --noEmit` → 0 erreur.
- [ ] **Step 6 : numérotation.** Dans `src/ui/EtapesList.tsx` : signature `EtapesList({ etapes, premierNumero = 1 }: { etapes: readonly EtapeTuto[]; premierNumero?: number })`, numéro affiché `{premierNumero + index}`.
- [ ] **Step 7 : encadré** — créer `src/fonctionnalites/tutos/components/EncadreTuto.tsx` (maquette 9, bas de page : fond `teinte(couleur, 0.1)`, bordure `teinte(couleur, 0.4)`, pastille ronde 22 px `teinte(couleur, 0.2)` avec icône Lucide `triangle-alert` (alerte) ou `info` (info), couleur `couleurs.danger` (alerte) ou `couleurs.accent` (info), titre en gras optionnel, texte 13 px ; si `renvoi`, une `CarteRenvoi` juste sous l'encadré). Utiliser le composant d'icône existant du projet (le même que `CarteListe`) ; si `triangle-alert` ou `info` n'y sont pas enregistrées, les ajouter à la liste des icônes connues (`src/domaine/icones.ts`) comme les autres.
- [ ] **Step 8 : séparateur** — créer `src/fonctionnalites/tutos/components/SeparateurPlanB.tsx` : ligne `flexDirection: 'row'`, pastille « Plan B » (texte 12 px gras `couleurs.verdictOrange`, fond `teinte(couleurs.verdictOrange, 0.13)`, `borderRadius: 999`, padding 3 × 10), sous-titre 12 px `couleurs.texteDiscret`, puis un trait `flex: 1`, `height: 1`, `couleurs.bordure` ; marges verticales 14 / 10.
- [ ] **Step 9 : écran** — dans `src/fonctionnalites/tutos/EcranTuto.tsx` :

```tsx
      <EnTete titre={tuto.titre} sousTitre={`${tuto.duree} · ${tuto.outil}`} action="retour" />
      {tuto.encadre ? <EncadreTuto encadre={tuto.encadre} /> : null}
      <EtapesList etapes={tuto.etapes} />
      {tuto.planB ? (
        <>
          <SeparateurPlanB sousTitre={tuto.planB.sousTitre} />
          <EtapesList etapes={tuto.planB.etapes} premierNumero={tuto.etapes.length + 1} />
        </>
      ) : null}
```

- [ ] **Step 10 : vérification.** Ajouter **temporairement** à `deboucher-wc` un `encadre` alerte et un `planB` d'une étape, et à `remplir-siphon` un encadré avec `renvoi: { type: 'urgence', id: 'couper-gaz' }` ; vérifier sur le web (port 8099) que c'est conforme au bas de la maquette 9 et que le bouton ouvre « Odeur de gaz ? ». (La Tâche 6 met le vrai contenu.) `npx jest` → PASS, `npx tsc --noEmit` → 0 erreur.
- [ ] **Step 11 : commit.**

```bash
git add -A src
git commit -m "Ajoute l'encadré en haut des tutos et la partie Plan B"
```

---

### Task 6: Nouveau contenu des tutos et des pannes + documentation

**Files:**
- Rewrite: `src/donnees/tutos.ts`
- Modify: `src/donnees/diagnostics/chasse-coule.json`, `chasse-ne-marche-plus.json`, `douche-ecoule-mal.json`, `evier-bouche.json`, `odeur-egout.json`, `groupe-securite-goutte.json`, `robinet-dur.json`
- Modify: `src/donnees/gestesEtTutos.data.test.ts` (et `src/donnees/diagnostics.data.test.ts` si un test casse sur une valeur volontairement changée)
- Modify: `CLAUDE.md`, `docs/superpowers/specs/2026-09-30-depannmaison-v2-design.md` (§6 modèle, §8 contenu), `docs/contenu/tutos-v2.md`

**Interfaces:**
- Consumes: Tasks 2–5 (tous les noms de schémas, `encadre`, `planB`, `toutesLesEtapes`).
- Produces: les 10 tutos finaux.

- [ ] **Step 1 : tests de données (doivent échouer).** Dans `src/donnees/gestesEtTutos.data.test.ts` :
  - importer `toutesLesEtapes` depuis `@/domaine/etapes` ;
  - remplacer le test des 16 tutos par :

```ts
  it('contient les 10 tutos attendus', () => {
    const ids = tutos.map((t) => t.id).sort();
    expect(ids).toEqual([
      'changer-ampoule', 'changer-flexible-douche', 'changer-joint', 'changer-mecanisme-chasse',
      'deboucher-evier', 'deboucher-wc', 'detartrer-flotteur', 'detartrer-mousseur',
      'remplir-siphon', 'reparer-disjoncteur',
    ]);
  });
```

  - dans « chaque étape de tuto a un texte et un schéma connu », itérer sur `toutesLesEtapes(t)` au lieu de `t.etapes` ;
  - ajouter :

```ts
  it('chaque schéma dessiné est utilisé par un tuto', () => {
    const utilises = new Set(tutos.flatMap((t) => toutesLesEtapes(t).map(schemaEtape)));
    expect(NOMS_SCHEMAS.filter((n) => !utilises.has(n))).toEqual([]);
  });

  it('« Odeur d\'égout dans la maison » renvoie vers « Odeur de gaz ? »', () => {
    const tuto = tutos.find((t) => t.id === 'remplir-siphon')!;
    expect(tuto.titre).toBe('Odeur d\'égout dans la maison');
    expect(tuto.encadre?.renvoi).toEqual({ type: 'urgence', id: 'couper-gaz' });
  });

  it('« Déboucher des WC » : jamais de ventouse après l\'acide', () => {
    const tuto = tutos.find((t) => t.id === 'deboucher-wc')!;
    expect(tuto.etapes.map(texteEtape).join(' ')).toContain('ventouse');
    expect(tuto.planB?.etapes.map(texteEtape).join(' ')).toContain('sans utiliser la ventouse');
  });
```

  (importer `NOMS_SCHEMAS` depuis `@/domaine/etapes`). Les tests « Changer une ampoule commence par la sécurité », « siphon » et « disjoncteur » restent.
- [ ] **Step 2 :** `npx jest src/donnees` → FAIL.
- [ ] **Step 3 : réécrire `src/donnees/tutos.ts`.** Garder l'ordre ci-dessous. Les tutos `detartrer-mousseur`, `changer-flexible-douche`, `reparer-disjoncteur`, `changer-ampoule` gardent **mot pour mot** leurs textes actuels ; on ajoute seulement les schémas indiqués. Retirer tout branchement provisoire des Tâches 2 à 5.

```ts
import type { Tuto } from '@/domaine/types';

export const tutos: Tuto[] = [
  {
    id: 'deboucher-evier',
    titre: 'Déboucher un évier',
    categorie: 'plomberie',
    icone: 'waves',
    duree: '20 min',
    outil: 'seau, gants',
    etapes: [
      { texte: 'Mets un seau sous le siphon, puis dévisse la base du siphon.', schema: 'evier-devisser-siphon' },
      'Vérifie que tu n\'as pas perdu le joint.',
      {
        texte: 'Nettoie l\'intérieur avec un couteau, une cuillère ou une baguette. La plupart du temps, ça suffit.',
        schema: 'evier-nettoyer',
      },
      'Fais couler un peu d\'eau, puis revisse la base à la main.',
      'Fais couler de l\'eau très chaude. Si l\'eau s\'évacue normalement, c\'est réglé.',
    ],
    planB: {
      sousTitre: 'si le démontage n\'a pas suffi',
      etapes: [
        {
          texte: 'Ventouse : bouche le trop-plein (le petit trou en haut de l\'évier) avec une éponge, mets un peu d\'eau dans l\'évier, puis donne des à-coups. Avec une ventouse pro, alterne tirer et pousser.',
          schema: 'evier-ventouse',
        },
        {
          texte: 'Furet : si la ventouse ne marche pas, remets le seau, démonte tout le siphon et range les joints de côté.',
          schema: 'evier-demonter-siphon',
        },
        {
          texte: 'Enfonce le furet d\'environ 5 cm, bloque-le, puis tourne dans le sens des aiguilles d\'une montre. Recommence 5 cm par 5 cm jusqu\'à ce que le bouchon parte.',
          schema: 'evier-furet',
        },
        'Si c\'est toujours bouché, appelle un plombier.',
      ],
    },
  },
  {
    id: 'deboucher-wc',
    titre: 'Déboucher des WC',
    categorie: 'plomberie',
    icone: 'toilet',
    duree: '15 min',
    outil: 'gants, ventouse',
    encadre: {
      ton: 'alerte',
      titre: 'L\'eau remonte sans que tu tires la chasse ?',
      texte: 'N\'essaie rien et appelle tout de suite un plombier : c\'est sûrement le tuyau principal de l\'immeuble qui est bouché à ton niveau, et l\'eau des voisins remonte chez toi.',
    },
    etapes: [
      {
        texte: 'Tire un peu la chasse : si l\'eau s\'écoule lentement, c\'est un bouchon dans la cuvette.',
        schema: 'wc-ecoulement-lent',
      },
      { texte: 'Place la ventouse au fond de la cuvette et donne des à-coups.', schema: 'wc-ventouse' },
      'Tire la chasse. Si l\'eau part normalement, c\'est réglé.',
    ],
    planB: {
      sousTitre: 'l\'acide chlorhydrique (déboucheur WC)',
      etapes: [
        'Mets des gants et des lunettes, ouvre la fenêtre et éloigne les enfants. Ne le mélange jamais avec de l\'eau de Javel ou un autre produit.',
        {
          texte: 'Verse tout le flacon dans la cuvette et laisse agir quelques minutes, sans utiliser la ventouse.',
          schema: 'wc-acide',
        },
        'Tire la chasse. Si c\'est toujours bouché, appelle un plombier.',
      ],
    },
  },
  {
    id: 'changer-joint',
    titre: 'Changer un joint ou resserrer un raccord',
    categorie: 'plomberie',
    icone: 'wrench',
    duree: '15 min',
    outil: 'clé ou pince, kit de joints fibre',
    etapes: [
      { texte: 'Coupe l\'eau avant de toucher au raccord.', schema: 'couper-eau' },
      { texte: 'Resserre doucement le raccord qui fuit.', schema: 'raccord-resserrer' },
      'Remets l\'eau en douceur. Ne force pas trop sur le raccord, tu pourrais abîmer la tuyauterie.',
    ],
    planB: {
      sousTitre: 'changer le joint',
      etapes: [
        'Avant de commencer, achète un kit de joints fibre en magasin de bricolage.',
        { texte: 'Coupe l\'eau, puis dévisse complètement le raccord.', schema: 'raccord-devisser' },
        {
          texte: 'Enlève le joint abîmé et compare-le aux joints du kit pour trouver le même.',
          schema: 'joint-comparer',
        },
        { texte: 'Mets le nouveau joint, puis revisse fermement, sans forcer comme une brute.', schema: 'joint-remonter' },
        'Remets l\'eau en douceur. Si ça fuit toujours, coupe l\'eau et appelle un plombier.',
      ],
    },
  },
  {
    id: 'detartrer-flotteur',
    titre: 'Détartrer le robinet flotteur',
    categorie: 'plomberie',
    icone: '<icône actuelle de ce tuto, inchangée>',
    duree: '15 min',
    outil: 'pince multiprise (ou autre pince), chiffon',
    encadre: {
      ton: 'info',
      texte: 'Quand tu tires la chasse, tu entends un sifflement et le réservoir met longtemps à se remplir ? C\'est souvent le robinet flotteur qui est entartré.',
    },
    etapes: [
      'Coupe l\'eau au robinet des WC. S\'il est dur, ne force pas : coupe l\'eau générale.',
      'Ouvre le couvercle du réservoir et repère les raccords du robinet flotteur.',
      { texte: 'Dévisse sans forcer avec ta pince et sors le robinet flotteur.', schema: 'flotteur-sortir' },
      {
        texte: 'Nettoie-le avec un chiffon et de l\'eau claire. Fais attention à ne perdre aucun joint.',
        schema: 'flotteur-nettoyer',
      },
      {
        texte: 'Revisse, puis remets l\'eau. Vérifie que le remplissage s\'arrête bien avant de refermer le couvercle.',
        schema: 'reservoir-remplissage',
      },
      'Si le remplissage est normal, c\'est réparé.',
    ],
    planB: {
      sousTitre: 'la membrane est cassée',
      etapes: [
        'Si le problème continue, c\'est souvent la membrane du robinet flotteur qui est cassée. Il existe beaucoup de modèles : redémonte-le et apporte-le en magasin de bricolage pour qu\'un vendeur t\'aide à trouver la bonne membrane.',
        'Autre solution : remplace tout le robinet flotteur par un neuf. Si tu n\'es pas à l\'aise pour rebrancher l\'arrivée d\'eau, appelle un plombier.',
      ],
    },
  },
  {
    id: 'changer-mecanisme-chasse',
    titre: 'Changer le mécanisme de chasse',
    categorie: 'plomberie',
    icone: 'rotate-cw',
    duree: '1 h',
    outil: 'pince, serviette, joint ou kit de mécanisme',
    etapes: [
      {
        texte: 'Ferme le robinet d\'arrivée d\'eau des WC, puis tire la chasse pour vider le réservoir.',
        schema: 'reservoir-vidange',
      },
      'Soulève le couvercle du réservoir et pose-le à plat sur une serviette.',
      {
        texte: 'Sors le mécanisme de chasse (la colonne au milieu) : sur beaucoup de modèles, un quart de tour puis tu le soulèves.',
        schema: 'mecanisme-quart-tour',
      },
      'Retire le joint en caoutchouc sous le mécanisme et emporte-le en magasin de bricolage pour acheter le même. Nettoie le fond du réservoir, mets le joint neuf, remets le mécanisme et rouvre l\'eau.',
      'Si l\'eau ne coule plus dans la cuvette, c\'est réparé.',
    ],
    planB: {
      sousTitre: 'le mécanisme ne sort pas, ou ça coule toujours',
      etapes: [
        {
          texte: 'Ferme l\'eau, vide le réservoir, puis dévisse le tuyau qui relie le robinet d\'arrêt au robinet flotteur.',
          schema: 'tuyau-alimentation',
        },
        { texte: 'Sous le réservoir, dévisse les deux papillons, un de chaque côté.', schema: 'papillons' },
        {
          texte: 'Soulève délicatement le réservoir et retire-le de la cuvette : il est lourd et fragile.',
          schema: 'reservoir-retirer',
        },
        {
          texte: 'Dévisse les deux écrous qui tiennent les tiges filetées (là où étaient les papillons), puis dévisse le mécanisme de chasse.',
          schema: 'mecanisme-ecrou',
        },
        'Monte le nouveau mécanisme et le nouveau robinet flotteur en suivant la notice fournie.',
        'Change aussi le joint entre le réservoir et la cuvette (souvent fourni dans le kit), puis repose le réservoir. Revisse les papillons à la main, de façon égale des deux côtés, sans forcer : la céramique peut casser. Revisse le tuyau sur le robinet flotteur.',
        'Remets l\'eau et vérifie qu\'il n\'y a aucune fuite, sous le réservoir comme au niveau du tuyau. Si ça fuit encore, coupe l\'eau et appelle un plombier.',
      ],
    },
  },
  // detartrer-mousseur : textes actuels inchangés ; étape 2 → schema 'mousseur-devisser', étape 4 → schema 'mousseur-tremper'.
  {
    id: 'remplir-siphon',
    titre: 'Odeur d\'égout dans la maison',
    categorie: 'plomberie',
    icone: 'wind',
    duree: '5 min',
    outil: 'aucun',
    encadre: {
      ton: 'alerte',
      titre: 'Ça sent le gaz ?',
      texte: 'Une odeur d\'œuf pourri très forte n\'est pas un problème de siphon : suis tout de suite les consignes gaz.',
      renvoi: { type: 'urgence', id: 'couper-gaz' },
    },
    etapes: [
      'Repère d\'où vient l\'odeur : salle de bain, évier ou WC.',
      {
        texte: 'Si elle vient d\'une douche, d\'un lavabo ou d\'un évier, le siphon n\'a sûrement plus assez d\'eau. Fais couler l\'eau une bonne minute.',
        schema: 'siphon',
      },
      'Attends quelques minutes : si l\'odeur disparaît, c\'était ça. Fais couler l\'eau de temps en temps dans les points d\'eau peu utilisés.',
      'Si l\'odeur vient des WC, le tuyau d\'évacuation fuit sûrement, au niveau d\'un joint ou du tuyau lui-même. Appelle un plombier pour la réparation.',
    ],
  },
  // changer-flexible-douche : textes actuels inchangés ; étape 2 → schema 'flexible-devisser'.
  // reparer-disjoncteur : inchangé.
  // changer-ampoule : textes actuels inchangés ; étape 5 → schema 'ampoule-devisser'.
];
```

  Les commentaires `// … inchangés` ci-dessus désignent les objets actuels du fichier, à recopier tels quels avec les schémas indiqués (une étape texte `'…'` devient `{ texte: '…', schema: '…' }`). Remplacer `<icône actuelle de ce tuto, inchangée>` par la valeur actuelle de `icone` du tuto `detartrer-flotteur`. Ne pas laisser ces commentaires dans le fichier final.

- [ ] **Step 4 : pannes.** Modifier les JSON (valeurs exactes) :
  - `chasse-coule.json` : `resultat_flotteur.tutoId` → `"detartrer-flotteur"` ; `resultat_clapet.tutoId` → `"changer-mecanisme-chasse"`.
  - `chasse-ne-marche-plus.json` : supprimer la ligne `tutoId` de `resultat_tringle` (et la virgule qui précède).
  - `douche-ecoule-mal.json` : `resultat_bonde` sans `tutoId`, `conseil` : `"Ce sont presque toujours des cheveux et du savon dans la bonde. Dévisse la grille de la bonde et retire les cheveux."`
  - `evier-bouche.json` et `odeur-egout.json` : `"nettoyer-siphon"` → `"deboucher-evier"`.
  - `groupe-securite-goutte.json` : `resultat_normal` sans `tutoId` ; `resultat_pro.conseil` : `"Soit le groupe de sécurité est entartré à l'intérieur et il faut le changer, soit le chauffe-eau chauffe trop (thermostat ou contacteur jour/nuit en panne). Ne bouche jamais le groupe : le ballon pourrait exploser. Appelle un plombier."`
  - `robinet-dur.json` : réponse `"Le robinet général ou un robinet d'arrêt"` → `"Le robinet général"` ; `resultat_tete` : `"verdict": "orange"`, `"titre": "Sécurise en attendant un pro"`, `"conseil": "La tête du robinet est entartrée. Ne force pas : un plombier la nettoie ou la change rapidement."`, sans `tutoId` ; `resultat_arret.conseil` : `"Ne force jamais un robinet d'arrêt : s'il casse, tu ne pourras plus couper l'eau. Pour le changer, il faut couper l'eau de tout l'immeuble, ou parfois en amont du compteur pour une maison : c'est un travail de plombier. Pense à le manœuvrer 2 fois par an pour qu'il ne se bloque pas."`
- [ ] **Step 5 :** `npx jest` (tout) → PASS ; `npx tsc --noEmit` → 0 erreur. Si un test de `diagnostics.data.test.ts` vérifiait une valeur volontairement changée ci-dessus, l'adapter à la nouvelle valeur (et le dire dans le rapport).
- [ ] **Step 6 : documentation.**
  - `CLAUDE.md`, section Fonctionnalités, ligne Tutos : `- **Tutos** pas à pas pour les réparations faciles (10), avec des schémas animés (`src/ui/schemas/`), un encadré d'alerte ou d'info en haut si besoin et une partie « Plan B » quand la première méthode ne suffit pas.`
  - Spec §6 (modèle de données) : ajouter `Tuto.encadre?` et `Tuto.planB?` ; §8 : « 10 tutos (réécrits par André le 02/10, voir docs/contenu/tutos-v2.md) ».
  - `docs/contenu/tutos-v2.md` : sous « Tri du 02/10 », remplacer `- Total : 9 tutos.` par `- Total : 10 tutos.` ; en tête, ajouter `**Statut : intégré dans l'appli (src/donnees/tutos.ts fait foi).**`.
- [ ] **Step 7 : vérification finale sur le web (port 8099)** : les 10 tutos s'ouvrent ; chaque schéma tourne et ressemble à la maquette ; encadrés de `deboucher-wc`, `detartrer-flotteur`, `remplir-siphon` (bouton vers « Odeur de gaz ? » qui fonctionne) ; Plan B numéroté à la suite ; thème clair lisible ; diagnostics « Chasse d'eau qui coule », « Robinet dur » (deux poignées → 🟠 sans tuto), « Mauvaise odeur d'égout » (siphon encrassé → bouton « Déboucher un évier »).
- [ ] **Step 8 : commit.**

```bash
git add src CLAUDE.md docs/superpowers/specs/2026-09-30-depannmaison-v2-design.md docs/contenu/tutos-v2.md
git commit -m "Met en place les 10 tutos réécrits par André avec leurs schémas animés"
```

---

### Task 7: Renommer l'appli en Dépannéo

Décision d'André (02/10) : d'abord « ZenHome », puis le même jour « on change pour Dépannéo ». Nom affiché : **Dépannéo** ; identifiants techniques sans accent : `depanneo`.

**Files:**
- Modify: `app.json`, `package.json`, `package-lock.json` (champ `name` racine seulement : les 2 lignes `"name": "depannmaison"`)
- Modify: `src/fonctionnalites/reglages/EcranAPropos.tsx`, `src/fonctionnalites/pros/api/chercherPros.ts`, `src/fonctionnalites/pros/lib/cachePros.ts`, `src/fonctionnalites/reglages/lib/reglages.ts`
- Modify: `CLAUDE.md`, `docs/build-android.md`, `docs/superpowers/specs/2026-09-30-depannmaison-v2-design.md`
- Tests: tout test qui cite l'ancien nom ou les anciennes clés (chercher avec `git grep -n -i "depann"`)

**Interfaces:** aucune nouvelle.

- [ ] **Step 1 : chercher toutes les occurrences.** `git grep -n -i "dépann.maison\|depannmaison\|DepannMaison" -- . ':!docs/superpowers/plans'` (les anciens plans sont l'historique : on ne les touche pas ; les noms de fichiers de la spec restent aussi tels quels).
- [ ] **Step 2 : `app.json`** : `"name": "Dépannéo"`, `"slug": "depanneo"`, `"scheme": "depanneo"`, `"bundleIdentifier": "fr.depanneo.app"`, `"package": "fr.depanneo.app"`, permission de position : `"Dépannéo utilise ta position pour trouver les plombiers et électriciens proches."`.
- [ ] **Step 3 : `package.json` / `package-lock.json`** : `"name": "depanneo"` (les deux occurrences racine du lock).
- [ ] **Step 4 : code** : texte d'À propos `"Dépannéo donne des conseils, mais ne remplace pas un professionnel. …"` (reste de la phrase inchangé) ; `User-Agent` `'Depanneo/2.0'` ; clés de stockage `'depanneo.pros'` et `'depanneo.reglages'` (pas de migration : l'appli n'est pas encore publiée, seuls les réglages du téléphone d'André repartent à zéro une fois). Adapter les tests qui vérifient ces valeurs.
- [ ] **Step 5 : docs** : `CLAUDE.md` titre `# Dépannéo` ; `docs/build-android.md` titre `# Lancer Dépannéo sur ton téléphone Android` et ajouter une note : « Après le changement de nom (02/10), l'identifiant Android est devenu `fr.depanneo.app` : regénérer le dossier natif avec `npx expo prebuild --clean` avant le prochain build ; l'ancienne appli Dépann'Maison reste installée à côté et peut être désinstallée. » ; spec v2 : titre `# Dépannéo — Spec V2 (…)` (reste inchangé), et l'avertissement de la ligne « À propos » avec Dépannéo ; ajouter sous le titre de la spec : « Appli renommée Dépannéo le 02/10/2026 (anciennement Dépann'Maison). »
- [ ] **Step 6 :** `npx jest` → PASS ; `npx tsc --noEmit` → 0 erreur ; `git grep -n -i "dépann.maison\|depannmaison" -- . ':!docs/superpowers/plans'` ne renvoie plus que des noms de fichiers de spec/plan et la note historique.
- [ ] **Step 7 : commit.**

```bash
git add -A app.json package.json package-lock.json src CLAUDE.md docs/build-android.md docs/superpowers/specs
git commit -m "Renomme l'appli en Dépannéo"
```

---

### Task 8: Icône et écran de démarrage Dépannéo

Validé par André (02/10) : icône = la maison seule sur fond blanc (découpée dans `assets/logo/ZenHome-logo.jpg`) ; écran de démarrage sur fond blanc. Le logo fourni porte encore le texte « ZenHome » : en attendant un logo « Dépannéo », l'écran de démarrage montre **la maison seule** (sans texte). Version provisoire (maison de 336 px agrandie) : à remplacer par un fichier haute définition quand André le fournira.

**Files:**
- Create: `scripts/generer-icones.py` (script Python/Pillow, relançable quand André fournira un fichier plus net)
- Replace: `assets/images/icon.png`, `assets/images/android-icon-foreground.png`, `assets/images/android-icon-background.png`, `assets/images/android-icon-monochrome.png`, `assets/images/favicon.png`, `assets/images/splash-icon.png`
- Modify: `app.json` (couleurs de fond), `docs/build-android.md` (comment regénérer les icônes)

- [ ] **Step 1 : script.** `scripts/generer-icones.py` lit `assets/logo/ZenHome-logo.jpg` ; découpe la maison dans la zone `(520, 140, 885, 480)` puis resserre sur les pixels non blancs (niveau de gris inversé > 40) ; Il écrit :
  - `icon.png` 1024 × 1024, fond blanc, maison centrée occupant 62 % du côté ;
  - `android-icon-foreground.png` 1024 × 1024, fond **transparent** (pixels quasi blancs > 235 sur R, G et B → alpha 0), maison centrée occupant 58 % (zone sûre des icônes adaptatives) ;
  - `android-icon-background.png` 1024 × 1024 blanc uni ;
  - `android-icon-monochrome.png` 1024 × 1024 transparent, silhouette de la maison en noir (mêmes pixels que le foreground, couleur noire) ;
  - `favicon.png` 48 × 48 (réduction de `icon.png`) ;
  - `splash-icon.png` : la maison seule sur fond transparent (mêmes règles d'alpha), 1024 × 1024, maison occupant 80 %.
- [ ] **Step 2 :** lancer `python scripts/generer-icones.py`, ouvrir chaque image produite et vérifier : pas de bord coupé, pas de halo gris, maison bien centrée.
- [ ] **Step 3 : `app.json`** : `android.adaptiveIcon.backgroundColor` → `"#FFFFFF"` ; plugin `expo-splash-screen` : `"backgroundColor": "#FFFFFF"`, `"imageWidth": 160`. (Rester sans `dark` pour l'écran de démarrage : fond blanc dans les deux thèmes, choix d'André.)
- [ ] **Step 4 :** `npx jest` → PASS (aucun test ne dépend des images) ; vérifier le favicon sur le web (port 8099).
- [ ] **Step 5 : doc** — `docs/build-android.md` : section « Icône et écran de démarrage » : « Les images de `assets/images/` sont générées depuis `assets/logo/` par `python scripts/generer-icones.py` (Pillow). Pour une icône plus nette, remplacer le fichier du logo puis relancer le script et `npx expo prebuild --clean`. »
- [ ] **Step 6 : commit.**

```bash
git add scripts/generer-icones.py assets/images assets/logo app.json docs/build-android.md
git commit -m "Ajoute l'icône et l'écran de démarrage Dépannéo"
```
