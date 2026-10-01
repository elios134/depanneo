# Dépann'Maison — Spec V2 (refonte design, carte des pros, 22 pannes)

Remplace la spec V1 (`2026-09-26-depannmaison-mvp-design.md`) sur tous les points qu'elle modifie. Ce qui n'est pas mentionné ici reste valable (règles de sécurité, avertissement, fonctionnement hors-ligne du diagnostic).

Maquettes validées par André le 2026-09-30 : `docs/design/maquettes-v2/` (1-accueil, 2-parcours-diagnostic, 3-autres-ecrans, 4-icones). **Les maquettes font foi pour le visuel.** Tout écran non couvert par une maquette doit être montré à André avant d'être codé.

## 1. Ce qui change par rapport à la V1

| Sujet | V1 | V2 |
|---|---|---|
| Périmètre | Eau, électricité, gaz, chauffage | **Plomberie sanitaire + électricité basique** uniquement |
| Pannes | 8 | **22** (16 plomberie, 6 électricité) |
| Gaz | Diagnostic « Odeur de gaz » + chaudière | Diagnostics gaz et chaudière **supprimés** ; filet de sécurité « Odeur de gaz ? » dans l'onglet Urgences |
| Design | Écrans clairs basiques, jamais validés | Style **SC Fleet Manager** : sombre, verre dépoli, barre de navigation flottante en bas ; thème clair en option |
| Accueil | Boutons | **Carte plein écran** avec position de l'utilisateur et pros autour |
| Pros | Aucun | Plombiers et électriciens proches (OpenStreetMap), appel en 1 appui |
| Diagnostic | Pas de retour arrière | Barre de progression, « Je ne sais pas », question précédente, recommencer |
| Réglages | Aucun | Thème, rayon de recherche, localisation / ville par défaut, À propos |

## 2. Découpage en 3 chantiers

Chaque chantier a son propre plan d'implémentation, livrable et testable seul :

1. **Chantier A — Design et navigation.** Système de thème (sombre/clair), barre flottante 5 onglets, tous les écrans refaits selon les maquettes, avec le contenu existant (les 6 pannes V1 conservées). L'accueil affiche un **fond de carte factice** (placeholder) à la place de la vraie carte.
2. **Chantier B — Carte et pros.** Vraie carte, position, recherche des pros OpenStreetMap, cache hors-ligne, recherche par ville, branchement des réglages rayon/localisation.
3. **Chantier C — Contenu des 22 pannes.** Claude rédige les 22 arbres dans un document lisible (`docs/contenu/pannes-v2.md`), André relit et corrige, **puis seulement** conversion en JSON et intégration. Le brouillon peut être rédigé en parallèle des chantiers A et B.

Ordre d'intégration : A → B → C.

## 3. Design system

### Couleurs (tokens)

| Token | Sombre | Clair |
|---|---|---|
| `fond` | `#0a0a0f` + halos radiaux bleu (`rgba(79,163,255,.16)`) et violet (`rgba(139,92,246,.12)`) | `#f5f7fb` + mêmes halos plus légers |
| `texte` | `rgba(255,255,255,.9)` | `#0f172a` |
| `texteDiscret` | `rgba(255,255,255,.5)` | `rgba(15,23,42,.5)` |
| `carte` (fond des cartes) | `rgba(255,255,255,.03)` | `#ffffff` |
| `bordure` | `rgba(255,255,255,.10)` | `rgba(15,23,42,.08)` |
| `verre` (barre, panneau) | `rgba(18,18,26,.82)` + flou | `rgba(255,255,255,.88)` + flou + ombre douce |
| `accent` | `#4FA3FF` | `#4FA3FF` |
| `plomberie` | `#2ee9a5` | `#10b981` |
| `electricite` | `#f5a623` | `#d97706` |
| `danger` | `#ef4444` (texte `#fca5a5`) | `#dc2626` |
| Verdict vert / orange / rouge | `#2ee9a5` / `#f5a623` / `#ef4444` sur fond teinté 12 % et bordure 40 % | mêmes teintes |

Rayons : cartes 14 px, panneaux 24 px, boutons principaux 16 px, barre de navigation en pilule (22–26 px). Police système. Flou du verre : `expo-blur` (`BlurView`), avec repli sur la couleur `verre` opaque si le flou n'est pas disponible.

### Icônes

**Lucide** (`lucide-react-native` + `react-native-svg`), traits fins, monochromes, teintées par catégorie dans une pastille ronde à 13–20 % d'opacité. Correspondance (4-icones.html) :

