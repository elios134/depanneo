# Chantier « Pros enrichis » (spec)

Validée par André le 09/10/2026 (maquette `docs/design/maquettes-v2/13-pros-enrichis.html`).

## Objectif

L'onglet Pros ne trouve que les pros présents dans OpenStreetMap : 6 dans un rayon de 5 km à Marseille centre. On ajoute deux sources publiques gratuites, sans compte ni clé :
- **l'annuaire RGE de l'ADEME** : pros labellisés, **avec téléphone** (27 à 5 km) ;
- **le registre des entreprises de l'État** (API Recherche d'entreprises, données INSEE Sirene) : tous les plombiers et électriciens déclarés, y compris les petits artisans et auto-entrepreneurs, **sans téléphone** (plus de 4 000 à 5 km).

Pas de serveur : l'appli interroge les trois sources elle-même.

## 1. Sources

### OpenStreetMap (Overpass)
Inchangé (`lib/overpass.ts`). Chaque pro reçoit `source: 'osm'`.

### Annuaire RGE (ADEME)
- Adresse : `https://data.ademe.fr/data-fair/api/v1/datasets/eo1n335dwa-ul7glxa7lm1ho/lines`. Licence Ouverte, mise à jour quotidienne.
- Paramètres :
  - `geo_distance=<lon>,<lat>,<rayon>km` ;
  - `qs=particulier:true` (pros qui travaillent pour les particuliers) ;
  - `size=1000` ;
  - `select=siret,nom_entreprise,adresse,code_postal,commune,latitude,longitude,telephone,email,site_internet,nom_qualification,organisme,lien_date_fin`.
