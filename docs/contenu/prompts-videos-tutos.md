# Prompts pour générer les vidéos des tutos

Un prompt par schéma animé, prêt à copier-coller dans une IA de génération vidéo (Sora, Veo, Kling, Runway…).

- Les prompts sont **en anglais** : la plupart de ces IA donnent de meilleurs résultats en anglais.
- Chaque prompt contient déjà le style commun (fond sombre, traits blancs, eau bleue, outils orange…) pour que toutes les vidéos se ressemblent et collent aux couleurs de l'appli.
- Pour un rendu **réaliste** au lieu de schématique, remplace la phrase « Style: … » par :
  > Style: realistic close-up video, well-lit bathroom/kitchen, gloved hands doing the gesture, fixed camera, 4 seconds, 16:9.
- L'identifiant (`evier-devisser-siphon`…) est le même que celui des schémas de l'appli : garde-le comme nom de fichier.

## Déboucher un évier

### 1. `evier-devisser-siphon` — étape 1

**Étape :** Mets un seau sous le siphon, puis dévisse la base du siphon.

**Ce qu'on voit :** Le bouchon du siphon tourne, se détache et tombe dans le seau ; l'eau coule dans le seau.

```text
Side cross-section of a bottle trap under a kitchen sink, a bucket placed below it. The round cap at the bottom of the trap unscrews (a curved arrow shows the twisting motion), comes off and drops into the bucket. Dirty water drips from the open trap into the bucket, whose water level slowly rises.

Style: clean flat 2D vector animation, simple technical cross-section diagram, dark navy background (#0b0d14), white line-art outlines, water in bright blue (#4FA3FF), tools in orange (#F5A623), dirt in brown, success check mark in green (#2EE9A5). Minimalist, no text, no people or realistic hands, fixed camera, smooth seamless loop of about 4 seconds, 16:9.
```

### 2. `evier-nettoyer` — étape 3

**Étape :** Nettoie l'intérieur avec un couteau, une cuillère ou une baguette.

**Ce qu'on voit :** Une baguette racle l'intérieur du siphon ouvert, les saletés tombent dans le seau.

```text
Side cross-section of an open bottle trap under a sink (its cap removed and lying next to the bucket). A wooden chopstick goes in from below and scrapes the inside of the trap with short back-and-forth movements. Brown clumps of dirt and hair fall into the bucket below.

Style: clean flat 2D vector animation, simple technical cross-section diagram, dark navy background (#0b0d14), white line-art outlines, water in bright blue (#4FA3FF), tools in orange (#F5A623), dirt in brown, success check mark in green (#2EE9A5). Minimalist, no text, no people or realistic hands, fixed camera, smooth seamless loop of about 4 seconds, 16:9.
```

### 3. `evier-ventouse` — étape 6

**Étape :** Bouche le trop-plein avec une éponge, mets un peu d'eau, puis donne des à-coups avec la ventouse.

**Ce qu'on voit :** Une éponge bouche le trop-plein, la ventouse monte et descend sur la bonde, des flèches montrent la pression dans le tuyau.

```text
Cross-section of a kitchen sink with a little water in the basin. First a yellow sponge slides in and plugs the small overflow hole near the top of the basin wall. Then a rubber plunger placed over the drain pumps up and down several times; arrows inside the drain pipe below pulse downward with each push to show the pressure.

Style: clean flat 2D vector animation, simple technical cross-section diagram, dark navy background (#0b0d14), white line-art outlines, water in bright blue (#4FA3FF), tools in orange (#F5A623), dirt in brown, success check mark in green (#2EE9A5). Minimalist, no text, no people or realistic hands, fixed camera, smooth seamless loop of about 4 seconds, 16:9.
```

### 4. `evier-demonter-siphon` — étape 7

**Étape :** Remets le seau, démonte tout le siphon et range les joints de côté.

**Ce qu'on voit :** Le siphon entier se détache du tuyau et descend ; les joints apparaissent posés à côté.

```text
Side cross-section of a sink drain: the whole bottle trap unscrews at its two nuts (top and side), detaches from the pipes and moves down above a bucket. Then two small rubber washers appear set aside neatly on the right.

Style: clean flat 2D vector animation, simple technical cross-section diagram, dark navy background (#0b0d14), white line-art outlines, water in bright blue (#4FA3FF), tools in orange (#F5A623), dirt in brown, success check mark in green (#2EE9A5). Minimalist, no text, no people or realistic hands, fixed camera, smooth seamless loop of about 4 seconds, 16:9.
```

