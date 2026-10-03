import type { Tuto } from '@/domaine/types';

export const tutos: Tuto[] = [
  {
    id: 'deboucher-evier',
    titre: 'Déboucher un évier',
    categorie: 'plomberie',
    icone: 'waves',
    duree: '20 min',
    outil: 'seau, gants',
    etapes: [
      { texte: 'Mets un seau sous le siphon, puis dévisse la base du siphon.', schema: 'evier-devisser-siphon' },
      'Vérifie que tu n\'as pas perdu le joint.',
      {
        texte: 'Nettoie l\'intérieur avec un couteau, une cuillère ou une baguette. La plupart du temps, ça suffit.',
        schema: 'evier-nettoyer',
      },
      'Fais couler un peu d\'eau, puis revisse la base à la main.',
      'Fais couler de l\'eau très chaude. Si l\'eau s\'évacue normalement, c\'est réglé.',
    ],
    planB: {
      sousTitre: 'si le démontage n\'a pas suffi',
      etapes: [
        {
          texte: 'Ventouse : bouche le trop-plein (le petit trou en haut de l\'évier) avec une éponge, mets un peu d\'eau dans l\'évier, puis donne des à-coups. Avec une ventouse pro, alterne tirer et pousser.',
          schema: 'evier-ventouse',
        },
        {
          texte: 'Furet : si la ventouse ne marche pas, remets le seau, démonte tout le siphon et range les joints de côté.',
          schema: 'evier-demonter-siphon',
        },
        {
          texte: 'Enfonce le furet d\'environ 5 cm, bloque-le, puis tourne dans le sens des aiguilles d\'une montre. Recommence 5 cm par 5 cm jusqu\'à ce que le bouchon parte.',
          schema: 'evier-furet',
        },
        'Si c\'est toujours bouché, appelle un plombier.',
      ],
    },
  },
  {
    id: 'deboucher-wc',
    titre: 'Déboucher des WC',
    categorie: 'plomberie',
    icone: 'toilet',
    duree: '15 min',
    outil: 'gants, ventouse',
    encadre: {
      ton: 'alerte',
      titre: 'L\'eau remonte sans que tu tires la chasse ?',
      texte: 'N\'essaie rien et appelle tout de suite un plombier : c\'est sûrement le tuyau principal de l\'immeuble qui est bouché à ton niveau, et l\'eau des voisins remonte chez toi.',
    },
    etapes: [
      {
        texte: 'Tire un peu la chasse : si l\'eau s\'écoule lentement, c\'est un bouchon dans la cuvette.',
        schema: 'wc-ecoulement-lent',
      },
      { texte: 'Place la ventouse au fond de la cuvette et donne des à-coups.', schema: 'wc-ventouse' },
      'Tire la chasse. Si l\'eau part normalement, c\'est réglé.',
    ],
    planB: {
      sousTitre: 'l\'acide chlorhydrique (déboucheur WC)',
      etapes: [
        'Mets des gants et des lunettes, ouvre la fenêtre et éloigne les enfants. Ne le mélange jamais avec de l\'eau de Javel ou un autre produit.',
        {
          texte: 'Verse tout le flacon dans la cuvette et laisse agir quelques minutes, sans utiliser la ventouse.',
          schema: 'wc-acide',
        },
        'Tire la chasse. Si c\'est toujours bouché, appelle un plombier.',
      ],
    },
  },
  {
    id: 'changer-joint',
    titre: 'Changer un joint ou resserrer un raccord',
    categorie: 'plomberie',
    icone: 'wrench',
    duree: '15 min',
    outil: 'clé ou pince, kit de joints fibre',
    etapes: [
      { texte: 'Coupe l\'eau avant de toucher au raccord.', schema: 'couper-eau' },
      { texte: 'Resserre doucement le raccord qui fuit.', schema: 'raccord-resserrer' },
      'Remets l\'eau en douceur. Ne force pas trop sur le raccord, tu pourrais abîmer la tuyauterie.',
    ],
    planB: {
      sousTitre: 'changer le joint',
      etapes: [
        'Avant de commencer, achète un kit de joints fibre en magasin de bricolage.',
        { texte: 'Coupe l\'eau, puis dévisse complètement le raccord.', schema: 'raccord-devisser' },
        {
          texte: 'Enlève le joint abîmé et compare-le aux joints du kit pour trouver le même.',
          schema: 'joint-comparer',
        },
        { texte: 'Mets le nouveau joint, puis revisse fermement, sans forcer comme une brute.', schema: 'joint-remonter' },
        'Remets l\'eau en douceur. Si ça fuit toujours, coupe l\'eau et appelle un plombier.',
      ],
    },
  },
  {
    id: 'detartrer-flotteur',
    titre: 'Détartrer le robinet flotteur',
    categorie: 'plomberie',
    icone: 'hourglass',
    duree: '15 min',
    outil: 'pince multiprise (ou autre pince), chiffon',
    encadre: {
      ton: 'info',
      texte: 'Quand tu tires la chasse, tu entends un sifflement et le réservoir met longtemps à se remplir ? C\'est souvent le robinet flotteur qui est entartré.',
    },
    etapes: [
      'Coupe l\'eau au robinet des WC. S\'il est dur, ne force pas : coupe l\'eau générale.',
      'Ouvre le couvercle du réservoir et repère les raccords du robinet flotteur.',
      { texte: 'Dévisse sans forcer avec ta pince et sors le robinet flotteur.', schema: 'flotteur-sortir' },
      {
        texte: 'Nettoie-le avec un chiffon et de l\'eau claire. Fais attention à ne perdre aucun joint.',
        schema: 'flotteur-nettoyer',
      },
      {
        texte: 'Revisse, puis remets l\'eau. Vérifie que le remplissage s\'arrête bien avant de refermer le couvercle.',
        schema: 'reservoir-remplissage',
      },
      'Si le remplissage est normal, c\'est réparé.',
    ],
    planB: {
      sousTitre: 'la membrane est cassée',
      etapes: [
        'Si le problème continue, c\'est souvent la membrane du robinet flotteur qui est cassée. Il existe beaucoup de modèles : redémonte-le et apporte-le en magasin de bricolage pour qu\'un vendeur t\'aide à trouver la bonne membrane.',
        'Autre solution : remplace tout le robinet flotteur par un neuf. Si tu n\'es pas à l\'aise pour rebrancher l\'arrivée d\'eau, appelle un plombier.',
      ],
    },
  },
  {
    id: 'changer-mecanisme-chasse',
    titre: 'Changer le mécanisme de chasse',
    categorie: 'plomberie',
    icone: 'rotate-cw',
    duree: '1 h',
    outil: 'pince, serviette, joint ou kit de mécanisme',
    etapes: [
      {
        texte: 'Ferme le robinet d\'arrivée d\'eau des WC, puis tire la chasse pour vider le réservoir.',
        schema: 'reservoir-vidange',
      },
      'Soulève le couvercle du réservoir et pose-le à plat sur une serviette.',
      {
        texte: 'Sors le mécanisme de chasse (la colonne au milieu) : sur beaucoup de modèles, un quart de tour puis tu le soulèves.',
        schema: 'mecanisme-quart-tour',
      },
      'Retire le joint en caoutchouc sous le mécanisme et emporte-le en magasin de bricolage pour acheter le même. Nettoie le fond du réservoir, mets le joint neuf, remets le mécanisme et rouvre l\'eau.',
      'Si l\'eau ne coule plus dans la cuvette, c\'est réparé.',
    ],
    planB: {
      sousTitre: 'le mécanisme ne sort pas, ou ça coule toujours',
      etapes: [
        {
          texte: 'Ferme l\'eau, vide le réservoir, puis dévisse le tuyau qui relie le robinet d\'arrêt au robinet flotteur.',
          schema: 'tuyau-alimentation',
        },
        { texte: 'Sous le réservoir, dévisse les deux papillons, un de chaque côté.', schema: 'papillons' },
        {
          texte: 'Soulève délicatement le réservoir et retire-le de la cuvette : il est lourd et fragile.',
          schema: 'reservoir-retirer',
        },
        {
          texte: 'Dévisse les deux écrous qui tiennent les tiges filetées (là où étaient les papillons), puis dévisse le mécanisme de chasse.',
          schema: 'mecanisme-ecrou',
        },
        'Monte le nouveau mécanisme et le nouveau robinet flotteur en suivant la notice fournie.',
        'Change aussi le joint entre le réservoir et la cuvette (souvent fourni dans le kit), puis repose le réservoir. Revisse les papillons à la main, de façon égale des deux côtés, sans forcer : la céramique peut casser. Revisse le tuyau sur le robinet flotteur.',
        'Remets l\'eau et vérifie qu\'il n\'y a aucune fuite, sous le réservoir comme au niveau du tuyau. Si ça fuit encore, coupe l\'eau et appelle un plombier.',
      ],
    },
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
      {
        texte: 'Dévisse à la main le mousseur (le petit embout au bout du robinet). S\'il résiste, entoure-le d\'un chiffon et tourne doucement avec une pince.',
        schema: 'mousseur-devisser',
      },
      'Pour une douche, dévisse le pommeau du flexible, à la main.',
      {
        texte: 'Fais tremper le mousseur ou le pommeau au moins 30 minutes dans du vinaigre blanc.',
        schema: 'mousseur-tremper',
      },
      'Frotte avec une vieille brosse à dents, rince, et vérifie le petit joint : change-le s\'il est abîmé.',
      'Revisse à la main et ouvre l\'eau : le jet doit être plus fort et régulier.',
    ],
  },
  {
    id: 'remplir-siphon',
    titre: 'Odeur d\'égout dans la maison',
    categorie: 'plomberie',
    icone: 'wind',
    duree: '5 min',
    outil: 'aucun',
    encadre: {
      ton: 'alerte',
      titre: 'Ça sent le gaz ?',
      texte: 'Une odeur d\'œuf pourri très forte n\'est pas un problème de siphon : suis tout de suite les consignes gaz.',
      renvoi: { type: 'urgence', id: 'couper-gaz' },
    },
    etapes: [
      'Repère d\'où vient l\'odeur : salle de bain, évier ou WC.',
      {
        texte: 'Si elle vient d\'une douche, d\'un lavabo ou d\'un évier, le siphon n\'a sûrement plus assez d\'eau. Fais couler l\'eau une bonne minute.',
        schema: 'siphon',
      },
      'Attends quelques minutes : si l\'odeur disparaît, c\'était ça. Fais couler l\'eau de temps en temps dans les points d\'eau peu utilisés.',
      'Si l\'odeur vient des WC, le tuyau d\'évacuation fuit sûrement, au niveau d\'un joint ou du tuyau lui-même. Appelle un plombier pour la réparation.',
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
      {
        texte: 'Dévisse le flexible à la main : en bas sous le robinet, puis en haut au pommeau.',
        schema: 'flexible-devisser',
      },
      'Achète un flexible de la même longueur. Les raccords sont presque toujours de taille standard ; emporte l\'ancien au magasin si tu as un doute.',
      'Vérifie qu\'il y a un joint dans chaque écrou (souvent fourni avec le flexible), puis visse à la main, sans outil.',
      'Ouvre l\'eau doucement : si ça goutte à un raccord, resserre un peu à la main ou change son joint.',
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
    id: 'changer-ampoule',
    titre: 'Changer une ampoule',
    categorie: 'electricite',
    icone: 'lightbulb',
    duree: '5 min',
    outil: 'escabeau bas',
    etapes: [
      'Si le plafond est trop haut pour un escabeau bas, ou si le lustre est lourd ou doit être démonté, n\'y va pas : appelle un électricien.',
      'Éteins l\'interrupteur, puis coupe le disjoncteur de la pièce dans le tableau électrique (pas seulement l\'interrupteur).',
      'Attends quelques minutes que l\'ampoule refroidisse : elle peut brûler les doigts.',
      'Monte sur un escabeau stable, bien ouvert, jamais sur une chaise ni un tabouret. Si possible, demande à quelqu\'un de le tenir.',
      {
        texte: 'Dévisse l\'ampoule (ou tourne-la d\'un quart de tour puis tire, pour les ampoules à petites pattes). Si elle est cassée dans la douille, arrête-toi : appelle un électricien.',
        schema: 'ampoule-devisser',
      },
      'Mets une ampoule neuve du même modèle (même culot, même puissance), sans forcer. Si tu as un variateur, prends une ampoule LED « compatible variateur ».',
      'Descends de l\'escabeau, remonte le disjoncteur et allume. Si ça ne marche toujours pas, fais le diagnostic « Interrupteur ou lumière qui ne marche plus ».',
    ],
  },
];
