# Dépann'Maison — Spec V1 (MVP)

## Contexte

Application mobile grand public qui aide à réagir face à une panne domestique
(fuite, chauffe-eau, disjoncteur, WC bouché...) : diagnostic simple, gestes
d'urgence, et conseil clair entre « je répare moi-même » ou « j'appelle un pro ».

Projet solo (André), objectif double :
- **Portfolio** : démontrer une appli mobile complète, utile, compréhensible
  par un recruteur non technique.
- **Commercialisation à terme** : viser une sortie sur les stores iOS/Android.
  La V1 reste volontairement simple (diagnostics + tutos), sans compte
  utilisateur ni paiement — ces éléments viendront en V2 si le produit est
  validé.

Le contenu des diagnostics s'appuie sur l'expérience terrain réelle d'André
(apprenti plombier, puis technicien multiservice pour bailleurs sociaux).

## Public visé

Particuliers, locataires et propriétaires, sans connaissance technique. Tout
doit être compréhensible par quelqu'un qui n'a jamais ouvert une boîte à
outils.

## Scope V1

But de l'app en V1 : **diagnostics simples + petits tutos**. Pas de compte
utilisateur, pas de sauvegarde en ligne, pas d'IA — ces éléments sont hors
scope V1 (voir V2 dans le CLAUDE.md du projet).

### Diagnostics couverts (8)

1. Fuite d'eau (sous évier, robinet, WC)
2. WC bouché
3. Évier/lavabo bouché
4. Pas d'eau chaude (chauffe-eau)
5. Disjoncteur qui saute
6. Plus de courant du tout
7. Odeur de gaz — **verdict 🔴 systématique, obligatoire**
8. Chaudière en panne (pas de chauffage)

Chaque diagnostic aboutit à un verdict :
- 🟢 **Je peux réparer** — mini-tuto associé
- 🟠 **Je peux sécuriser en attendant** — geste d'urgence + conseil pro
- 🔴 **J'appelle un pro tout de suite** — conseil pro + numéro d'urgence si
  pertinent (gaz notamment)

### Gestes d'urgence (accessibles en 1 clic depuis l'accueil, indépendants du diagnostic)

- Couper l'eau
- Couper le courant
- Couper le gaz

### Mini-tutos (réparations faciles liées aux verdicts 🟢)

- Déboucher un évier
- Déboucher des WC
- Changer un joint / resserrer un raccord
- Réarmer un disjoncteur

### Hors scope V1

- Compte utilisateur, sauvegarde en ligne
- Carnet d'entretien du logement
- Photo analysée par IA
- Paiement / abonnement (la monétisation sera cadrée séparément avant la V2)

## Stack technique

- **Mobile** : React Native + Expo, TypeScript
- **Navigation** : Expo Router (routing par fichiers)
- **État** : Context React natif — pas de state manager externe (Zustand/Redux
  jugés surdimensionnés pour ce scope)
- **Données** : fichiers JSON typés TypeScript, embarqués dans l'appli
  (fonctionnement garanti hors-ligne, aucun appel réseau en V1)

## Architecture

### Écrans

1. **Accueil** — accès direct aux 3 gestes d'urgence + bouton "Diagnostiquer
   une panne"
2. **Liste des diagnostics** — les 8 pannes, sélection par l'utilisateur
3. **Diagnostic (arbre de questions)** — une question à la fois, réponses à
   choix, navigation dans l'arbre JSON jusqu'à un résultat
4. **Résultat** — verdict (🟢/🟠/🔴) + conseil + lien vers mini-tuto ou geste
   d'urgence selon le cas
5. **Geste d'urgence** — étapes illustrées, accessible depuis l'accueil ou
   depuis un résultat 🟠
6. **Mini-tuto** — étapes illustrées, accessible depuis un résultat 🟢

Chaque écran est une route Expo Router. L'état du diagnostic en cours
(position dans l'arbre, réponses données) vit dans un Context React scoped à
l'écran de diagnostic — pas d'état global persistant nécessaire en V1.

### Schéma des données de diagnostic

Un fichier JSON par diagnostic (8 fichiers dans `data/diagnostics/`), typé via
une interface TypeScript commune :

```json
{
  "id": "fuite-eau",
  "titre": "Fuite d'eau",
  "icone": "💧",
  "etapeInitiale": "q1",
  "etapes": {
    "q1": {
      "question": "D'où vient la fuite ?",
      "reponses": [
        { "texte": "Sous l'évier / le lavabo", "suite": "q2" },
        { "texte": "Du compteur d'eau", "suite": "resultat_compteur" },
        { "texte": "Du plafond / d'en haut", "suite": "resultat_plafond" }
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
      "conseil": "Coupe l'eau au compteur, un pro doit intervenir.",
      "gesteUrgenceId": "couper-eau"
    },
    "resultat_gaz": {
      "verdict": "rouge",
      "titre": "Appelle un pro tout de suite",
      "conseil": "Ne touche à rien, aère si possible, sors du logement.",
      "numeroUtile": "0800 47 33 33"
    }
  }
}
```

- `etapes` : les questions de l'arbre (nœuds internes)
- `resultats` : les feuilles, chacune avec un `verdict` (`vert` / `orange` /
  `rouge`) et un lien optionnel vers un tuto (`tutoId`) ou un geste d'urgence
  (`gesteUrgenceId`)
- Le diagnostic "Odeur de gaz" n'a qu'un seul résultat possible, verdict
  `rouge`, avec `numeroUtile` toujours rempli (numéro d'urgence gaz)

### Règles de sécurité (contraintes fonctionnelles, non négociables)

- Tout diagnostic dont la cause implique le gaz aboutit à un verdict `rouge`
  avec numéro d'urgence — jamais de verdict `vert` ou `orange` sur une piste
  gaz.
- Aucun résultat ni tuto n'incite à ouvrir un tableau électrique, à intervenir
  sur une installation gaz, ou à travailler en hauteur — ces cas renvoient
  toujours vers un professionnel.
- Un avertissement fixe (footer ou écran d'accueil) rappelle que l'appli
  donne des conseils et ne remplace pas un professionnel.

## Gestion des erreurs

- Aucune donnée réseau en V1 → pas de gestion d'erreur réseau à prévoir.
- Si un `suite` ou un `tutoId`/`gesteUrgenceId` référencé dans un JSON ne
  correspond à aucune clé existante, c'est une erreur de données détectée au
  moment du build (validation TypeScript du schéma), pas une erreur runtime à
  gérer côté utilisateur.

## Tests

- Validation manuelle de chaque arbre de diagnostic : tous les chemins
  possibles doivent aboutir à un résultat valide (pas de branche orpheline).
- Vérification spécifique du diagnostic gaz : tout chemin aboutit à `rouge`.
- Test manuel sur device/simulateur du parcours complet accueil → diagnostic
  → résultat → tuto, et accueil → geste d'urgence.

## Ce qui n'est pas dans cette spec

- Modèle économique et monétisation (à cadrer séparément avant la V2)
- Aspects juridiques (CGU, mentions légales) — à valider avec un juriste avant
  publication publique sur les stores, hors scope de cette spec technique
- Design visuel détaillé (charte graphique, illustrations) — à définir lors de
  l'implémentation
