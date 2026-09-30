// src/ui/Pastille.tsx
import { View } from 'react-native';
import type { NomIcone } from '@/domaine/icones';
import { teinte } from '@/theme/teinte';
import { Icone } from './Icone';

export function Pastille({ icone, couleur, taille = 34 }: { icone: NomIcone; couleur: string; taille?: number }) {
  return (
    <View
      style={{
        width: taille,
        height: taille,
        borderRadius: taille / 2,
        backgroundColor: teinte(couleur, 0.13),
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Icone nom={icone} couleur={couleur} taille={Math.round(taille * 0.5)} />
    </View>
  );
}
