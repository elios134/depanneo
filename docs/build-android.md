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
