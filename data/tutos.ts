import type { Tuto } from '../lib/types';

export const tutos: Tuto[] = [
  {
    id: 'deboucher-evier',
    titre: 'Déboucher un évier',
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
    etapes: [
      'Mets des gants et enfonce une ventouse adaptée dans la cuvette.',
      'Effectue des mouvements de va-et-vient fermes pendant une minute.',
      'Si ça ne suffit pas, utilise un furet spécial WC en le poussant doucement.',
    ],
  },
  {
    id: 'changer-joint',
    titre: 'Changer un joint ou resserrer un raccord',
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
    etapes: [
      'Repère le disjoncteur en position basse dans le tableau électrique.',
      'Débranche ou éteins l\'appareil qui a pu causer la surcharge, si tu en identifies un.',
      'Remets le disjoncteur en position haute.',
      'Si le disjoncteur re-saute immédiatement, ne réessaie pas plusieurs fois : fais appel à un électricien.',
    ],
  },
];