- Pannes plomberie : `droplets` fuite d'eau, `toilet` WC bouché, `waves` évier/lavabo bouché, `heater` pas d'eau chaude, `hourglass` WC lent à se remplir, `rotate-cw` chasse qui coule, `circle-x` chasse qui ne se déclenche plus, `wrench` robinet dur, `droplet` robinet qui goutte, `gauge` peu de pression/débit, `shower-head` douche qui s'écoule mal, `wind` mauvaise odeur, `cylinder` groupe de sécurité qui goutte, `droplet-off` fuite au pied du WC, `bath` flexible/pommeau qui fuit, `audio-waveform` bruit dans les tuyaux.
- Pannes électricité : `toggle-left` disjoncteur qui saute, `zap-off` plus de courant du tout, `door-open` plus de courant dans une pièce, `plug` prise HS, `lightbulb-off` interrupteur/lumière HS, `lightbulb` ampoule qui grille/clignote.
- Interface : `house` Accueil, `triangle-alert` Urgences, `book-open` Tutos, `map-pin` Pros, `settings` Réglages, `stethoscope` Diagnostiquer, `phone` Appeler, `locate-fixed` Recentrer, `search` Chercher, `rotate-ccw` Recommencer, `wrench` verdict vert, `shield-alert` verdict orange, `hard-hat` verdict rouge, `flame` gaz, `power` couper le courant, `siren` 112.

Les données stockent le **nom** de l'icône (ex. `"toilet"`), un composant `Icone` fait la correspondance nom → composant Lucide. Un nom inconnu est une erreur détectée par les tests.

### Logo

Provisoire : pictogramme maison + clé en bleu `accent`, dans un carré arrondi en verre, en haut à gauche de l'accueil. Un vrai logo sera créé plus tard (hors spec).

## 4. Navigation

Barre flottante en bas, en pilule de verre, centrée, sans nom d'appli, visible sur **tous** les écrans (y compris pendant un diagnostic). 5 onglets, de gauche à droite :

1. `house` **Accueil** (carte)
2. `triangle-alert` **Urgences** — icône teintée rouge pâle même inactive
3. `book-open` **Tutos** — bouton pilule avec le texte « Tutos »
4. `map-pin` **Pros**
5. `settings` **Réglages**

Onglet actif : fond `accent`, icône blanche. Implémentation : Expo Router `Tabs` avec une `tabBar` personnalisée. Le parcours diagnostic et les pages de détail (geste, tuto) sont des piles (Stack) à l'intérieur des onglets concernés, pour que la barre reste visible.

Règle de sécurité conservée : les gestes d'urgence (dont gaz) sont à **1 appui depuis n'importe quel écran** via l'onglet Urgences.

## 5. Écrans

### Accueil (1-accueil.html)
- Carte plein écran (chantier A : fond factice ; chantier B : vraie carte), point bleu de position, épingles pros (vert plombier, orange électricien).
- Logo en haut à gauche, bouton rond `locate-fixed` en haut à droite (recentrer).
- Panneau de verre au-dessus de la barre : bouton « Diagnostiquer une panne » (`stethoscope`), titre « Pros près de toi » + « Tout voir » (→ onglet Pros), 2 pros max avec bouton d'appel.
- Chantier A : la liste de pros du panneau est **masquée** (pas de fausses données en production) ; seul le bouton Diagnostic est affiché.

### Parcours diagnostic (2-parcours-diagnostic.html)
1. **Quelle panne ?** : retour, onglets Plomberie / Électricité, champ de recherche (filtre sur le titre et des mots-clés), liste des pannes avec icône teintée.
2. **Question** : bouton quitter (✕), titre de la panne, barre de progression, « Question N », question en grand, réponses en cartes ; la réponse « Je ne sais pas » en bordure pointillée ; lien « ← Question précédente » (absent sur la 1re question).
3. **Résultat** :
   - vert : badge vert + conseil, bouton « Voir le tuto » mis en avant, « Recommencer », puis « Si tu préfères un pro » (1 pro, chantier B) ;
   - orange : badge orange + conseil, geste de sécurité en premier, puis les pros du bon métier ;
   - rouge : badge rouge « Appelle un pro tout de suite », conseil, pros du bon métier en premier (chantier B), puis le geste de sécurité et le numéro d'urgence s'il existe.
   - Chantier A : sans pros, le résultat rouge affiche le conseil, le numéro d'urgence éventuel (bouton d'appel) et le geste.

Barre de progression : `étapes répondues / (étapes répondues + profondeur max restante)` calculée sur l'arbre ; libellé « Question N ».

