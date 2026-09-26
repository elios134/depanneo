# Dépann'Maison

## L'idée en une phrase
Une appli mobile grand public qui aide les gens à réagir face à une panne à la maison (fuite, chauffe-eau, disjoncteur, WC bouché…) : diagnostic simple, gestes d'urgence, et conseil clair entre « je répare moi-même » ou « j'appelle un pro ».

## Contexte
- Projet portfolio d'André, développeur solo en reconversion.
- André a ~10 ans d'expérience terrain (apprenti plombier, puis technicien multiservice pour des bailleurs sociaux). Le contenu des diagnostics s'appuie sur ce vécu réel.
- But : montrer une appli complète, utile et compréhensible par n'importe quel recruteur.

## Public visé
Particuliers, locataires et propriétaires, sans connaissance technique. Tout doit être compréhensible par quelqu'un qui n'a jamais ouvert une boîte à outils.

## Fonctionnalités

### MVP (version 1)
1. **Diagnostic guidé** : questions simples étape par étape (« L'eau coule d'où ? ») sous forme d'arbre de décision → résultat.
2. **Gestes d'urgence** : couper l'eau, couper le courant, couper le gaz. Étapes illustrées, accessibles en 1 clic depuis l'accueil.
3. **Verdict clair** : 🟢 je peux réparer / 🟠 je peux sécuriser en attendant / 🔴 j'appelle un pro tout de suite.
4. **Mini-tutos** pour les réparations faciles (déboucher un évier, changer un joint, réarmer un disjoncteur).
5. **Fonctionne sans réseau** : les diagnostics et gestes d'urgence sont stockés dans l'appli (panne en cave, coupure internet…).

### Version 2 (plus tard)
- **Carnet d'entretien du logement** : équipements de la maison + rappels (détartrage chauffe-eau, révision chaudière annuelle…).
- **Photo analysée par IA** : l'utilisateur prend la panne en photo, l'IA propose une piste de diagnostic.
- Compte utilisateur + sauvegarde en ligne du carnet.

## Stack technique
- **Mobile** : React Native + Expo, TypeScript.
- **Serveur (V2)** : Node.js + TypeScript (comptes, sauvegarde, appel IA).
- **Données des diagnostics** : fichiers JSON (arbres de décision) embarqués dans l'appli, pour marcher hors-ligne.

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
