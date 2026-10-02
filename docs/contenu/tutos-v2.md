# Tutos v2 — étapes dictées par André (brouillon)

**Statut : intégré dans l'appli (src/donnees/tutos.ts fait foi).**

Brouillon des tutos réécrits par André, avec les schémas animés proposés (🎞️).
Ils ont été reportés dans `src/donnees/tutos.ts`, qui fait foi.

## Déboucher un évier — validé

20 min · seau, gants, ventouse ou furet si besoin

1. Mets un seau sous le siphon, puis dévisse la base du siphon. 🎞️ *Le bouchon tourne et se détache, l'eau tombe dans le seau.*
2. Vérifie que tu n'as pas perdu le joint.
3. Nettoie l'intérieur avec un couteau, une cuillère ou une baguette. La plupart du temps, ça suffit. 🎞️ *La baguette racle le coude.*
4. Fais couler un peu d'eau, puis revisse la base à la main.
5. Fais couler de l'eau très chaude. Si l'eau s'évacue normalement, c'est réglé.

**Plan B : si le démontage n'a pas suffi**

6. Ventouse : bouche le trop-plein (le petit trou en haut de l'évier) avec une éponge, mets un peu d'eau dans l'évier, puis donne des à-coups. Avec une ventouse pro, alterne tirer et pousser. 🎞️ *Éponge sur le trop-plein, ventouse qui monte et descend, flèches de pression.*
7. Furet : si la ventouse ne marche pas, remets le seau, démonte tout le siphon et range les joints de côté. 🎞️ *Le siphon entier se détache.*
8. Enfonce le furet d'environ 5 cm, bloque-le, puis tourne dans le sens des aiguilles d'une montre. Recommence 5 cm par 5 cm jusqu'à ce que le bouchon parte. 🎞️ *Le furet avance de 5 cm, flèche de rotation, puis il avance encore.*
9. Si c'est toujours bouché, appelle un plombier.

Décision André (02/10) : « eau très chaude » plutôt que « bouillante » (PVC).

## Déboucher des WC — validé

15 min · gants, ventouse

⚠️ Encadré en haut : si l'eau remonte dans les WC sans que tu tires la chasse, n'essaie rien et appelle tout de suite un plombier. C'est sûrement le tuyau principal de l'immeuble qui est bouché à ton niveau : l'eau des voisins remonte chez toi.

1. Tire un peu la chasse : si l'eau s'écoule lentement, c'est un bouchon dans la cuvette. 🎞️ *Le niveau d'eau baisse doucement.*
2. Place la ventouse au fond de la cuvette et donne des à-coups. 🎞️ *La ventouse monte et descend, flèches de pression sur le bouchon.*
3. Tire la chasse. Si l'eau part normalement, c'est réglé.

**Plan B : l'acide chlorhydrique (déboucheur WC)**

4. Mets des gants et des lunettes, ouvre la fenêtre et éloigne les enfants. Ne le mélange jamais avec de l'eau de Javel ou un autre produit.
5. Verse tout le flacon dans la cuvette et laisse agir quelques minutes, sans utiliser la ventouse. 🎞️ *Le produit descend et le bouchon se dissout.*
6. Tire la chasse. Si c'est toujours bouché, appelle un plombier.

Décision André (02/10) : ventouse avant l'acide (jamais de ventouse après l'acide).

## Changer un joint ou resserrer un raccord — validé

15 min · clé ou pince, kit de joints fibre

1. Coupe l'eau avant de toucher au raccord. 🎞️ *Robinet d'arrêt tourné d'un quart de tour.*
2. Resserre doucement le raccord qui fuit. 🎞️ *La clé tourne d'un petit cran, flèche du sens.*
3. Remets l'eau en douceur. Ne force pas trop sur le raccord, tu pourrais abîmer la tuyauterie.

**Plan B : changer le joint**

4. Avant de commencer, achète un kit de joints fibre en magasin de bricolage.
5. Coupe l'eau, puis dévisse complètement le raccord. 🎞️ *L'écrou se dévisse, le raccord s'ouvre.*
6. Enlève le joint abîmé et compare-le aux joints du kit pour trouver le même. 🎞️ *Vieux joint posé à côté du neuf, la taille correspond.*
7. Mets le nouveau joint, puis revisse fermement, sans forcer comme une brute. 🎞️ *Le joint se place, l'écrou se revisse.*
8. Remets l'eau en douceur. Si ça fuit toujours, coupe l'eau et appelle un plombier.