### Urgences (3-autres-ecrans.html)
Titre, sous-titre « Les bons gestes en attendant le pro. », 3 grandes cartes : Couper l'eau (`droplets`, bleu), Couper le courant (`power`, orange), **Odeur de gaz ?** (`flame`, rouge, sous-titre « Sors et appelle le 0800 47 33 33 »). Puis « Numéros utiles » : Urgence gaz 0800 47 33 33 et Urgences 112, appelables d'un appui (`tel:`). Chaque carte ouvre le détail du geste (étapes numérotées + numéro si présent).

Le geste « Odeur de gaz ? » reprend les étapes et le numéro du geste `couper-gaz` actuel (correctif F3 de la V1).

### Tutos (3-autres-ecrans.html)
Titre, onglets Plomberie / Électricité, liste avec icône, durée et outil principal. Détail = étapes numérotées (composant existant `EtapesList` restylé).

### Pros (3-autres-ecrans.html)
Petite carte, filtres Tous / Plombiers / Électriciens, liste triée par distance (nom, métier, distance, bouton d'appel si un numéro existe), mention « Données © OpenStreetMap · mis à jour il y a X ». Chantier A : écran présent avec un état vide « Bientôt disponible » ; rempli au chantier B.

### Réglages (3-autres-ecrans.html)
- **Thème** : Sombre / Clair / Auto (suit le téléphone). Défaut : Sombre.
- **Rayon de recherche** : 5 / 10 / 20 km. Défaut : 10 km. (Actif au chantier B.)
- **Localisation** : interrupteur « Utiliser ma position ». Défaut : activé. (Actif au chantier B.)
- **Ville par défaut** : ville ou code postal utilisé si la localisation est désactivée ou refusée. (Chantier B.)
- **À propos et mentions légales** : avertissement « Dépann'Maison donne des conseils, mais ne remplace pas un professionnel », crédits OpenStreetMap / OpenFreeMap / OpenMapTiles, version de l'appli.

Réglages enregistrés sur le téléphone (`@react-native-async-storage/async-storage`).

## 6. Modèle de données (évolutions)

- `Diagnostic` : ajoute `categorie: 'plomberie' | 'electricite'`, `motsCles: string[]` (recherche) ; `icone` devient un nom d'icône Lucide.
- `Reponse` : ajoute `inconnu?: true` pour la réponse « Je ne sais pas » (affichage pointillé). Règle de contenu : une réponse « Je ne sais pas » mène toujours au verdict **le plus prudent** de la branche.
- `Resultat` : inchangé (verdict, titre, conseil, tutoId, gesteUrgenceId, numeroUtile). Le métier des pros proposés est déduit de `categorie`.
- `Tuto` : ajoute `categorie`, `icone`, `duree` (ex. « 5 min »), `outil` (ex. « ventouse »).
- `GesteUrgence` : ajoute `icone`. Le geste `couper-gaz` est renommé côté affichage « Odeur de gaz ? ».
- Suppression : `odeur-gaz.json`, `chaudiere-en-panne.json`.
- Historique du diagnostic : pile d'identifiants d'étapes dans l'état de l'écran → « Question précédente » = dépiler ; « Recommencer » = revenir à `etapeInitiale`.

Validation (`validerDiagnostic` + tests) étendue : `categorie` valide, nom d'icône connu, au moins un mot-clé ; règles de sécurité existantes conservées (tout résultat lié au geste `couper-gaz` est rouge avec numéro).

## 7. Carte, position et pros (chantier B)

- **Carte** : `@maplibre/maplibre-react-native` avec les styles **OpenFreeMap** (gratuit, sans clé, sans limite, usage commercial autorisé) : style « Dark » en thème sombre, « Positron » en thème clair. Attribution affichée : « OpenFreeMap © OpenMapTiles Data from OpenStreetMap ».
  - **Conséquence importante** : MapLibre contient du code natif → l'appli ne peut plus être testée dans **Expo Go**. Il faut un **build de développement** (`npx expo run:android` avec Android Studio, ou EAS Build). Le plan du chantier B inclut cette mise en place et la documente pour André.
  - Sur le web (prévisualisation), la carte est remplacée par le fond factice du chantier A.
- **Position** : `expo-location`, permission « pendant l'utilisation » uniquement. La position reste sur le téléphone (jamais envoyée ailleurs que dans la requête de recherche des pros).
- **Pros** : API **Overpass** (OpenStreetMap), recherche dans le rayon choisi des lieux tagués `craft=plumber` et `craft=electrician` ; nom, distance (calcul de Haversine), numéro (`phone` ou `contact:phone`). Bouton d'appel seulement si un numéro existe. Tri par distance.
  - **Serveurs de secours** : la recherche essaie à la suite `overpass-api.de`, `maps.mail.ru` puis `overpass.private.coffee` (20 s max par serveur, 45 s au total) et s'arrête au premier succès.
  - Économie de requêtes : nouvelle recherche seulement si la position a bougé de plus de 1 km, si le rayon ou le filtre change, ou si le cache a plus de 24 h.
- **Hors-ligne** : dernière liste de pros + position + date gardées en mémoire (AsyncStorage). Sans réseau : fond de carte neutre + bandeau « Hors connexion », liste en cache avec « mis à jour il y a X ». Le diagnostic, les gestes et les tutos marchent toujours hors-ligne (données embarquées).
- **Service des pros indisponible** : si le réseau marche mais que tous les serveurs Overpass échouent (erreur HTTP, délai dépassé, réponse illisible), la vraie carte reste affichée avec le bandeau « Service des pros indisponible », la liste en cache s'il y en a une, et un bouton « Réessayer ». « Hors connexion » est réservé à l'absence de réseau (toutes les tentatives échouent par erreur réseau) et à l'échec du fond de carte.
- **Localisation refusée ou désactivée** : carte centrée sur la France + champ « Ta ville ou ton code postal », recherche via le géocodage de la **Géoplateforme** (`https://data.geopf.fr/geocodage/search`, gratuit, 50 requêtes/s), la ville choisie devient la « ville par défaut ».

## 8. Contenu des 22 pannes (chantier C)

Plomberie : fuite d'eau, WC bouché, évier/lavabo bouché, pas d'eau chaude (chauffe-eau électrique), WC lent à se remplir, chasse d'eau qui coule en continu, chasse d'eau qui ne se déclenche plus, robinet dur à fermer/ouvrir, robinet qui goutte, peu de pression/débit, douche/baignoire qui s'écoule mal, mauvaise odeur d'égout, groupe de sécurité du chauffe-eau qui goutte, fuite au pied du WC, flexible/pommeau de douche qui fuit, bruit ou coups dans les tuyaux.

Électricité : disjoncteur qui saute, plus de courant du tout, plus de courant dans une seule pièce, prise qui ne marche plus, interrupteur/lumière qui ne marche plus, ampoule qui grille souvent / lumière qui clignote.

Processus : Claude rédige `docs/contenu/pannes-v2.md` (pour chaque panne : questions, réponses dont « Je ne sais pas », verdicts, conseils, tuto ou geste lié, mots-clés) + les nouveaux tutos nécessaires. **André relit et valide** chaque panne. Seul le contenu validé est converti en JSON. Les 6 pannes V1 conservées sont aussi relues dans ce document.

Règles de contenu : sécurité CLAUDE.md (jamais de tableau électrique ouvert, jamais d'intervention gaz, jamais de travail en hauteur) ; « Je ne sais pas » → verdict le plus prudent ; vocabulaire accessible à quelqu'un qui n'a jamais ouvert une boîte à outils.

## 9. Tests et vérification

- Tests unitaires (Jest) sur la logique pure : validation des données (dont icônes et catégories), historique du diagnostic (précédente / recommencer / progression), réglages (lecture/écriture avec valeurs par défaut), parsing de la réponse Overpass, distance, fraîcheur du cache, filtre de recherche des pannes.
- `npx tsc --noEmit` sans erreur, `npm test` vert.
- Vérification visuelle par Claude dans le navigateur (version web) à chaque chantier, comparée aux maquettes.
- Vérification sur téléphone réel par André à la fin de chaque chantier (Expo Go pour A ; build de développement à partir de B).

## 10. Hors périmètre

Annuaire de pros partenaires payant, comptes utilisateurs, carnet d'entretien, photo analysée par IA, couleur d'accent personnalisable, vrai logo, publication sur les stores.

## 11. Mise à jour de CLAUDE.md

Au début du chantier A, `CLAUDE.md` est mis à jour : périmètre plomberie + électricité basique, gaz limité au filet de sécurité, nouvelles fonctionnalités (carte, pros, réglages), style SC Fleet Manager, règle « pas d'UI sans maquette validée », et les règles d'architecture de la section 12.

## 12. Architecture du code

Mêmes principes que SC Fleet Manager : fichiers courts, **une fonctionnalité = un dossier**, on ne met en commun que ce qui sert à **au moins 2 fonctionnalités**.

### Arborescence cible

```
app/                                  # ROUTES UNIQUEMENT (Expo Router) — fichiers minces
  _layout.tsx                         # providers (Thème, Réglages) + Stack racine
  (onglets)/
    _layout.tsx                       # Tabs + tabBar={BarreNavigation}
    (accueil)/
      _layout.tsx                     # Stack de l'onglet Accueil
      index.tsx                       # → EcranAccueil
      diagnostic/index.tsx            # → EcranChoixPanne
      diagnostic/[id].tsx             # → EcranDiagnostic
    urgences/  _layout.tsx, index.tsx, [id].tsx
    tutos/     _layout.tsx, index.tsx, [id].tsx
    pros.tsx
    reglages/  _layout.tsx, index.tsx, a-propos.tsx

src/
  theme/            tokens.ts, ThemeProvider.tsx, useTheme.ts
  ui/               composants partagés : Icone, Verre, CarteListe, BoutonPrincipal,
                    Onglets, Pastille, EtapesList, NumeroUrgence, VerdictBadge
  navigation/       BarreNavigation.tsx
  domaine/          types.ts, diagnosticEngine.ts, validateDiagnostic.ts   (ex-lib/)
  donnees/          diagnostics/*.json + index.ts, gestesUrgence.ts, tutos.ts (ex-data/)
  fonctionnalites/
    accueil/        EcranAccueil.tsx + components/ (FondCarte, PanneauAccueil, Logo, BoutonRecentrer)
    diagnostic/     EcranChoixPanne.tsx, EcranDiagnostic.tsx
                    components/ (ListePannes, CarteQuestion, CarteResultat, BarreProgression)
                    hooks/useParcoursDiagnostic.ts
                    lib/parcours.ts (historique, précédente, progression — pur), lib/recherche.ts
    urgences/       EcranUrgences.tsx, EcranGeste.tsx
    tutos/          EcranTutos.tsx, EcranTuto.tsx
    pros/           EcranPros.tsx (+ au chantier B : lib/overpass.ts, lib/distance.ts,
                    lib/cachePros.ts, hooks/usePosition.ts, hooks/usePros.ts, components/CartePros.tsx)
    reglages/       EcranReglages.tsx, EcranAPropos.tsx, ReglagesProvider.tsx, lib/reglages.ts
```

- Les fichiers de `app/` ne contiennent **aucune logique ni style** : ils importent l'écran et le rendent (≤ 30 lignes).
- `lib/` = logique **pure** (pas de React), testée unitairement. `hooks/` = état React. `components/` = affichage, sans logique métier.
- Tests **à côté du fichier testé** (`parcours.ts` → `parcours.test.ts`). Les tests actuels de `__tests__/` sont déplacés au chantier A.
- Le déplacement `lib/` → `src/domaine/` et `data/` → `src/donnees/` est fait au chantier A en **déplacement pur** (aucun changement de comportement, tests verts), dans un commit séparé.

### Taille des fichiers (cibles indicatives, comme SC Fleet)

| Type de fichier | Cible | Plafond souple |
|---|---|---|
| Route `app/` | ≤ 30 | 30 |
| Composant UI (`ui/`, `components/`) | 80–150 | ~250 |
| Écran (`Ecran*.tsx`) | 150–250 | ~350 |
| Hook / lib pure | 100–200 | ~300 |
| Données (JSON, listes) | — | pas de limite |

Au-delà du plafond : découper avant d'ajouter du code.

### Règles de code

- TypeScript `strict` + `noUnusedLocals` + `noUnusedParameters` : aucun code mort.
- **Aucune couleur en dur hors de `src/theme/tokens.ts`** : tout passe par `useTheme()`, sinon le thème clair casse. Un test Jest parcourt `src/` et échoue s'il trouve une couleur hexadécimale ou `rgba(` ailleurs que dans `src/theme/`.
- État global limité à 2 contextes : **Thème** et **Réglages**. L'état d'un diagnostic reste local à l'écran (hook `useParcoursDiagnostic`).
- Noms en français pour le métier (`EcranDiagnostic`, `pannes`, `verdict`), termes techniques du framework inchangés (`useState`, `Stack`).
- Dépendances ajoutées : chantier A → `lucide-react-native`, `react-native-svg`, `expo-blur`, `@react-native-async-storage/async-storage` ; chantier B → `@maplibre/maplibre-react-native`, `expo-location`. Aucune autre dépendance sans validation.

### Volume estimé (hors JSON et tests)

| Chantier | Code applicatif | Tests |
|---|---|---|
| A — Design et navigation | ~1 800–2 200 lignes, ~40 fichiers | ~400 lignes |
| B — Carte et pros | ~700–900 lignes, ~10 fichiers | ~300 lignes |
| C — Contenu | ~50 lignes de code + ~3 000 lignes de JSON | ~100 lignes |

L'appli V1 actuelle fait ~600 lignes de code applicatif.