- Une entreprise a plusieurs lignes, une par qualification. On regroupe par `siret`.
- Une ligne ne compte que si son label est encore valide (`lien_date_fin` ≥ aujourd'hui) et si `nom_qualification` correspond à un métier :
  - **plombier** si `/plomberie|plombier|chauffe-eau/i` (cette règle exclut « Couverture en plomb ») ;
  - **électricien** si `/électricien|radiateurs électriques/i`.
- Une entreprise sans aucune ligne retenue est ignorée.
- Pro obtenu :
  - `source: 'rge'`, `id: 'rge/<siret>'` ;
  - nom, métiers, téléphone, adresse (« adresse, code postal commune »), ville, e-mail, site ;
  - `rge: { qualification, organisme, finValidite }`, avec la date de fin la plus lointaine parmi les lignes retenues.

### Registre des entreprises (API Recherche d'entreprises)
- Adresse : `https://recherche-entreprises.api.gouv.fr/near_point`. Limite : 7 requêtes par seconde.
- Paramètres : `lat`, `long`, `radius` (en km, 50 au maximum), `activite_principale=43.22A,43.21A`, `per_page=25`, `page`.
- **Bascule NAF 2027 :**
  - les codes NAF 2025 (`43.22G`, `43.21G`) entrent en vigueur le 01/01/2027 ;
  - au 09/10/2026, l'API **refuse** ces codes (erreur 400) ;
  - si l'API répond 400 avec un message qui mentionne `activite_principale`, l'appli refait la même requête avec `43.22G,43.21G` ;
  - les codes sont des constantes ; le test couvre ce repli.
- **Rayon progressif** : on essaie successivement les rayons de la suite 1, 2, 5, 10, 20, 50 qui ne dépassent pas le rayon des réglages, puis le rayon des réglages lui-même. On s'arrête au premier rayon qui donne au moins 30 résultats (`total_results`), ou au rayon des réglages. Pour ce rayon, on lit au maximum 2 pages, soit 50 résultats. Au plus 6 requêtes, faites l'une après l'autre.
- Une entreprise peut avoir plusieurs établissements dans la zone : chaque établissement de `matching_etablissements` devient un pro, à condition :
  - d'être ouvert (`etat_administratif === 'A'`) ;
  - d'avoir une latitude et une longitude valides ;
  - de se trouver dans le rayon.
- Les entreprises étrangères sont exclues : on garde seulement les établissements dont le code postal fait 5 chiffres.
- **Nom affiché :** la première enseigne (`liste_enseignes[0]`), sinon `nom_commercial`, sinon `nom_complet` sans la partie entre parenthèses. Un nom tout en majuscules passe en « Casse De Titre » (fonction pure testée).
- Métier : `43.22A` ou `43.22G` → plombier ; `43.21A` ou `43.21G` → électricien.
- Pro obtenu :
  - `source: 'registre'`, `id: 'registre/<siret>'`, `siret` ;
  - `telephone: null` ;
  - adresse, ville, `anneeCreation` (tirée de `date_creation`).
- On garde les **30 registres les plus proches** après fusion.
- Les auto-entrepreneurs sont affichés comme les autres (décision d'André). Les entreprises non diffusibles sont déjà absentes de l'API.

## 2. Fusion (fonction pure testée `fusionnerPros`)

1. **Registre + RGE, même SIRET** → un seul pro :
   - on part du pro RGE (téléphone, badge, contacts) ;
   - il garde le SIRET ;
   - ses métiers sont l'union des deux.
2. **OSM + autre source** : même nom normalisé (minuscules, sans accents ni ponctuation, mots « sarl », « sas », « eurl » retirés) **et** moins de 150 m d'écart → un seul pro :
   - on garde les champs OSM non vides (horaires, site) ;
   - on ajoute le badge RGE ou le SIRET de l'autre source ;
   - le téléphone OSM passe en priorité, sinon celui de RGE ;
   - la `source` reste celle du pro le plus riche : RGE, sinon OSM, sinon registre.
3. **Classement** : un pro est **joignable** s'il a un téléphone. Les joignables sont triés par distance, puis viennent les autres (le registre), triés par distance et limités à 30.

## 3. Récupération et erreurs

- `chercherPros` lance les trois sources **en parallèle** et attend que toutes aient répondu ou échoué. Chaque source a son propre délai :
  - Overpass : inchangé ;
  - RGE : 15 s ;
  - registre : 15 s au total.
- Si au moins une source répond, le résultat est un succès avec ce qu'on a ; l'échec d'une source n'affiche aucun message (YAGNI).
- Si les **trois** sources échouent : même classement qu'aujourd'hui (`classerEchec`, hors-ligne ou indisponible).
- Le regroupement des requêtes identiques et l'arrondi de la position à 3 décimales s'appliquent aux trois sources.
- **Cache** : la liste fusionnée est enregistrée comme aujourd'hui. On ajoute `version: 2`. Un cache sans version (ancienne appli) est utilisé pour l'affichage hors ligne, mais doit être rafraîchi dès qu'il y a du réseau.

## 4. Modèle `Pro` (src/domaine/pro.ts)

Champs facultatifs ajoutés : `source?: 'osm' | 'rge' | 'registre'` (absent = osm), `siret?: string | null`, `rge?: { qualification: string; organisme: string; finValidite: string } | null`, `anneeCreation?: number | null`.
Fonctions pures : `estJoignable(pro)`, `lienFicheOfficielle(pro)` → `https://annuaire-entreprises.data.gouv.fr/etablissement/<siret>`, `lienChercherNumero(pro)` → recherche Google « nom + ville + téléphone » (sur le modèle de `lienAvis`).

## 5. Affichage (maquette 13)

### Onglet Pros (écran 1)
- **Carte** :
  - joignables : épingle de couleur actuelle ;
  - registre : petit point gris (`texteDiscret`), qu'on peut toucher pour ouvrir la fiche.
- **Liste**, filtrée par métier (Tous, Plombiers, Électriciens) comme aujourd'hui :
  - section « JOIGNABLES TOUT DE SUITE » : cartes actuelles. Le badge « RGE » est placé **dans la ligne du métier**, devant le texte, pour ne jamais être coupé par un nom long ;
  - section « AUTRES ARTISANS DÉCLARÉS · numéro à chercher » : cartes plus discrètes. Le bouton de droite est une loupe qui ouvre `lienChercherNumero`.
  - une section vide n'affiche pas son titre.
- En bas : bouton secondaire « Voir plus sur Google Maps ». Il ouvre `https://www.google.com/maps/search/<plombier|électricien|plombier électricien>/@<lat>,<lon>,14z`, avec le métier qui suit le filtre. C'est une adresse web : Android la confie à l'appli Google Maps si elle est installée.
- Crédits : « Données © OpenStreetMap · ADEME · INSEE (Sirene) · mis à jour … ».
- Message « Aucun pro trouvé… » : la mention « Les données d'OpenStreetMap peuvent être incomplètes » est retirée.

### Fiche d'un pro RGE (écran 2)
- Encadré vert sous l'en-tête :
  - titre « RGE · Label reconnu par l'État » ;
  - texte « Qualification « <qualification> » vérifiée par <Organisme>, valable jusqu'au <JJ/MM/AAAA>. » (nom de l'organisme avec une majuscule).
- Note du bas, selon la source : « Infos de l'annuaire RGE de l'ADEME. » ou le texte OSM actuel.

### Fiche d'un artisan du registre (écran 3)
- Lignes :
  - adresse ;
  - « Entreprise créée en <année> », avec une nouvelle icône Lucide `building` à ajouter à la liste des icônes.
- Boutons :
  - « Chercher le numéro » (principal) ;
  - « Voir la fiche officielle » (secondaire) ;
  - pas de bouton Appeler.
- Note : « Artisan déclaré au registre des entreprises (INSEE). Son numéro n'est pas public : la recherche s'ouvre dans ton navigateur. »

### Accueil et résultats de diagnostic
- Ils n'affichent **que les joignables** (filtre `estJoignable` appliqué avant leur limite actuelle), avec le badge RGE.
- Le reste ne change pas.

## Hors périmètre
- Google Places, PagesJaunes (payants ou fermés), Overture et Foursquare (il faudrait un serveur).
- Un message « une source ne répond pas ».
- Un filtre « RGE seulement ».

## Vérification
- **Tests Jest :**
  - analyse RGE : regroupement par SIRET, filtre des qualifications et des dates, réponse illisible ;
  - analyse du registre : établissements fermés, étrangers ou hors rayon exclus, choix du nom, casse de titre, métier par code ;
  - rayon progressif et repli des codes NAF (avec un `fetch` simulé) ;
  - `fusionnerPros` : doublon par SIRET, doublon OSM par nom et distance, ordre et limite de 30 ;
  - succès partiel et échec des trois sources ;
  - cache en version 2 et ancien cache ;
  - `lienFicheOfficielle`, `lienChercherNumero`, `estJoignable` ;
  - le filtre des encarts de l'accueil.
- **Maestro** : un scénario `pros.yaml`. On ouvre l'onglet Pros, on attend « JOIGNABLES TOUT DE SUITE » ou « AUTRES ARTISANS DÉCLARÉS », on ouvre une fiche du registre, et on vérifie « Chercher le numéro ». Il faut le réseau et la position (ville par défaut).
- **Essai sur le téléphone d'André** (version de production) : à Marseille, les deux sections remplies, le badge RGE, « Chercher le numéro » et la fiche officielle s'ouvrent, et « Voir plus sur Google Maps » ouvre Google Maps.
- `tsc`, `expo lint` et `jest` verts ; CI GitHub verte.
