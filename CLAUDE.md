# Dépannéo

## L'idée en une phrase
Une appli mobile grand public qui aide les gens face à une panne de **plomberie sanitaire** ou d'**électricité basique** à la maison : diagnostic simple, gestes d'urgence, mini-tutos, et les plombiers/électriciens les plus proches sur une carte.

## Contexte
- Projet portfolio d'André, développeur solo en reconversion.
- André a ~10 ans d'expérience terrain (apprenti plombier, puis technicien multiservice pour des bailleurs sociaux). Le contenu des diagnostics s'appuie sur ce vécu réel.
- But : montrer une appli complète, utile et compréhensible par n'importe quel recruteur.

## Public visé
Particuliers, locataires et propriétaires, sans connaissance technique. Tout doit être compréhensible par quelqu'un qui n'a jamais ouvert une boîte à outils.

## Fonctionnalités
- **Diagnostic guidé** (22 pannes : 16 plomberie, 6 électricité) → verdict 🟢 je peux réparer / 🟠 je sécurise en attendant / 🔴 j'appelle un pro tout de suite. Un résultat peut renvoyer vers un autre diagnostic ou vers « Odeur de gaz ? » (champ `renvoi`).
- **Urgences** (onglet dédié, 1 appui depuis partout) : couper l'eau, couper le courant, « Odeur de gaz ? » (filet de sécurité : consignes + numéro d'urgence gaz), numéros utiles.
- **Tutos** pas à pas pour les réparations faciles (10), avec des schémas animés (`src/ui/schemas/`), un encadré d'alerte ou d'info en haut si besoin et une partie « Plan B » quand la première méthode ne suffit pas.
- **Carte des pros** (OpenStreetMap) : plombiers et électriciens proches, appel en 1 appui.
- **Réglages** : thème sombre/clair/auto, rayon de recherche, localisation.
- Le diagnostic, les urgences et les tutos **fonctionnent sans réseau**.
- Plus tard : annuaire de pros partenaires, carnet d'entretien, photo analysée par IA.

## Stack technique
- React Native + Expo (Expo Router), TypeScript strict.
- Design : style SC Fleet Manager (sombre, verre dépoli, barre de navigation flottante), icônes Lucide.
- Données des pannes : JSON embarqués. Carte : MapLibre + OpenFreeMap. Pros : Overpass (OpenStreetMap).
- Carte native : l'appli ne tourne plus dans Expo Go ; build de développement nécessaire (voir `docs/build-android.md`). La prévisualisation web affiche un fond de carte factice.

## Architecture du code
- `app/` = routes uniquement (fichiers ≤ 30 lignes). Écrans dans `src/fonctionnalites/<nom>/`, partagé (≥ 2 fonctionnalités) dans `src/ui/`, thème dans `src/theme/`, types et moteur dans `src/domaine/`, données dans `src/donnees/`.
- Tailles cibles : composant 80–150 lignes (plafond ~250), écran 150–250 (~350), hook/lib 100–200 (~300).
- Aucune couleur en dur hors de `src/theme/` (un test le vérifie). Logique pure dans `lib/`, testée ; tests à côté du fichier.
- Types des routes (Expo Router) : régénérer avec `npx expo start` ; ne pas utiliser `npx expo export` pour préparer `tsc` (il génère des types pollués).
- Spec de référence : `docs/superpowers/specs/2026-09-30-depannmaison-v2-design.md`.

## Règles de sécurité (important)
- Ne jamais inciter à une intervention dangereuse (gaz, tableau électrique ouvert, travaux en hauteur) : toujours renvoyer vers un pro.
- Tout ce qui touche au gaz = verdict 🔴 + numéro d'urgence gaz.
- Afficher un avertissement : l'appli donne des conseils, elle ne remplace pas un professionnel.

## Règles de travail pour Claude Code
- Tout en français : interface, commentaires, messages de commit (simples, sans jargon).
- Diagnostiquer avant de coder ; distinguer « ça compile » et « ça marche vraiment ».
- Si une approche échoue deux fois : s'arrêter et proposer de prendre du recul.
- Faire soi-même les vérifications possibles (lire les fichiers, explorer le projet) au lieu de les demander à André.
- Avancer par petites étapes testables.
- Aucun écran ni changement visuel sans maquette validée par André (maquettes dans `docs/design/`).
- Périmètre : plomberie sanitaire + électricité basique ; le gaz se limite au filet de sécurité de l'onglet Urgences.
