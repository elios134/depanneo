# Chantier D — Ton métier — plan d'implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** « Qui paie ? » (statut locataire/propriétaire + bloc sur chaque résultat), « Mon logement » (4 emplacements photo + phrase, affichés dans les gestes d'urgence), « Envoyer au plombier » (message + photo via le partage du téléphone).

**Architecture:** Données et logique pures dans `src/domaine/` et les `lib/` des fonctionnalités (testées Jest) ; écrans dans `src/fonctionnalites/` ; routes minces dans `app/`. Stockage local AsyncStorage + dossier documents de l'appli ; aucun serveur.

**Tech Stack:** Expo SDK 57, React Native 0.86, Expo Router, TypeScript strict, Jest, ESLint (0/0), Maestro ; nouvelles libs : `expo-image-picker`, `expo-file-system`, `react-native-share` (repli `expo-sharing`).

**Spec:** `docs/superpowers/specs/2026-10-03-chantier-d-metier-design.md` · **Maquette:** `docs/design/maquettes-v2/12-chantier-d.html` · **Contenu:** `docs/contenu/qui-paie.md`

## Global Constraints

- Tout en français (interface, noms métier, commentaires, commits) ; commit terminé par une ligne vide puis `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- Aucune couleur en dur hors de `src/theme/` ; icônes Lucide via `src/ui/Icone.tsx` (ajouter un nom à `src/domaine/icones.ts` + `Icone.tsx` si besoin, comme `info`).
- Visuels **conformes à la maquette 12** (structure, textes, ordre) ; réutiliser `CarteListe`, `BoutonPrincipal`, `FondEcran`, `EnTete`, `Verre`.
- `app/` = routes seulement (≤ 30 lignes). Logique pure testée, test à côté du fichier. Tailles : composant ≤ ~250 lignes, écran ≤ ~350.
- Sécurité : sur un verdict rouge, rien ne passe avant les consignes/numéro d'urgence ; le bloc « Chez toi » du gaz ne remplace jamais les consignes.
- Vie privée : photos et notes uniquement sur le téléphone ; la position n'est jamais mise dans le message.
- Vérifs à chaque tâche : `npx tsc --noEmit`, `npx expo lint` (0 erreur, 0 avertissement), `npx jest`. Libs natives : `npx expo install <lib>`. Jamais `npx expo export` / `prebuild` ; ne pas toucher `android/` ; ne rien pousser.

---

### Task 1: « Qui paie ? » — données, statut, logique pure

**Files:** `src/domaine/types.ts` (types), `src/domaine/quiPaie.ts` + `quiPaie.test.ts` (créer), les 22 `src/donnees/diagnostics/*.json`, `src/donnees/diagnostics.data.test.ts`, `src/fonctionnalites/reglages/lib/reglages.ts` + test.

**Interfaces (produites):**
```ts
// src/domaine/types.ts
export type QuiPaie = 'locataire' | 'proprietaire' | 'depend' | 'autre';
export interface InfoQuiPaie { qui: QuiPaie; phrase: string }
// Resultat gagne : quiPaie: InfoQuiPaie;   (obligatoire)
// src/fonctionnalites/reglages/lib/reglages.ts
export type StatutLogement = 'locataire' | 'proprietaire' | 'non-precise';
// Reglages gagne : statutLogement: StatutLogement | null;   (REGLAGES_DEFAUT : null ; lecture tolérante : valeur inconnue → null)
// src/domaine/quiPaie.ts
export type TonQuiPaie = 'vert' | 'orange' | 'neutre';
export function titreQuiPaie(qui: QuiPaie, statut: 'locataire' | 'proprietaire' | 'non-precise' | null): { titre: string; ton: TonQuiPaie };
```
(`statut` null est traité comme `non-precise`.)

- [ ] **Step 1 — test `titreQuiPaie` (12 cas, doivent échouer)**, exactement le tableau de la spec §1 « Affichage » :
  locataire+locataire → « À ta charge »/vert ; locataire+proprietaire → « À ta charge »/vert ; locataire+non-precise → « Locataire : entretien courant »/neutre ;
  proprietaire+locataire → « À la charge du propriétaire : préviens-le »/orange ; proprietaire+proprietaire → « À ta charge »/vert ; proprietaire+non-precise → « Propriétaire »/neutre ;
  depend+locataire → « Ça dépend de la cause »/neutre ; depend+proprietaire → « À ta charge »/vert ; depend+non-precise → « Ça dépend de la cause »/neutre ;
  autre+(tous) → « Un autre organisme s'en occupe »/neutre ; plus un cas `null` ≡ non-precise.
- [ ] **Step 2** : implémenter `titreQuiPaie` (switch simple, typé) → PASS.
- [ ] **Step 3 — données** : ajouter `"quiPaie": { "qui": …, "phrase": … }` à **chacun** des 68 résultats, valeurs **mot pour mot** depuis `docs/contenu/qui-paie.md` (L→locataire, P→proprietaire, D→depend, A→autre ; apostrophes typographiques identiques au fichier). Écrire un petit script Node jetable (non versionné, dans le scratchpad/temp) qui lit le tableau Markdown et insère les champs, puis vérifier le diff.
- [ ] **Step 4 — test de données** dans `diagnostics.data.test.ts` : chaque résultat de chaque diagnostic a `quiPaie.qui` dans les 4 valeurs et `quiPaie.phrase` non vide ; et `odeur-egout.resultat_gaz.quiPaie.qui === 'autre'`.
- [ ] **Step 5 — réglage** `statutLogement` : type, défaut `null`, lecture tolérante (+ tests : valeur valide relue, valeur inconnue → null, absent → null), écriture.
- [ ] **Step 6** : tsc/lint/jest verts ; commit « Ajoute les données « Qui paie ? » et le statut locataire/propriétaire ».

---

### Task 2: « Qui paie ? » — affichage, premier lancement, Réglages

**Files:** `src/fonctionnalites/diagnostic/components/BlocQuiPaie.tsx` (créer), `CarteResultat.tsx`, `src/fonctionnalites/bienvenue/QuestionStatut.tsx` (créer), `app/_layout.tsx`, `src/fonctionnalites/reglages/EcranReglages.tsx`.

**Interfaces:** consomme `titreQuiPaie`, `InfoQuiPaie`, `useReglages()` (`reglages.statutLogement`, `modifier`, `charge`).

- [ ] **Step 1 — `BlocQuiPaie`** (maquette écran 2) : carte discrète (fond `carte`, bordure `bordure`, rayon 12), ligne « € Qui paie ? » + titre coloré selon `ton` (vert `verdictVert`, orange `verdictOrange`, neutre `texte`), puis la phrase en `texteDiscret`. Icône : ajouter `euro` (Lucide `Euro`) aux icônes connues. `testID="bloc-qui-paie"`.
- [ ] **Step 2 — `CarteResultat`** : insérer le bloc juste **sous le conseil** pour les verdicts vert et orange ; pour **rouge**, le placer **à la fin des actions** (après numéro, pros, geste). Ne rien changer d'autre à l'ordre.
- [ ] **Step 3 — `QuestionStatut`** (écran 1) : plein écran par-dessus l'appli (fond `FondEcran` non défilant ou vue absolue avec fond `fond` + halos du thème), titre « Une dernière chose », texte « Tu es locataire ou propriétaire ? » + « Ça sert à te dire qui paie la réparation. », boutons « Je suis locataire » (accent, `testID="statut-locataire"`), « Je suis propriétaire » (discret, `statut-proprietaire`), lien « Je préfère ne pas dire » (`statut-non-precise`). Chaque choix appelle `modifier({ statutLogement })`. Affiché seulement si `charge && statutLogement === null`. Pas de fermeture sans choix. Le bouton retour Android ne le ferme pas.
- [ ] **Step 4 — `app/_layout.tsx`** : rendre `<QuestionStatut />` après la `Stack` (dans les providers) ; rester ≤ 30 lignes.
- [ ] **Step 5 — Réglages** : nouvelle ligne « Je suis… » avec 3 choix (locataire / propriétaire / je préfère ne pas dire), même composant/style que les choix de thème ou de rayon existants.
- [ ] **Step 6** : tsc/lint/jest verts ; commit « Affiche « Qui paie ? » et demande le statut au premier lancement ».

---

### Task 3: Envoyer au plombier

**Files:** `src/fonctionnalites/diagnostic/lib/parcours.ts` + test, `hooks/useParcoursDiagnostic.ts`, `src/fonctionnalites/diagnostic/lib/message.ts` + `message.test.ts` (créer), `src/fonctionnalites/diagnostic/EcranEnvoyer.tsx` (créer), `app/(onglets)/(accueil)/diagnostic/envoyer.tsx` (créer, route mince), `CarteResultat.tsx`, `EcranDiagnostic.tsx`, `app.json` (permissions), `package.json`.

**Interfaces:**
```ts
// parcours.ts
export interface EtatParcours { historique: string[]; choix: number[] } // choix[i] = indice de la réponse choisie à la question historique[i]
export function repondre(etat: EtatParcours, indice: number, suite: string): EtatParcours; // ajoute suite ET indice
// precedente retire la dernière étape ET le dernier choix ; demarrer → choix: []
export function reponsesChoisies(diag: Diagnostic, etat: EtatParcours): string[]; // textes des réponses choisies, dans l'ordre
// message.ts
export function messagePlombier(diag: Diagnostic, reponses: string[], resultat: Resultat): string;
```
- [ ] **Step 1 — tests parcours (échouent)** : `repondre` mémorise l'indice ; `precedente` retire étape + choix ; `reponsesChoisies` rend les bons textes même quand deux réponses mènent à la même suite (cas : réponse « Je ne sais pas » `inconnu` et une autre vers le même résultat → c'est bien le texte cliqué). Adapter les tests existants à la nouvelle signature.
- [ ] **Step 2** : implémenter ; `CarteQuestion`/hook passent l'indice de la réponse touchée. PASS.
- [ ] **Step 3 — test `messagePlombier`** (échoue) : format exact de la spec §3 :
  ```
  Chasse d'eau qui coule en continu
  • Non, elle coule au fond vers la cuvette
  Verdict : Tu peux réparer (Le joint du clapet, au fond du réservoir, est usé ou entartré.)
  Envoyé depuis Dépannéo
  ```
  Libellé du verdict = libellé du `VerdictBadge` (vert « Tu peux réparer », orange et rouge : reprendre les libellés exacts de `src/ui/VerdictBadge.tsx`, les exporter si besoin) ; conseil = première phrase (jusqu'au premier « . » inclus, ou tout le conseil s'il n'y en a pas). Aucune position.
- [ ] **Step 4** : implémenter → PASS.
- [ ] **Step 5 — partage** : `npx expo install react-native-share` ; vérifier qu'il compile sans plugin spécial pour Android (lire sa doc dans `node_modules`) ; si un plugin/config est requis et incompatible → repli `npx expo install expo-sharing expo-clipboard` (photo partagée seule + texte copié, message « Texte copié, colle-le dans ton message »). Décrire le choix dans le rapport. `npx expo install expo-image-picker expo-file-system` ; textes de permission en français dans `app.json` (plugin `expo-image-picker` : `photosPermission` « Dépannéo utilise tes photos pour joindre une photo de la panne ou de ton logement. », `cameraPermission` « Dépannéo utilise l'appareil photo pour photographier la panne ou ton logement. »).
- [ ] **Step 6 — écran `EcranEnvoyer`** (maquette écran 6) : reçoit `id` (diagnostic) et `choix` (indices séparés par des virgules) en paramètres de route ; reconstruit l'état et le résultat ; zone photo (aperçu + « × » pour retirer) ; liens « + Ajouter une photo de la panne » (choix appareil/galerie via `Alert` à 2 options + annuler) ; aperçu du message dans une carte ; bouton « Partager… » (`testID="bouton-partager"`) ; texte « Ouvre SMS, WhatsApp, e-mail… Rien ne passe par un serveur. ». Permission refusée → message clair, pas de plantage.
- [ ] **Step 7 — bouton** « Envoyer au plombier » sur `CarteResultat` (variante discrète, icône `share` — ajouter si besoin, `testID="bouton-envoyer-plombier"`) : vert/orange après le tuto et avant les pros ; rouge à la fin. `EcranDiagnostic` fournit l'état du parcours (choix) à `CarteResultat` pour naviguer vers `/diagnostic/envoyer?id=…&choix=…`.
- [ ] **Step 8** : tsc/lint/jest verts ; commit « Ajoute l'envoi du diagnostic au plombier ».

---

### Task 4: Mon logement

**Files:** `src/fonctionnalites/logement/lib/logement.ts` + test (créer), `src/fonctionnalites/logement/LogementProvider.tsx` (créer, contexte comme `ReglagesProvider`), `src/fonctionnalites/logement/EcranLogement.tsx`, `EcranEmplacement.tsx`, `components/ChezToi.tsx` (créer), routes `app/(onglets)/urgences/logement/index.tsx` et `app/(onglets)/urgences/logement/[emplacement].tsx` (+ `_layout` si nécessaire), `app/_layout.tsx` (provider), `EcranUrgences.tsx`, `EcranGeste.tsx`.

**Interfaces:**
```ts
export type Emplacement = 'robinet-eau' | 'tableau' | 'robinet-gaz' | 'chauffe-eau';
export const EMPLACEMENTS: { id: Emplacement; titre: string }[]; // titres : « Robinet d'arrêt général », « Tableau électrique », « Robinet de gaz », « Chauffe-eau / groupe de sécurité »
export interface InfoEmplacement { photo?: string; note?: string } // photo = URI dans le dossier documents de l'appli
export type Logement = Partial<Record<Emplacement, InfoEmplacement>>;
export const CLE_LOGEMENT = 'depanneo.logement';
export function lireLogement(brut: string | null): Logement;          // tolérant
export function ecrireLogement(l: Logement): string;
export function estRenseigne(info: InfoEmplacement | undefined): boolean; // photo ou note non vide
export function resumeLogement(l: Logement): string;                   // « 2 emplacements sur 4 enregistrés » / « 1 emplacement sur 4 enregistré » / « Aucun emplacement enregistré »
export function emplacementDuGeste(idGeste: string): Emplacement | null; // couper-eau→robinet-eau, couper-courant→tableau, couper-gaz→robinet-gaz
export const NOTE_MAX = 120;
```
- [ ] **Step 1 — tests lib** (échouent) : lecture tolérante (JSON cassé, emplacement inconnu ignoré, note tronquée à 120), `estRenseigne`, `resumeLogement` (0, 1, 2, 4), `emplacementDuGeste`. **Step 2** : implémenter → PASS.
- [ ] **Step 3 — provider** : charge/écrit AsyncStorage ; `enregistrer(emplacement, info)` copie une nouvelle photo dans `FileSystem.documentDirectory + 'logement/'` (nom = emplacement + horodatage), supprime l'ancienne photo remplacée ; `supprimer(emplacement)` efface photo + entrée.
- [ ] **Step 4 — écrans** (maquette écrans 3-5) : carte « Mon logement » en tête d'`EcranUrgences` (`CarteListe` grande, icône `house`, sous-titre `resumeLogement`, `testID="carte-mon-logement"`) ; `EcranLogement` (4 lignes vignette/« + photo », titre, note ou « À ajouter », rappel vie privée) ; `EcranEmplacement` (photo : prendre / choisir / supprimer ; champ note 120 car. `testID="champ-note"` ; boutons « Enregistrer » `testID="bouton-enregistrer"` et « Supprimer l'emplacement ») ; `ChezToi` dans `EcranGeste` **avant** les étapes si renseigné (`testID="chez-toi"`), sinon lien discret « Enregistrer l'emplacement » vers l'édition ; pour `couper-gaz`, le numéro reste affiché comme aujourd'hui.
- [ ] **Step 5** : tsc/lint/jest verts ; commit « Ajoute « Mon logement » et l'affiche dans les gestes d'urgence ».

---

### Task 5: Maestro et documentation

**Files:** `e2e/*.yaml` (existants + nouveaux), `e2e/sous-flux/premier-lancement.yaml` (créer), `CLAUDE.md` (Fonctionnalités), `README.md`, spec v2 §5/§6 si utile.

- [ ] **Step 1** : sous-flux `premier-lancement.yaml` : après `launchApp clearState`, refus optionnel de localisation (comme aujourd'hui) puis `tapOn id: statut-locataire` (optionnel si l'écran n'apparaît pas). L'utiliser (`runFlow`) au début des 5 scénarios existants.
- [ ] **Step 2** : nouveaux scénarios : `qui-paie.yaml` (WC bouché → réponses vers le résultat ventouse → `bloc-qui-paie` visible et texte « À ta charge ») ; `logement.yaml` (Urgences → `carte-mon-logement` → « Robinet d'arrêt général » → note « Sous l'évier » → Enregistrer → retour → « Couper l'eau » → `chez-toi` visible avec « Sous l'évier »). Pas de photo (appareil photo non piloté).
- [ ] **Step 3** : `CLAUDE.md` (Fonctionnalités : ajouter « Qui paie ? », « Mon logement », « Envoyer au plombier »), README (Fonctionnalités).
- [ ] **Step 4** : tsc/lint/jest verts ; commit « Ajoute les scénarios Maestro du chantier D et met à jour la doc ».