### 5. `evier-furet` — étape 8

**Étape :** Enfonce le furet d'environ 5 cm, bloque-le, puis tourne dans le sens des aiguilles d'une montre.

**Ce qu'on voit :** Le furet avance de 5 cm dans le tuyau, une flèche montre la rotation, il avance encore et le bouchon se défait.

```text
Horizontal cross-section of a drain pipe with a brown clog further inside. A plumber's drain snake (coiled spring cable with a hand crank) is pushed in by a short step of about 5 cm, then stops while a clockwise circular arrow shows it turning, then advances another step and turns again. On reaching the clog it breaks the clog apart and the pieces wash away.

Style: clean flat 2D vector animation, simple technical cross-section diagram, dark navy background (#0b0d14), white line-art outlines, water in bright blue (#4FA3FF), tools in orange (#F5A623), dirt in brown, success check mark in green (#2EE9A5). Minimalist, no text, no people or realistic hands, fixed camera, smooth seamless loop of about 4 seconds, 16:9.
```

## Déboucher des WC

### 6. `wc-ecoulement-lent` — étape 1

**Étape :** Tire un peu la chasse : si l'eau s'écoule lentement, c'est un bouchon dans la cuvette.

**Ce qu'on voit :** Le niveau d'eau dans la cuvette baisse très lentement à cause d'un bouchon dans le tuyau.

```text
Cross-section of a toilet bowl and its outlet pipe, with a brown clog stuck in the pipe. The water level in the bowl goes down very slowly, a few drops passing the clog one at a time.

Style: clean flat 2D vector animation, simple technical cross-section diagram, dark navy background (#0b0d14), white line-art outlines, water in bright blue (#4FA3FF), tools in orange (#F5A623), dirt in brown, success check mark in green (#2EE9A5). Minimalist, no text, no people or realistic hands, fixed camera, smooth seamless loop of about 4 seconds, 16:9.
```

### 7. `wc-ventouse` — étape 2

**Étape :** Place la ventouse au fond de la cuvette et donne des à-coups.

**Ce qu'on voit :** La ventouse monte et descend au fond de la cuvette, des flèches poussent le bouchon qui finit par partir.

```text
Cross-section of a toilet bowl with water and a brown clog in the outlet pipe. A toilet plunger sits at the bottom of the bowl over the outlet and pumps up and down; arrows pulse down the pipe with each push and the clog moves down and away. A green check mark appears at the end.

Style: clean flat 2D vector animation, simple technical cross-section diagram, dark navy background (#0b0d14), white line-art outlines, water in bright blue (#4FA3FF), tools in orange (#F5A623), dirt in brown, success check mark in green (#2EE9A5). Minimalist, no text, no people or realistic hands, fixed camera, smooth seamless loop of about 4 seconds, 16:9.
```

### 8. `wc-acide` — étape 5

**Étape :** Verse tout le flacon dans la cuvette et laisse agir quelques minutes, sans utiliser la ventouse.

**Ce qu'on voit :** Le flacon de déboucheur se vide dans la cuvette, le produit descend et le bouchon se dissout.

```text
Cross-section of a toilet bowl with a brown clog in the outlet pipe. A bottle with an orange hazard label tilts and pours its liquid into the bowl. The liquid sinks down to the clog, which slowly shrinks and dissolves. No plunger anywhere in the scene.

Style: clean flat 2D vector animation, simple technical cross-section diagram, dark navy background (#0b0d14), white line-art outlines, water in bright blue (#4FA3FF), tools in orange (#F5A623), dirt in brown, success check mark in green (#2EE9A5). Minimalist, no text, no people or realistic hands, fixed camera, smooth seamless loop of about 4 seconds, 16:9.
```

## Changer un joint ou resserrer un raccord

### 9. `couper-eau` — étape 1

**Étape :** Coupe l'eau avant de toucher au raccord.

**Ce qu'on voit :** La manette du robinet d'arrêt tourne d'un quart de tour ; l'eau arrête de couler dans le tuyau. (Réutilisé dans les tutos WC.)

