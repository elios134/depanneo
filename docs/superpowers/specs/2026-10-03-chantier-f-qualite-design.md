# Chantier F — Qualité (spec)

Validée par André le 03/10/2026. Premier des 4 chantiers d'amélioration (ordre : F qualité, D métier, E fidélité, G stores).

## Objectif

Rendre l'appli plus sûre à faire évoluer et montrable à un recruteur : dépôt GitHub public avec vérification automatique, tests de bout en bout, suivi des plantages en production, schémas animés plus économes. Rien ne change visuellement pour l'utilisateur.

## 1. GitHub et vérification automatique (CI)

- Dépôt **public** `elios134/depanneo` (compte GitHub déjà connecté sur le PC). Création et premier envoi **uniquement après l'accord explicite d'André** au moment de publier.
- Avant publication : vérifier qu'aucun secret n'est suivi par git (aucun trouvé au 03/10) et que `vidéo-tuto/`, `android/`, `.env*.local` restent ignorés.
- Lint : le projet n'a pas encore d'ESLint configuré. Ajouter `eslint` + `eslint-config-expo` (configuration « flat » `eslint.config.js`, celle que crée `expo lint`), puis corriger les erreurs remontées (sans changer le comportement).
- Workflow GitHub Actions `.github/workflows/verification.yml`, déclenché à chaque envoi et à chaque pull request sur `main` :
  1. Node 22, `npm ci` (avec cache npm) ;
  2. `npx tsc --noEmit` ;
  3. `npx expo lint` ;
  4. `npx jest --ci`.
  Durée visée : ~3 minutes. Pas d'émulateur Android dans la CI.
- Types des routes Expo Router : `.expo/` et `expo-env.d.ts` ne sont pas versionnés. Vérifié le 03/10 : `tsc` passe sans `.expo/types`. La CI lance donc `tsc` directement ; si un jour il échoue faute de ces fichiers, le premier passage de la CI le montrera et on versionnera `expo-env.d.ts`.
- README : pastille d'état de la vérification (badge GitHub Actions) sous le titre.

## 2. Tests de bout en bout (Maestro)

- Outil : **Maestro** (scénarios YAML lisibles). Lancés **en local** sur le téléphone d'André ou un émulateur, contre la **version de production** (APK release, JS embarqué, pas de serveur Metro).
- Dossier `e2e/`, cinq scénarios :
  1. `diagnostic-wc.yaml` — Accueil → « Diagnostiquer une panne » → « WC bouché » → réponses menant au verdict 🟢 → bouton du tuto → l'écran « Déboucher des WC » s'ouvre.
  2. `gaz.yaml` — « Mauvaise odeur d'égout » → « Oui » (odeur de gaz) → verdict 🔴, carte « Odeur de gaz ? » visible, **aucune carte de pro** → la carte ouvre la fiche « Odeur de gaz ? » avec le numéro 0800 47 33 33.
  3. `urgence-eau.yaml` — onglet Urgences → « Couper l'eau » → consignes affichées.
  4. `tuto-plan-b.yaml` — Tutos → « Déboucher des WC » → encadré d'alerte visible → défiler jusqu'au séparateur « Plan B » et l'étape 4.
  5. `accueil-panneau.yaml` — Accueil → appui sur la poignée → la liste des pros disparaît, la ligne « … pros près de toi » / « Afficher les pros » apparaît → appui dessus → le panneau est rouvert.
- Repères : ajouter des `testID` stables (en français, ex. `bouton-diagnostiquer`, `poignee-panneau`, `carte-renvoi`) là où le texte seul ne suffit pas ; pas de changement visuel.
- Les scénarios 1 et 5 ne doivent pas dépendre du réseau ni de la position (refus ou absence de position accepté).
- Script `npm run e2e` (→ `maestro test e2e/`) et section « Tests de bout en bout » dans `docs/build-android.md` : installer Maestro (une fois), construire et installer l'APK release (commande Gradle + adb déjà utilisée), lancer les scénarios.

## 3. Suivi des plantages (Sentry)

- Bibliothèque `@sentry/react-native` avec son plugin Expo.
- **Actif uniquement en production** (`!__DEV__`) : rien n'est envoyé pendant le développement ni pendant les tests Jest.
- La clé publique Sentry (DSN) n'est **pas écrite dans le code** : variable `EXPO_PUBLIC_SENTRY_DSN` lue depuis `.env.local` (non versionné) en local et depuis les secrets GitHub plus tard. Sans DSN, Sentry ne s'initialise pas et l'appli fonctionne normalement.
- Données envoyées : l'erreur, sa pile d'appels, la version de l'appli et le modèle/OS du téléphone. **Jamais** la position, l'adresse saisie, les pros consultés ni d'identifiant personnel (`sendDefaultPii: false`, pas de fil d'Ariane réseau contenant des coordonnées : filtrer les URL Overpass/géocodage dans `beforeBreadcrumb`).
- Envoi des « source maps » (pour lire les erreurs) : non inclus dans ce chantier (demande un jeton secret) ; à faire au chantier G.
- André crée lui-même le compte gratuit sur sentry.io et colle le DSN dans `.env.local` ; un fichier `.env.example` (versionné) montre le nom de la variable.
- Test : une fonction pure `nettoyerFilAriane` (filtre des URL) testée avec Jest ; l'initialisation est isolée dans `src/surveillance/` (ou équivalent) pour rester hors des écrans.

## 4. Fluidité des schémas animés

- Un schéma **hors de l'écran ne s'anime plus** ; il reprend quand il redevient visible (même au moins partiellement).
- Les schémas visibles passent de ~30 à **~24 images par seconde** (`PAS_MS` 33 → 42).
- Approche : le `ScrollView` de `FondEcran` publie, via un contexte React, la zone visible (défilement + hauteur) ; chaque `SchemaAnime` mesure sa position (`onLayout` / `measure`) et calcule s'il est visible avec une fonction pure testée `estVisible(haut, bas, debutVue, finVue)`. `useTempsBoucle` reçoit déjà un paramètre `actif` : on y ajoute la visibilité. Sans contexte (ex. écran non défilant), le schéma reste actif comme aujourd'hui.
- Aucun changement visuel ; le mouvement réduit et la pause hors focus existants restent inchangés.

## Hors périmètre

- Émulateur Android dans la CI, envoi des source maps Sentry, publication sur les stores (chantier G).

## Vérification

- `tsc`, `expo lint`, `jest` verts en local et dans GitHub Actions (premier passage vert visible sur le dépôt).
- Les 5 scénarios Maestro passent sur le téléphone d'André avec l'APK release.
- Une erreur volontaire (déclenchée temporairement en production locale) apparaît dans Sentry, sans donnée personnelle ; puis retirée.
- Sur « Changer le mécanisme de chasse », seuls les schémas visibles bougent (vérifié en défilant).
