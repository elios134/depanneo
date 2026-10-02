import type { Tuto } from '@/domaine/types';

export const tutos: Tuto[] = [
  {
    id: 'deboucher-evier',
    titre: 'Déboucher un évier',
    categorie: 'plomberie',
    icone: 'waves',
    duree: '10 min',
    outil: 'furet',
    etapes: [
      { texte: 'Mets des gants. N\'utilise jamais la ventouse après avoir versé un produit déboucheur : il pourrait t\'éclabousser.', schema: 'evier-devisser-siphon' },
      { texte: 'Retire l\'eau stagnante avec un récipient si l\'évier est plein.', schema: 'evier-nettoyer' },
      { texte: 'Utilise une ventouse en appuyant fermement plusieurs fois sur l\'orifice d\'évacuation.', schema: 'evier-ventouse' },
      { texte: 'Si ça ne suffit pas, utilise un furet en le poussant doucement dans la canalisation.', schema: 'evier-furet' },
      { texte: 'Provisoire : démonter le siphon.', schema: 'evier-demonter-siphon' }, // TEMPORAIRE, la Tâche 6 réécrit ce tuto
    ],
  },
  {
    id: 'deboucher-wc',
    titre: 'Déboucher des WC',
    categorie: 'plomberie',
    icone: 'toilet',
    duree: '5 min',
    outil: 'ventouse',
    etapes: [
      { texte: 'Mets des gants et enfonce une ventouse adaptée dans la cuvette.', schema: 'wc-ventouse' }, // TEMPORAIRE (Tâche 3), la Tâche 6 réécrit ce tuto
      { texte: 'Effectue des mouvements de va-et-vient fermes pendant une minute.', schema: 'wc-ecoulement-lent' }, // TEMPORAIRE (Tâche 3), la Tâche 6 réécrit ce tuto
      { texte: 'Si ça ne suffit pas, utilise un furet spécial WC en le poussant doucement.', schema: 'wc-acide' }, // TEMPORAIRE (Tâche 3), la Tâche 6 réécrit ce tuto
    ],
    // TEMPORAIRE (Tâche 5), la Tâche 6 met le vrai contenu
    encadre: { ton: 'alerte', titre: "L'eau remonte sans que tu tires la chasse ?", texte: "N'essaie rien et appelle tout de suite un plombier." },
    planB: { sousTitre: 'si ça ne suffit pas', etapes: ['Appelle un plombier.'] }, // TEMPORAIRE (Tâche 5)
  },
  {
    id: 'changer-joint',
    titre: 'Changer un joint ou resserrer un raccord',
    categorie: 'plomberie',
    icone: 'wrench',
    duree: '15 min',
    outil: 'clé',
    etapes: [
      { texte: 'Coupe l\'eau avant de commencer (voir le geste "Couper l\'eau").', schema: 'couper-eau' }, // TEMPORAIRE (Tâche 3), la Tâche 6 réécrit ce tuto
      { texte: 'Dévisse le raccord qui fuit avec une clé adaptée.', schema: 'raccord-devisser' }, // TEMPORAIRE (Tâche 3), la Tâche 6 réécrit ce tuto
      { texte: 'Remplace le joint usé par un joint neuf de même taille, puis resserre sans forcer excessivement.', schema: 'joint-comparer' }, // TEMPORAIRE (Tâche 3), la Tâche 6 réécrit ce tuto
      { texte: 'Rouvre l\'eau doucement et vérifie qu\'il n\'y a plus de fuite.', schema: 'joint-remonter' }, // TEMPORAIRE (Tâche 3), la Tâche 6 réécrit ce tuto
    ],
  },
  {
    id: 'reparer-disjoncteur',
    titre: 'Réarmer un disjoncteur',
    categorie: 'electricite',
    icone: 'toggle-left',
    duree: '2 min',
    outil: 'aucun',
    etapes: [
      'Si le tableau électrique est mouillé, chaud ou sent le brûlé, n\'y touche pas : appelle un électricien.',
      'Avec les mains sèches, ouvre la porte du tableau électrique (ne démonte jamais le capot).',
      'Si tu sais quel appareil a fait sauter le disjoncteur, débranche-le d\'abord.',
      {
        texte: 'Repère le disjoncteur en position basse et remonte-le d\'un coup franc.',
        schema: 'disjoncteur',
      },
      'S\'il redescend tout de suite, ne force pas : débranche les appareils de la pièce et appelle un électricien s\'il re-saute.',
    ],
  },
  {
    id: 'nettoyer-siphon',
    titre: 'Nettoyer un siphon',
    categorie: 'plomberie',
    icone: 'waves',
    duree: '10 min',
    outil: 'seau',
    etapes: [
      'Si tu as versé un produit déboucheur, ne démonte pas le siphon : l\'eau qui tomberait peut brûler la peau. Appelle un plombier.',
      'Mets un seau ou une bassine sous le siphon (le coude sous l\'évier) et une serpillière autour.',
      'Mets des gants. Dévisse à la main la grosse bague du siphon (ou le bouchon tout en bas). L\'eau sale tombe dans le seau : c\'est normal.',
      'Vide le siphon dans les WC, puis nettoie-le avec une vieille brosse à dents et de l\'eau chaude.',
      'Vérifie que le joint (la rondelle en caoutchouc) est bien en place, puis revisse à la main, sans outil.',
      'Fais couler l\'eau une minute et regarde sous l\'évier : si ça goutte, resserre un peu la bague à la main.',
    ],
  },
  {
    id: 'detartrer-flotteur',
    titre: 'Détartrer le robinet flotteur',
    categorie: 'plomberie',
    icone: 'hourglass',
    duree: '20 min',
    outil: 'vinaigre blanc',
    etapes: [
      'Ferme le petit robinet d\'arrivée d\'eau des WC (dans le sens des aiguilles d\'une montre), puis tire la chasse pour vider le réservoir.',
      'Soulève le couvercle du réservoir et pose-le à plat sur une serviette : il est lourd et casse facilement.',
      'Repère le robinet flotteur : la pièce reliée au tuyau d\'arrivée, avec un flotteur qui monte et descend.',
      { texte: 'Enlève le capuchon du robinet flotteur s\'il se déclipse ou se dévisse à la main. S\'il faut un outil ou forcer, arrête-toi là et appelle un plombier.', schema: 'flotteur-sortir' }, // TEMPORAIRE (Tâche 4), la Tâche 6 réécrit ce tuto
      { texte: 'Fais tremper les petites pièces 15 minutes dans du vinaigre blanc, frotte-les avec une vieille brosse à dents, puis rince-les.', schema: 'flotteur-nettoyer' }, // TEMPORAIRE (Tâche 4), la Tâche 6 réécrit ce tuto
      { texte: 'Remonte tout, rouvre le petit robinet d\'arrivée et vérifie que le réservoir se remplit plus vite et s\'arrête bien.', schema: 'reservoir-remplissage' }, // TEMPORAIRE (Tâche 4), la Tâche 6 réécrit ce tuto
    ],
  },
  {
    id: 'regler-flotteur',
    titre: 'Régler le flotteur',
    categorie: 'plomberie',
    icone: 'rotate-cw',
    duree: '10 min',
    outil: 'tournevis',
    etapes: [
      'Soulève le couvercle du réservoir et pose-le à plat sur une serviette.',
      'Regarde le niveau de l\'eau : il doit s\'arrêter 2 à 3 cm sous le haut du tube du milieu (le trop-plein).',
      'Trouve le réglage du flotteur : une vis en haut du robinet flotteur, ou un clip le long de sa tige.',
      'Baisse un peu le flotteur : tourne la vis d\'un tour avec un tournevis, ou fais glisser le clip de 1 cm vers le bas.',
      'Tire la chasse et regarde le remplissage. Recommence jusqu\'à ce que l\'eau s\'arrête sous le haut du trop-plein.',
      'Si l\'eau coule toujours dans le trop-plein, le robinet flotteur est usé : ferme le petit robinet d\'arrivée et appelle un plombier.',
    ],
  },
  {
    id: 'changer-joint-clapet',
    titre: 'Changer le joint de clapet',
    categorie: 'plomberie',
    icone: 'rotate-cw',
    duree: '20 min',
    outil: 'joint neuf',
    etapes: [
      { texte: 'Ferme le petit robinet d\'arrivée d\'eau des WC, puis tire la chasse pour vider le réservoir.', schema: 'tuyau-alimentation' }, // TEMPORAIRE (Tâche 4), la Tâche 6 réécrit ce tuto
      { texte: 'Soulève le couvercle du réservoir et pose-le à plat sur une serviette.', schema: 'papillons' }, // TEMPORAIRE (Tâche 4), la Tâche 6 réécrit ce tuto
      { texte: 'Sors le mécanisme de chasse (la colonne au milieu) : sur la plupart des modèles, tourne-le d\'un quart de tour et soulève-le. S\'il ne vient pas à la main, arrête-toi là et appelle un plombier.', schema: 'mecanisme-quart-tour' }, // TEMPORAIRE (Tâche 4), la Tâche 6 réécrit ce tuto
      { texte: 'Retire le joint en caoutchouc sous le mécanisme et emporte-le au magasin de bricolage pour acheter le même.', schema: 'reservoir-retirer' }, // TEMPORAIRE (Tâche 4), la Tâche 6 réécrit ce tuto
      { texte: 'Nettoie le fond du réservoir, là où le joint s\'appuie (éponge et vinaigre blanc), puis mets le joint neuf.', schema: 'mecanisme-ecrou' }, // TEMPORAIRE (Tâche 4), la Tâche 6 réécrit ce tuto
      { texte: 'Remets le mécanisme, rouvre le petit robinet d\'arrivée et vérifie que l\'eau ne coule plus dans la cuvette.', schema: 'reservoir-vidange' }, // TEMPORAIRE (Tâche 4), la Tâche 6 réécrit ce tuto
    ],
  },
  {
    id: 'raccrocher-tringle',
    titre: 'Raccrocher la tringle de chasse',
    categorie: 'plomberie',
    icone: 'circle-x',
    duree: '5 min',
    outil: 'aucun',
    etapes: [
      'Soulève doucement le couvercle du réservoir : si le bouton est dessus, il peut être relié au mécanisme. Pose-le à plat sur une serviette.',
      'Repère la petite tige, la chaînette ou le câble entre le bouton et le mécanisme : il pend dans le vide.',
      'Raccroche-le à la main à son crochet ou à son encoche sur le mécanisme.',
      'Remets le couvercle et appuie sur le bouton : la chasse doit partir. Si la pièce est cassée, un plombier pourra la changer.',
    ],
  },
  {
    id: 'detartrer-tete-robinet',
    titre: 'Détartrer une tête de robinet',
    categorie: 'plomberie',
    icone: 'wrench',
    duree: '20 min',
    outil: 'vinaigre blanc',
    etapes: [
      'Coupe l\'eau : ferme le petit robinet sous l\'évier, ou le robinet général (voir le geste « Couper l\'eau »).',
      'Ouvre le robinet pour vider l\'eau qui reste, et mets le bouchon de l\'évier pour ne pas perdre de petites pièces.',
      'Retire le petit cache sur la poignée (il se déclipse avec l\'ongle), dévisse la vis, puis enlève la poignée.',
      'Dévisse la tête du robinet avec une clé, en tenant le robinet de l\'autre main pour ne pas le tordre. Si ça résiste, ne force pas : appelle un plombier.',
      'Fais tremper la tête 15 minutes dans du vinaigre blanc, puis brosse-la et rince-la.',
      'Revisse la tête sans forcer, remets la poignée, rouvre l\'eau doucement et vérifie qu\'il n\'y a pas de fuite.',
    ],
  },
  {
    id: 'detartrer-mousseur',
    titre: 'Détartrer un mousseur ou un pommeau',
    categorie: 'plomberie',
    icone: 'gauge',
    duree: '10 min',
    outil: 'vinaigre blanc',
    etapes: [
      'Mets le bouchon de l\'évier pour ne pas perdre de petites pièces.',
      { texte: 'Dévisse à la main le mousseur (le petit embout au bout du robinet). S\'il résiste, entoure-le d\'un chiffon et tourne doucement avec une pince.', schema: 'mousseur-devisser' }, // TEMPORAIRE (Tâche 3), la Tâche 6 réécrit ce tuto
      'Pour une douche, dévisse le pommeau du flexible, à la main.',
      { texte: 'Fais tremper le mousseur ou le pommeau au moins 30 minutes dans du vinaigre blanc.', schema: 'mousseur-tremper' }, // TEMPORAIRE (Tâche 3), la Tâche 6 réécrit ce tuto
      'Frotte avec une vieille brosse à dents, rince, et vérifie le petit joint : change-le s\'il est abîmé.',
      'Revisse à la main et ouvre l\'eau : le jet doit être plus fort et régulier.',
    ],
  },
  {
    id: 'nettoyer-bonde',
    titre: 'Nettoyer une bonde de douche',
    categorie: 'plomberie',
    icone: 'shower-head',
    duree: '10 min',
    outil: 'crochet',
    etapes: [
      'Mets des gants. Retire la grille de la bonde : elle se soulève ou se dévisse à la main.',
      'Retire les cheveux et les saletés avec un crochet (ou un fil de fer plié) et jette-les à la poubelle, pas dans les WC.',
      'Si la bonde a un petit panier ou un cylindre au milieu, sors-le et nettoie-le sous l\'eau avec une vieille brosse à dents.',
      'Remets les pièces et la grille, puis fais couler de l\'eau chaude : elle doit partir vite.',
      'Si l\'eau stagne encore, ne verse pas de produit déboucheur : appelle un plombier.',
    ],
  },
  {
    id: 'remplir-siphon',
    titre: 'Remplir un siphon',
    categorie: 'plomberie',
    icone: 'wind',
    duree: '2 min',
    outil: 'aucun',
    encadre: { ton: 'info', texte: 'Tu sens une odeur de gaz ?', renvoi: { type: 'urgence', id: 'couper-gaz' } }, // TEMPORAIRE (Tâche 5)
    etapes: [
      'Repère l\'évacuation qui sent : douche d\'amis, lavabo peu utilisé, siphon de sol.',
      {
        texte: 'Fais couler l\'eau une bonne minute : elle remplit le coude du siphon.',
        schema: 'siphon',
      },
      'L\'odeur doit partir en quelques minutes. Recommence chaque mois si tu n\'utilises pas ce point d\'eau.',
      'Si l\'odeur revient le jour même, refais le diagnostic « Mauvaise odeur d\'égout » ou appelle un plombier.',
    ],
  },
  {
    id: 'entretenir-groupe-securite',
    titre: 'Entretenir le groupe de sécurité',
    categorie: 'plomberie',
    icone: 'cylinder',
    duree: '2 min',
    outil: 'aucun',
    etapes: [
      'Repère le groupe de sécurité : la pièce sous le chauffe-eau, sur l\'arrivée d\'eau froide, avec une petite manette et un tuyau qui part vers l\'évacuation.',
      'Tourne ou soulève la petite manette quelques secondes : de l\'eau, parfois très chaude, part dans l\'évacuation. Ne mets pas la main dessous.',
      'Relâche la manette : l\'écoulement doit s\'arrêter. Fais-le une fois par mois.',
      'Si l\'eau continue de couler après avoir relâché la manette, ou si rien ne sort du tout, appelle un plombier. Ne bouche jamais l\'écoulement.',
    ],
  },
  {
    id: 'changer-flexible-douche',
    titre: 'Changer un flexible de douche',
    categorie: 'plomberie',
    icone: 'bath',
    duree: '10 min',
    outil: 'aucun',
    etapes: [
      'Ferme le robinet de la douche et mets le bouchon pour ne pas perdre les petits joints.',
      { texte: 'Dévisse le flexible à la main : en bas sous le robinet, puis en haut au pommeau.', schema: 'flexible-devisser' }, // TEMPORAIRE (Tâche 3), la Tâche 6 réécrit ce tuto
      'Achète un flexible de la même longueur. Les raccords sont presque toujours de taille standard ; emporte l\'ancien au magasin si tu as un doute.',
      'Vérifie qu\'il y a un joint dans chaque écrou (souvent fourni avec le flexible), puis visse à la main, sans outil.',
      'Ouvre l\'eau doucement : si ça goutte à un raccord, resserre un peu à la main ou change son joint.',
    ],
  },
  {
    id: 'changer-ampoule',
    titre: 'Changer une ampoule',
    categorie: 'electricite',
    icone: 'lightbulb',
    duree: '5 min',
    outil: 'escabeau bas',
    etapes: [
      'Si le plafond est trop haut pour un escabeau bas, ou si le lustre est lourd ou doit être démonté, n\'y va pas : appelle un électricien.',
      { texte: 'Éteins l\'interrupteur, puis coupe le disjoncteur de la pièce dans le tableau électrique (pas seulement l\'interrupteur).', schema: 'ampoule-devisser' }, // TEMPORAIRE (Tâche 3), la Tâche 6 réécrit ce tuto
      'Attends quelques minutes que l\'ampoule refroidisse : elle peut brûler les doigts.',
      'Monte sur un escabeau stable, bien ouvert, jamais sur une chaise ni un tabouret. Si possible, demande à quelqu\'un de le tenir.',
      'Dévisse l\'ampoule (ou tourne-la d\'un quart de tour puis tire, pour les ampoules à petites pattes). Si elle est cassée dans la douille, arrête-toi : appelle un électricien.',
      'Mets une ampoule neuve du même modèle (même culot, même puissance), sans forcer. Si tu as un variateur, prends une ampoule LED « compatible variateur ».',
      'Descends de l\'escabeau, remonte le disjoncteur et allume. Si ça ne marche toujours pas, fais le diagnostic « Interrupteur ou lumière qui ne marche plus ».',
    ],
  },
];