```text
Side view of a water pipe with a quarter-turn shut-off valve. Water flows through the pipe (shown as moving blue dashes). The lever handle, parallel to the pipe, rotates a quarter turn to become perpendicular to the pipe, and the water flow after the valve stops.

Style: clean flat 2D vector animation, simple technical cross-section diagram, dark navy background (#0b0d14), white line-art outlines, water in bright blue (#4FA3FF), tools in orange (#F5A623), dirt in brown, success check mark in green (#2EE9A5). Minimalist, no text, no people or realistic hands, fixed camera, smooth seamless loop of about 4 seconds, 16:9.
```

### 10. `raccord-resserrer` — étape 2

**Étape :** Resserre doucement le raccord qui fuit.

**Ce qu'on voit :** Une goutte fuit sous l'écrou ; la clé tourne d'un petit cran, la fuite s'arrête.

```text
Close-up side view of two pipes joined by a hexagonal compression nut, with a drop of water leaking from under the nut. An adjustable wrench grips the nut and turns it gently by a small angle. The leaking stops and a green check mark appears.

Style: clean flat 2D vector animation, simple technical cross-section diagram, dark navy background (#0b0d14), white line-art outlines, water in bright blue (#4FA3FF), tools in orange (#F5A623), dirt in brown, success check mark in green (#2EE9A5). Minimalist, no text, no people or realistic hands, fixed camera, smooth seamless loop of about 4 seconds, 16:9.
```

### 11. `raccord-devisser` — étape 5

**Étape :** Coupe l'eau, puis dévisse complètement le raccord.

**Ce qu'on voit :** L'écrou tourne et glisse le long du tuyau ; le raccord s'ouvre et montre le joint.

```text
Close-up side view of two pipes joined by a hexagonal nut. A curved arrow shows the nut unscrewing, then the nut slides along the pipe and the joint opens, revealing a thin flat fibre washer between the two pipe ends.

Style: clean flat 2D vector animation, simple technical cross-section diagram, dark navy background (#0b0d14), white line-art outlines, water in bright blue (#4FA3FF), tools in orange (#F5A623), dirt in brown, success check mark in green (#2EE9A5). Minimalist, no text, no people or realistic hands, fixed camera, smooth seamless loop of about 4 seconds, 16:9.
```

### 12. `joint-comparer` — étape 6

**Étape :** Enlève le joint abîmé et compare-le aux joints du kit pour trouver le même.

**Ce qu'on voit :** Le vieux joint abîmé se pose à côté des joints neufs du kit, sur celui de la même taille.

```text
Top view: an old, cracked flat washer on the left; on the right an open box with new washers of three different sizes. The old washer slides over to the new washers and stops on the one of exactly the same size, which lights up with a green check mark.

Style: clean flat 2D vector animation, simple technical cross-section diagram, dark navy background (#0b0d14), white line-art outlines, water in bright blue (#4FA3FF), tools in orange (#F5A623), dirt in brown, success check mark in green (#2EE9A5). Minimalist, no text, no people or realistic hands, fixed camera, smooth seamless loop of about 4 seconds, 16:9.
```

### 13. `joint-remonter` — étape 7

**Étape :** Mets le nouveau joint, puis revisse fermement, sans forcer comme une brute.

**Ce qu'on voit :** Le joint neuf se place entre les deux tuyaux, l'écrou glisse et se revisse.

```text
Close-up side view of two pipe ends slightly apart. A new flat washer moves into place between them, then the hexagonal nut slides back over the joint and screws on (curved arrow). A green check mark appears.

Style: clean flat 2D vector animation, simple technical cross-section diagram, dark navy background (#0b0d14), white line-art outlines, water in bright blue (#4FA3FF), tools in orange (#F5A623), dirt in brown, success check mark in green (#2EE9A5). Minimalist, no text, no people or realistic hands, fixed camera, smooth seamless loop of about 4 seconds, 16:9.
```

## Détartrer le robinet flotteur

### 14. `flotteur-sortir` — étape 3

**Étape :** Dévisse sans forcer avec ta pince et sors le robinet flotteur.

**Ce qu'on voit :** La pince tourne l'écrou sous le réservoir, l'écrou tombe et le robinet flotteur sort par le haut.

