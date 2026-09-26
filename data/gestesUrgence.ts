import type { GesteUrgence } from '../lib/types';

export const gestesUrgence: GesteUrgence[] = [
  {
    id: 'couper-eau',
    titre: 'Couper l\'eau',
    etapes: [
      'Repère le robinet d\'arrêt général, près du compteur d\'eau : souvent dans un placard technique, sur le palier, à la cave ou dans un regard dehors.',
      'Robinet à tête ronde : tourne-le dans le sens des aiguilles d\'une montre jusqu\'à ce qu\'il bloque.',
      'Robinet à manette : fais un quart de tour pour mettre la manette en travers du tuyau.',
      'Vérifie qu\'un robinet ouvert dans la maison ne coule plus.',
    ],
  },
  {
    id: 'couper-courant',
    titre: 'Couper le courant',
    etapes: [
      'Si le tableau électrique est mouillé ou si tu as les pieds dans l\'eau, n\'y touche pas : sors de la pièce et appelle un pro.',
      'Avec les mains sèches, repère le disjoncteur général dans ton tableau électrique (souvent le plus gros interrupteur).',
      'Bascule-le en position basse ou « arrêt ».',
      'Vérifie qu\'aucune lumière ni appareil ne fonctionne plus dans le logement.',
    ],
  },
  {
    id: 'couper-gaz',
    titre: 'Couper le gaz',
    numeroUtile: '0800 47 33 33',
    etapes: [
      'Ne touche à aucun interrupteur, prise ou sonnette, et n\'allume aucune flamme.',
      'Si tu peux le faire sans risque, ouvre les fenêtres.',
      'Ferme le robinet de gaz, en général près du compteur ou juste avant la chaudière : la manette doit être en travers du tuyau.',
      'Sors du logement, puis appelle Urgence Sécurité Gaz au 0800 47 33 33 (gratuit, 24h/24) depuis l\'extérieur. En cas de malaise, appelle le 112.',
    ],
  },
];
