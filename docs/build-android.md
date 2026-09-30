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