```text
Cross-section of an empty toilet cistern. On the left, the fill valve (a vertical tube with a float) goes through the bottom of the tank, held by a nut underneath. Pliers grip the nut under the tank and turn it; the nut comes off, then the fill valve is lifted up and out of the top of the tank.

Style: clean flat 2D vector animation, simple technical cross-section diagram, dark navy background (#0b0d14), white line-art outlines, water in bright blue (#4FA3FF), tools in orange (#F5A623), dirt in brown, success check mark in green (#2EE9A5). Minimalist, no text, no people or realistic hands, fixed camera, smooth seamless loop of about 4 seconds, 16:9.
```

### 15. `flotteur-nettoyer` — étape 4

**Étape :** Nettoie-le avec un chiffon et de l'eau claire.

**Ce qu'on voit :** Un chiffon frotte la tête du robinet flotteur, les taches de tartre disparaissent.

```text
Close-up of the head of a toilet fill valve covered with white limescale spots. A damp cloth rubs back and forth over it and the white spots fade away until the part is clean.

Style: clean flat 2D vector animation, simple technical cross-section diagram, dark navy background (#0b0d14), white line-art outlines, water in bright blue (#4FA3FF), tools in orange (#F5A623), dirt in brown, success check mark in green (#2EE9A5). Minimalist, no text, no people or realistic hands, fixed camera, smooth seamless loop of about 4 seconds, 16:9.
```

### 16. `reservoir-remplissage` — étape 5

**Étape :** Revisse, puis remets l'eau. Vérifie que le remplissage s'arrête bien.

**Ce qu'on voit :** Le réservoir se remplit, le flotteur monte avec l'eau et l'arrivée d'eau s'arrête toute seule.

```text
Cross-section of a toilet cistern filling up: water pours from the top of the fill valve, the water level rises and the float rises with it. When the float reaches its top position the incoming water stops by itself, and a green check mark appears.

Style: clean flat 2D vector animation, simple technical cross-section diagram, dark navy background (#0b0d14), white line-art outlines, water in bright blue (#4FA3FF), tools in orange (#F5A623), dirt in brown, success check mark in green (#2EE9A5). Minimalist, no text, no people or realistic hands, fixed camera, smooth seamless loop of about 4 seconds, 16:9.
```

## Changer le mécanisme de chasse

### 17. `reservoir-vidange` — étape 1

**Étape :** Ferme le robinet d'arrivée d'eau des WC, puis tire la chasse pour vider le réservoir.

**Ce qu'on voit :** Le bouton de chasse s'enfonce et le niveau d'eau du réservoir descend.

```text
Cross-section of a toilet cistern full of water, its water supply closed. The flush button on the lid is pressed and the water level drains down quickly through the bottom outlet until the tank is almost empty.

Style: clean flat 2D vector animation, simple technical cross-section diagram, dark navy background (#0b0d14), white line-art outlines, water in bright blue (#4FA3FF), tools in orange (#F5A623), dirt in brown, success check mark in green (#2EE9A5). Minimalist, no text, no people or realistic hands, fixed camera, smooth seamless loop of about 4 seconds, 16:9.
```

### 18. `mecanisme-quart-tour` — étape 3

**Étape :** Sors le mécanisme de chasse : un quart de tour puis tu le soulèves.

**Ce qu'on voit :** La colonne au milieu du réservoir tourne d'un quart de tour, puis monte et sort avec son joint.

```text
Cross-section of an empty toilet cistern with the flush valve (a vertical column) in the centre and a rubber seal at its base. A curved arrow shows the column turning a quarter turn, then the column is lifted straight up and out, the rubber seal visible at its bottom.

Style: clean flat 2D vector animation, simple technical cross-section diagram, dark navy background (#0b0d14), white line-art outlines, water in bright blue (#4FA3FF), tools in orange (#F5A623), dirt in brown, success check mark in green (#2EE9A5). Minimalist, no text, no people or realistic hands, fixed camera, smooth seamless loop of about 4 seconds, 16:9.
```

### 19. `tuyau-alimentation` — étape 6

**Étape :** Dévisse le tuyau qui relie le robinet d'arrêt au robinet flotteur.