Décisions André (02/10) : « revisse fermement, sans forcer comme une brute » ; outil laissé en « clé ou pince ».

## Nettoyer un siphon — supprimé

Décision André (02/10) : fait doublon avec « Déboucher un évier » (étapes 1 à 5). Le tuto `nettoyer-siphon` est retiré ;
les diagnostics `evier-bouche` et `odeur-egout` pointeront vers `deboucher-evier`. Passage à 15 tutos.

## Détartrer le robinet flotteur — validé

15 min · pince multiprise (ou autre pince), chiffon

ℹ️ Encadré en haut : quand tu tires la chasse, tu entends un sifflement et le réservoir met longtemps à se remplir ? C'est souvent le robinet flotteur qui est entartré.

1. Coupe l'eau au robinet des WC. S'il est dur, ne force pas : coupe l'eau générale. 🎞️ *Le petit robinet tourne d'un quart de tour.*
2. Ouvre le couvercle du réservoir et repère les raccords du robinet flotteur.
3. Dévisse sans forcer avec ta pince et sors le robinet flotteur. 🎞️ *La pince tourne l'écrou, le robinet flotteur sort du réservoir.*
4. Nettoie-le avec un chiffon et de l'eau claire. Fais attention à ne perdre aucun joint. 🎞️ *Le chiffon frotte, le tartre part.*
5. Revisse, puis remets l'eau. Vérifie que le remplissage s'arrête bien avant de refermer le couvercle. 🎞️ *Le réservoir se remplit, le flotteur monte et l'eau s'arrête.*
6. Si le remplissage est normal, c'est réparé.

**Plan B : la membrane est cassée**

7. Si le problème continue, c'est souvent la membrane du robinet flotteur qui est cassée. Il existe beaucoup de modèles : redémonte-le et apporte-le en magasin de bricolage pour qu'un vendeur t'aide à trouver la bonne membrane.
8. Autre solution : remplace tout le robinet flotteur par un neuf. Si tu n'es pas à l'aise pour rebrancher l'arrivée d'eau, appelle un plombier.

## Régler le flotteur — supprimé

