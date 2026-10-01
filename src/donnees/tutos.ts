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
      'Mets des gants. N\'utilise jamais la ventouse après avoir versé un produit déboucheur : il pourrait t\'éclabousser.',
      'Retire l\'eau stagnante avec un récipient si l\'évier est plein.',
      'Utilise une ventouse en appuyant fermement plusieurs fois sur l\'orifice d\'évacuation.',
      'Si ça ne suffit pas, utilise un furet en le poussant doucement dans la canalisation.',
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
      'Mets des gants et enfonce une ventouse adaptée dans la cuvette.',
      'Effectue des mouvements de va-et-vient fermes pendant une minute.',
      'Si ça ne suffit pas, utilise un furet spécial WC en le poussant doucement.',
    ],
  },
  {
    id: 'changer-joint',
    titre: 'Changer un joint ou resserrer un raccord',
    categorie: 'plomberie',
    icone: 'wrench',
    duree: '15 min',
    outil: 'clé',
    etapes: [
      'Coupe l\'eau avant de commencer (voir le geste "Couper l\'eau").',
      'Dévisse le raccord qui fuit avec une clé adaptée.',
      'Remplace le joint usé par un joint neuf de même taille, puis resserre sans forcer excessivement.',
      'Rouvre l\'eau doucement et vérifie qu\'il n\'y a plus de fuite.',
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
];