**Ce qu'on voit :** L'écrou du tuyau sous le réservoir tourne, le tuyau se détache.

```text
Side view under a toilet cistern: a flexible water hose runs from a small shut-off valve on the wall up to the bottom of the tank. A curved arrow shows the hose nut under the tank unscrewing, then the hose detaches and drops down slightly.

Style: clean flat 2D vector animation, simple technical cross-section diagram, dark navy background (#0b0d14), white line-art outlines, water in bright blue (#4FA3FF), tools in orange (#F5A623), dirt in brown, success check mark in green (#2EE9A5). Minimalist, no text, no people or realistic hands, fixed camera, smooth seamless loop of about 4 seconds, 16:9.
```

### 20. `papillons` — étape 7

**Étape :** Sous le réservoir, dévisse les deux papillons, un de chaque côté.

**Ce qu'on voit :** Vue de dessous : les deux écrous papillons tournent et tombent.

```text
Side cross-section of where a toilet cistern sits on the back of the bowl: two long bolts go through both parts, each held underneath by a wing nut. Both wing nuts spin and come off, dropping down.

Style: clean flat 2D vector animation, simple technical cross-section diagram, dark navy background (#0b0d14), white line-art outlines, water in bright blue (#4FA3FF), tools in orange (#F5A623), dirt in brown, success check mark in green (#2EE9A5). Minimalist, no text, no people or realistic hands, fixed camera, smooth seamless loop of about 4 seconds, 16:9.
```

### 21. `reservoir-retirer` — étape 8

**Étape :** Soulève délicatement le réservoir et retire-le de la cuvette : il est lourd et fragile.

**Ce qu'on voit :** Le réservoir monte doucement et se décale de la cuvette ; le joint entre les deux apparaît.

```text
Side view of a close-coupled toilet. The ceramic cistern is lifted carefully and slowly up from the back of the bowl and moved aside, revealing the round foam seal between the two parts.

Style: clean flat 2D vector animation, simple technical cross-section diagram, dark navy background (#0b0d14), white line-art outlines, water in bright blue (#4FA3FF), tools in orange (#F5A623), dirt in brown, success check mark in green (#2EE9A5). Minimalist, no text, no people or realistic hands, fixed camera, smooth seamless loop of about 4 seconds, 16:9.
```

### 22. `mecanisme-ecrou` — étape 9

**Étape :** Dévisse les deux écrous des tiges filetées, puis dévisse le mécanisme de chasse.

**Ce qu'on voit :** Sous le réservoir posé à part, le gros écrou tourne et tombe, la colonne sort par le haut.

```text
Cross-section of a toilet cistern removed from the toilet. Under its bottom, the large plastic nut holding the flush valve unscrews (curved arrow) and drops off, then the flush valve column is lifted out through the top.

Style: clean flat 2D vector animation, simple technical cross-section diagram, dark navy background (#0b0d14), white line-art outlines, water in bright blue (#4FA3FF), tools in orange (#F5A623), dirt in brown, success check mark in green (#2EE9A5). Minimalist, no text, no people or realistic hands, fixed camera, smooth seamless loop of about 4 seconds, 16:9.
```

## Détartrer un mousseur ou un pommeau

### 23. `mousseur-devisser` — étape 2

**Étape :** Dévisse à la main le mousseur (le petit embout au bout du robinet).

**Ce qu'on voit :** Le petit embout au bout du robinet tourne et se détache vers le bas.

```text
Side view of a kitchen tap spout. The small aerator at the tip of the spout unscrews by hand (curved arrow showing the turning) and comes off downward; the sink plug is in place below.

Style: clean flat 2D vector animation, simple technical cross-section diagram, dark navy background (#0b0d14), white line-art outlines, water in bright blue (#4FA3FF), tools in orange (#F5A623), dirt in brown, success check mark in green (#2EE9A5). Minimalist, no text, no people or realistic hands, fixed camera, smooth seamless loop of about 4 seconds, 16:9.
```

### 24. `mousseur-tremper` — étape 4

**Étape :** Fais tremper le mousseur ou le pommeau au moins 30 minutes dans du vinaigre blanc.

**Ce qu'on voit :** Le mousseur plonge dans un bol de vinaigre, des bulles montent et le tartre disparaît.

