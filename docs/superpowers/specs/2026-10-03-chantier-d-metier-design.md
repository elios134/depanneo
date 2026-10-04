# Chantier D — Ton métier (spec)

Validée par André le 03/10/2026 (maquette `docs/design/maquettes-v2/12-chantier-d.html`, contenu `docs/contenu/qui-paie.md` validés tels quels).

## Objectif

Trois fonctionnalités qui s'appuient sur l'expérience terrain d'André (bailleurs sociaux) : savoir **qui paie** une réparation, retrouver **où couper** chez soi en urgence (« Mon logement »), et **envoyer le diagnostic** à un plombier.

## 1. « Qui paie ? »

### Statut de la personne
- Nouveau réglage `statutLogement` : `'locataire' | 'proprietaire' | 'non-precise'`, ou absent tant que la personne n'a pas répondu. Stocké avec les autres réglages (AsyncStorage `depanneo.reglages`, lecture tolérante comme les autres champs).
- **Premier lancement** : tant que `statutLogement` est absent, l'appli affiche l'écran « Une dernière chose » (maquette, écran 1) par-dessus l'accueil, une seule fois. Trois choix : « Je suis locataire », « Je suis propriétaire », « Je préfère ne pas dire » (→ `non-precise`). Pas de bouton fermer : un des trois choix est obligatoire (le troisième est neutre).
- **Réglages** : nouvelle ligne « Je suis… » (locataire / propriétaire / je préfère ne pas dire), même style que les choix existants (thème, rayon).

### Données
- Chaque résultat de diagnostic (68 au 03/10) reçoit un champ obligatoire `quiPaie: { qui: 'locataire' | 'proprietaire' | 'depend' | 'autre'; phrase: string }`, rempli **mot pour mot** depuis `docs/contenu/qui-paie.md` (L → `locataire`, P → `proprietaire`, D → `depend`, A → `autre`).
- Un test de données vérifie que **chaque** résultat a un `quiPaie` valide et une phrase non vide.

### Affichage (maquette, écran 2)
- Sur chaque résultat, un bloc « Qui paie ? » juste sous le conseil : une ligne titre + la phrase.
- Le titre dépend de `qui` et du statut (fonction pure testée `titreQuiPaie(qui, statut)`) :

| qui \ statut | locataire | propriétaire | non précisé |
|---|---|---|---|
| locataire | À ta charge (vert) | À ta charge (vert) | Locataire : entretien courant (neutre) |
| proprietaire | À la charge du propriétaire : préviens-le (orange) | À ta charge (vert) | Propriétaire (neutre) |
| depend | Ça dépend de la cause (neutre) | À ta charge (vert) | Ça dépend de la cause (neutre) |
| autre | Un autre organisme s'en occupe (neutre) | Un autre organisme s'en occupe (neutre) | Un autre organisme s'en occupe (neutre) |

  (Couleurs : tokens existants `verdictVert`, `verdictOrange`, `texteDiscret`.)
- Sur un **verdict rouge**, le bloc passe **après** les consignes de sécurité et les boutons d'urgence (la sécurité d'abord).

## 2. « Mon logement »

- Quatre emplacements fixes : `robinet-eau` (Robinet d'arrêt général), `tableau` (Tableau électrique), `robinet-gaz` (Robinet de gaz), `chauffe-eau` (Chauffe-eau / groupe de sécurité).
- Pour chacun : une **photo** facultative (appareil photo ou galerie) et une **phrase** facultative (« Sous l'évier de la cuisine, à gauche »). Données **uniquement sur le téléphone** : la photo est copiée dans le dossier documents de l'appli ; les chemins et phrases dans AsyncStorage (`depanneo.logement`). Rien n'est envoyé nulle part.
- **Urgences** (écran 3) : une carte « Mon logement » en haut de l'onglet, sous-titre « N emplacements sur 4 enregistrés » (fonction pure `resumeLogement`).
- **Écran « Mon logement »** (écran 4) : les 4 lignes (vignette ou « + photo », titre, phrase ou « À ajouter »), et le rappel « Photos et notes restent uniquement sur ton téléphone. ». Appui sur une ligne → écran d'édition de l'emplacement : photo (prendre / choisir / supprimer), champ phrase (120 caractères max), boutons Enregistrer / Supprimer l'emplacement.
- **Gestes d'urgence** (écran 5) : `couper-eau` ↔ `robinet-eau`, `couper-courant` ↔ `tableau`, `couper-gaz` ↔ `robinet-gaz`. Si l'emplacement est enregistré : bloc « Chez toi » (photo + phrase) **avant** les étapes. Sinon : lien discret « Enregistrer l'emplacement » qui ouvre l'édition. Pour le gaz, le bloc ne remplace jamais les consignes ni le numéro d'urgence.
- Permissions appareil photo / galerie : demandées au moment du choix, avec textes en français dans `app.json`. Refus → message clair, l'appli continue sans photo.
- Bibliothèques : `expo-image-picker` et `expo-file-system` (via `npx expo install`).

## 3. « Envoyer au plombier »

- Bouton « Envoyer au plombier » sur **chaque** résultat (écran 2), sous le tuto / avant la liste des pros.
- Écran d'envoi (écran 6) : photo facultative de la panne (prendre / choisir / retirer), **aperçu** du message, bouton « Partager… », rappel « Rien ne passe par un serveur. ».
- Message (fonction pure testée `messagePlombier(diagnostic, reponses, resultat)`), texte simple :
  ```
  <titre de la panne>
  • <réponse 1>
  • <réponse 2>
  Verdict : <libellé du verdict> (<conseil, première phrase>)
  Envoyé depuis Dépannéo
  ```
  Les réponses sont celles **réellement choisies** : le parcours mémorise désormais l'indice de la réponse choisie à chaque question (et pas seulement la suite d'étapes), pour éviter toute ambiguïté quand deux réponses mènent au même endroit.
- Partage : feuille de partage du téléphone. Texte seul → API `Share` de React Native. Texte + photo → bibliothèque de partage capable d'envoyer les deux ensemble sur Android (`react-native-share`, liée automatiquement) ; si elle s'avère incompatible avec Expo SDK 57, repli : `expo-sharing` pour la photo et le texte copié dans le presse-papiers avec un message « Texte copié, colle-le dans ton message ».
- Aucune donnée n'est envoyée par l'appli elle-même ; la position n'est jamais ajoutée au message.

## Hors périmètre
- Historique des diagnostics, carnet d'entretien, recherche (chantier E). Photo analysée par IA.

## Vérification
- Tests Jest : `titreQuiPaie` (12 cas du tableau), `quiPaie` présent sur les 68 résultats, `resumeLogement`, `messagePlombier`, mémorisation des réponses dans le parcours, lecture tolérante des nouveaux réglages et du logement.
- Scénarios Maestro : le premier lancement (choisir « locataire ») avant les scénarios existants (mettre à jour leurs débuts) ; un nouveau scénario « qui paie » (WC bouché → ventouse → « À ta charge ») ; « Mon logement » sans photo (phrase seule) → visible dans « Couper l'eau ».
- Essai sur le téléphone d'André (version de production) : photo réelle, partage réel vers une messagerie.
- `tsc`, `expo lint`, `jest` verts ; CI GitHub verte.
