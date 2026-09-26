import type { GesteUrgence } from '../lib/types';

export const gestesUrgence: GesteUrgence[] = [
  {
    id: 'couper-eau',
    titre: 'Couper l\'eau',
    etapes: [
      'Repère le robinet d\'arrêt général, souvent près du compteur d\'eau ou sous l\'évier de la cuisine.',
      'Tourne-le dans le sens des aiguilles d\'une montre jusqu\'à ce qu\'il soit bien fermé.',
      'Vérifie qu\'un robinet ouvert dans la maison ne coule plus.',
    ],
  },
  {
    id: 'couper-courant',
    titre: 'Couper le courant',
    etapes: [
      'Repère le disjoncteur général dans ton tableau électrique (souvent le plus gros interrupteur).',
      'Bascule-le en position basse ou "arrêt".',
      'Vérifie qu\'aucune lumière ni appareil ne fonctionne plus dans le logement.',
    ],
  },
  {
    id: 'couper-gaz',
    titre: 'Couper le gaz',
    etapes: [
      'Repère le robinet d\'arrêt du gaz, en général près du compteur ou juste avant la chaudière.',
      'Tourne-le à 90 degrés pour le mettre en position fermée.',
      'Ne rallume rien et n\'actionne aucun interrupteur électrique avant d\'avoir aéré et appelé un professionnel.',
    ],
  },
];
