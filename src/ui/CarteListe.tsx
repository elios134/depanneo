// src/ui/CarteListe.tsx
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { NomIcone } from '@/domaine/icones';
import { teinte } from '@/theme/teinte';
import { useTheme } from '@/theme/ThemeProvider';
import { Icone } from './Icone';
import { Pastille } from './Pastille';

interface Props {
  icone: NomIcone;
  couleur: string;
  titre: string;
  sousTitre?: string;
  onPress?: () => void;
  droite?: ReactNode;
  danger?: boolean;
  grande?: boolean;
  couleurBordure?: string;
  testID?: string;
}

export function CarteListe({ icone, couleur, titre, sousTitre, onPress, droite, danger, grande, couleurBordure, testID }: Props) {
  const { couleurs } = useTheme();
  const fond = danger ? teinte(couleurs.danger, 0.12) : couleurs.carte;
  const bordure = danger
    ? teinte(couleurs.danger, 0.45)
    : couleurBordure
      ? teinte(couleurBordure, 0.4)
      : couleurs.bordure;
  const couleurTitre = danger ? couleurs.dangerTexte : couleurs.texte;
  return (
    <Pressable
      onPress={onPress}
      testID={testID}
      disabled={!onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      style={[styles.carte, grande && styles.grande, { backgroundColor: fond, borderColor: bordure }]}
    >
      <Pastille icone={icone} couleur={couleur} taille={grande ? 40 : 34} />
      <View style={styles.textes}>
        <Text style={[styles.titre, { color: couleurTitre }]}>{titre}</Text>
        {sousTitre ? <Text style={[styles.sousTitre, { color: couleurs.texteDiscret }]}>{sousTitre}</Text> : null}
      </View>
      {droite ?? (onPress ? <Icone nom="chevron-right" couleur={couleurs.texteDiscret} taille={18} /> : null)}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  carte: { flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderRadius: 14, padding: 12 },
  grande: { paddingVertical: 16 },
  textes: { flex: 1, gap: 2 },
  titre: { fontSize: 15, fontWeight: '600' },
  sousTitre: { fontSize: 12.5 },
});
