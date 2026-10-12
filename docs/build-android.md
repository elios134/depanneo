# Lancer Dépannéo sur ton téléphone Android

> Après le changement de nom (02/10), l'identifiant Android est devenu `fr.depanneo.app` : regénérer le dossier natif avec `npx expo prebuild --clean` avant le prochain build ; l'ancienne appli Dépann'Maison reste installée à côté et peut être désinstallée.

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
5. Les fois suivantes : lance `npx expo start`, puis appuie sur `a` dans le terminal : l'appli déjà installée s'ouvre sur ton téléphone branché.

**Si ça bloque** : la première compilation peut échouer si Windows ne trouve pas Java ou le SDK. Dans Android Studio, ouvre *Settings → Build Tools → Gradle* pour repérer le JDK, et vérifie que la variable d'environnement `ANDROID_HOME` pointe vers le SDK (souvent `C:\Users\<toi>\AppData\Local\Android\Sdk`). À noter : `npx expo run:android` crée un dossier `android/` ignoré par git (c'est normal). Solution rapide : créer le fichier `android/local.properties` avec la ligne `sdk.dir=C:/Users/<toi>/AppData/Local/Android/Sdk` (barres obliques `/`).

## Option 2 — En ligne avec EAS (compte Expo gratuit, sans Android Studio)

Tu obtiens un APK de test autonome (sans rechargement en direct).

1. `npm install -g eas-cli` puis `eas login` (compte Expo gratuit).
2. `eas build:configure` (crée le fichier `eas.json`).
3. Dans `eas.json`, dans le profil `preview`, ajoute `"android": { "buildType": "apk" }`.
4. `eas build --platform android --profile preview`, puis installe l'APK reçu par lien.

Cette version est autonome (elle n'a pas besoin de ton PC), mais chaque changement demande un nouveau build ; pour développer, préfère l'option 1.

## À vérifier sur le téléphone
- L'appli demande la permission de localisation au premier lancement.
- La carte s'affiche (sombre ou claire selon le thème) avec ton point bleu et les pros proches.
- Mode avion : bandeau « Hors connexion », la dernière liste de pros reste affichée.
- Refuser la localisation : le champ « Ta ville ou ton code postal » apparaît.

## Tests de bout en bout (Maestro)

Huit scénarios (dossier `e2e/`) ouvrent la vraie appli sur un téléphone ou un émulateur et vérifient les parcours importants : diagnostic WC, gaz, urgence eau, tuto avec Plan B, panneau de l'accueil, mon logement, qui paie, onglet Pros (`pros.yaml` : nécessite le réseau ; peut prendre jusqu'à une minute). Ils tournent sur la version de production (APK release), sans serveur Metro.

1. Installer Maestro une fois : voir https://maestro.mobile.dev (`maestro --version` doit répondre).
2. Brancher le téléphone (débogage USB) ou lancer un émulateur ; `adb devices` doit le lister.
3. Construire l'APK release : `cd android && ./gradlew assembleRelease`.
4. L'installer : `adb install -r app/build/outputs/apk/release/app-release.apk` (depuis le dossier `android`).
5. Lancer les scénarios depuis la racine du projet : `npm run e2e`.

Chaque scénario repart d'une appli neuve (`clearState`) et refuse la localisation si elle est demandée.

## Suivi des plantages (Sentry)

Sentry prévient André quand l'appli plante chez quelqu'un. Il ne fonctionne que dans une version de production (jamais en développement) et seulement si un DSN est fourni.

1. Créer un compte gratuit sur sentry.io.
2. Créer un projet de type « React Native ».
3. Copier le DSN (une adresse qui commence par `https://`) dans un fichier `.env.local` à la racine : `EXPO_PUBLIC_SENTRY_DSN=ton-dsn` (modèle : `.env.example`). Ce fichier n'est pas versionné.
4. Dans les réglages du projet Sentry, activer « Prevent Storing of IP Addresses » (ne pas stocker les adresses IP).
5. Refaire un build de production (voir ci-dessus) : le DSN est lu au moment du build.

Le plugin `plugins/sentry-sans-envoi.js` (déclaré dans `app.json`) coupe l'envoi automatique des source maps à chaque build release, pour que `gradlew assembleRelease` fonctionne sans compte Sentry. Il réécrit `android/app/build.gradle` à chaque `prebuild`. Cela ne concerne qu'Android : iOS n'est pas visé pour l'instant.

Aucune donnée personnelle n'est envoyée : ni position, ni recherche de ville (ces appels réseau sont retirés des traces). Les source maps ne sont pas envoyées pour l'instant.

## Icône et écran de démarrage

Les images de `assets/images/` sont générées depuis `assets/logo/Depanneo-logo.jpg` (le logo d'André, où « ZenHome » a été remplacé par « Dépannéo ») par `python scripts/generer-icones.py` (Pillow). Pour une icône plus nette, remplacer le fichier du logo puis relancer le script et `npx expo prebuild --clean`. L'icône utilise la maison seule ; l'écran de démarrage, le logo complet (maison + nom).