Décision André (02/10). Le diagnostic `chasse-coule` (résultat « l'eau coule par le trop-plein ») pointait vers `regler-flotteur` :
il pointera vers `detartrer-flotteur` (validé par André). Passage à 14 tutos.

## Changer le mécanisme de chasse — validé (remplace « Changer le joint de clapet »)

1 h · pince, serviette, joint de clapet ou kit mécanisme + robinet flotteur

Nouvel id `changer-mecanisme-chasse` (ancien `changer-joint-clapet`) ; le diagnostic `chasse-coule` (résultat « l'eau coule au fond vers la cuvette ») pointera vers lui.

1. Ferme le robinet d'arrivée d'eau des WC, puis tire la chasse pour vider le réservoir. 🎞️ *Le niveau d'eau descend.*
2. Soulève le couvercle du réservoir et pose-le à plat sur une serviette.
3. Sors le mécanisme de chasse (la colonne au milieu) : sur beaucoup de modèles, un quart de tour puis tu le soulèves. 🎞️ *La colonne tourne d'un quart de tour et monte.*
4. Retire le joint en caoutchouc sous le mécanisme et emporte-le en magasin de bricolage pour acheter le même. Nettoie le fond du réservoir, mets le joint neuf, remets le mécanisme et rouvre l'eau.
5. Si l'eau ne coule plus dans la cuvette, c'est réparé.

**Plan B : le mécanisme ne sort pas, ou ça coule toujours — changer tout le mécanisme**

6. Ferme l'eau, vide le réservoir, puis dévisse le tuyau qui relie le robinet d'arrêt au robinet flotteur. 🎞️ *L'écrou tourne, le tuyau se détache.*
7. Sous le réservoir, dévisse les deux papillons, un de chaque côté. 🎞️ *Vue de dessous, les deux papillons tournent et tombent.*
8. Soulève délicatement le réservoir et retire-le de la cuvette : il est lourd et fragile. 🎞️ *Le réservoir monte et se décale.*
9. Dévisse les deux écrous qui tiennent les tiges filetées (là où étaient les papillons), puis dévisse le mécanisme de chasse. 🎞️ *L'écrou sous le réservoir tourne, le mécanisme sort par le haut.*
10. Monte le nouveau mécanisme et le nouveau robinet flotteur en suivant la notice fournie.
11. Change aussi le joint entre le réservoir et la cuvette (souvent fourni dans le kit), puis repose le réservoir. Revisse les papillons à la main, de façon égale des deux côtés, sans forcer : la céramique peut casser. Revisse le tuyau sur le robinet flotteur.
12. Remets l'eau et vérifie qu'il n'y a aucune fuite, sous le réservoir comme au niveau du tuyau. Si ça fuit encore, coupe l'eau et appelle un plombier.

## Raccrocher la tringle de chasse — supprimé

Décision André (02/10). Le diagnostic `chasse-ne-marche-plus` (résultat `resultat_tringle`) pointait vers `raccrocher-tringle` :
lien de tuto retiré, le conseil suffit (validé). Passage à 13 tutos.

## Tri du 02/10 (décisions André)

- Supprimés : `detartrer-tete-robinet`, `nettoyer-bonde`, `entretenir-groupe-securite`.
  Diagnostics concernés (`robinet-dur`, `douche-ecoule-mal`, `groupe-securite-goutte`) : proposition — retirer le lien de tuto,
  voir « Pannes modifiées suite au tri » ci-dessous (validé).
- Gardés tels quels : Détartrer un mousseur ou un pommeau, Changer un flexible de douche, Réarmer un disjoncteur, Changer une ampoule.
- Gardé mais à réécrire (dictée André) : Remplir un siphon.
- Total : 10 tutos.

## Pannes modifiées suite au tri (validé André 02/10)

**robinet-dur**
- `resultat_tete` (deux poignées) : 🟢 → 🟠, sans tuto. Conseil : « La tête du robinet est entartrée. Ne force pas : un plombier la nettoie ou la change rapidement. »
- `resultat_arret` (robinet général) : reste 🟠. Conseil : « Ne force jamais un robinet d'arrêt : s'il casse, tu ne pourras plus couper l'eau. Pour le changer, il faut couper l'eau de tout l'immeuble, ou parfois en amont du compteur pour une maison : c'est un travail de plombier. Pense à le manœuvrer 2 fois par an pour qu'il ne se bloque pas. »
- Libellé de la réponse : « Le robinet général » (on retire « ou un robinet d'arrêt »).

**groupe-securite-goutte**
- `resultat_normal` : reste 🟢, même conseil, sans tuto (`entretenir-groupe-securite` supprimé).
- `resultat_pro` : reste 🟠. Conseil : « Soit le groupe de sécurité est entartré à l'intérieur et il faut le changer, soit le chauffe-eau chauffe trop (thermostat ou contacteur jour/nuit en panne). Ne bouche jamais le groupe : le ballon pourrait exploser. Appelle un plombier. »

**douche-ecoule-mal** : conseil complété (« Dévisse la grille de la bonde et retire les cheveux. ») — tuto `nettoyer-bonde` supprimé, lien retiré.
**chasse-ne-marche-plus** : lien vers `raccrocher-tringle` retiré, le conseil suffit.

## Odeur d'égout dans la maison — validé (remplace « Remplir un siphon », id `remplir-siphon` conservé)

5 min · aucun outil

⚠️ Encadré en haut : si ça sent le gaz (odeur d'œuf pourri très forte), ce n'est pas un siphon → bouton vers « Odeur de gaz ? ».

1. Repère d'où vient l'odeur : salle de bain, évier ou WC.
2. Si elle vient d'une douche, d'un lavabo ou d'un évier, le siphon n'a sûrement plus assez d'eau. Fais couler l'eau une bonne minute. 🎞️ *Schéma siphon existant : le coude se remplit.*
3. Attends quelques minutes : si l'odeur disparaît, c'était ça. Fais couler l'eau de temps en temps dans les points d'eau peu utilisés.
4. Si l'odeur vient des WC, le tuyau d'évacuation fuit sûrement, au niveau d'un joint ou du tuyau lui-même. Appelle un plombier pour la réparation.