```text
A tap aerator covered in white limescale drops into a clear bowl of white vinegar. Small bubbles rise from it and the limescale slowly fades away; a small clock indicates 30 minutes passing.

Style: clean flat 2D vector animation, simple technical cross-section diagram, dark navy background (#0b0d14), white line-art outlines, water in bright blue (#4FA3FF), tools in orange (#F5A623), dirt in brown, success check mark in green (#2EE9A5). Minimalist, no text, no people or realistic hands, fixed camera, smooth seamless loop of about 4 seconds, 16:9.
```

## Changer un flexible de douche

### 25. `flexible-devisser` — étape 2

**Étape :** Dévisse le flexible à la main : en bas sous le robinet, puis en haut au pommeau.

**Ce qu'on voit :** L'écrou du flexible sous le robinet tourne, le flexible se détache.

```text
Side view of a shower mixer tap with a flexible shower hose screwed underneath. A curved arrow shows the hose nut being unscrewed by hand, then the hose comes off downward, revealing the small washer.

Style: clean flat 2D vector animation, simple technical cross-section diagram, dark navy background (#0b0d14), white line-art outlines, water in bright blue (#4FA3FF), tools in orange (#F5A623), dirt in brown, success check mark in green (#2EE9A5). Minimalist, no text, no people or realistic hands, fixed camera, smooth seamless loop of about 4 seconds, 16:9.
```

## Changer une ampoule

### 26. `ampoule-devisser` — étape 5

**Étape :** Dévisse l'ampoule.

**Ce qu'on voit :** Le disjoncteur est coupé ; l'ampoule tourne et descend hors de la douille.

```text
Side view of a ceiling light socket with a light bulb, switched off (a small circuit breaker icon in the corner shows the lever down). A curved arrow shows the bulb turning anticlockwise, then the bulb comes down out of the socket.

Style: clean flat 2D vector animation, simple technical cross-section diagram, dark navy background (#0b0d14), white line-art outlines, water in bright blue (#4FA3FF), tools in orange (#F5A623), dirt in brown, success check mark in green (#2EE9A5). Minimalist, no text, no people or realistic hands, fixed camera, smooth seamless loop of about 4 seconds, 16:9.
```

## Odeur d’égout dans la maison

### 27. `siphon` — étape 2

**Étape :** Fais couler l’eau une bonne minute.

**Ce qu'on voit :** Des gouttes tombent dans le siphon, l’eau remplit le coude et bloque les odeurs. (Schéma déjà dans l’appli.)

```text
Side cross-section of a U-shaped sink trap that is almost dry. Water drips in from the drain above and the water level in the U-bend rises until it fills the bend, forming a water seal that blocks sewer smells (shown as faint grey wavy lines from below that stop at the water).

Style: clean flat 2D vector animation, simple technical cross-section diagram, dark navy background (#0b0d14), white line-art outlines, water in bright blue (#4FA3FF), tools in orange (#F5A623), dirt in brown, success check mark in green (#2EE9A5). Minimalist, no text, no people or realistic hands, fixed camera, smooth seamless loop of about 4 seconds, 16:9.
```

## Réarmer un disjoncteur

### 28. `disjoncteur` — étape 4

**Étape :** Repère le disjoncteur en position basse et remonte-le d’un coup franc.

**Ce qu'on voit :** Le levier du disjoncteur remonte d’un coup, une flèche verte montre le geste puis une coche apparaît. (Schéma déjà dans l’appli.)

```text
Front view of a single circuit breaker in an electrical panel, its lever in the down (off) position. A green upward arrow appears, the lever snaps up to the on position in one firm movement, and a green check mark appears.

Style: clean flat 2D vector animation, simple technical cross-section diagram, dark navy background (#0b0d14), white line-art outlines, water in bright blue (#4FA3FF), tools in orange (#F5A623), dirt in brown, success check mark in green (#2EE9A5). Minimalist, no text, no people or realistic hands, fixed camera, smooth seamless loop of about 4 seconds, 16:9.
```

---

Les deux schémas déjà dans l'appli (`siphon` pour « Odeur d'égout dans la maison », `disjoncteur` pour « Réarmer un disjoncteur ») n'ont pas de prompt ici ; je peux en ajouter si tu veux aussi des vidéos pour eux.
