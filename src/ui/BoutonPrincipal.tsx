// src/ui/BoutonPrincipal.tsx
import { Pressable, StyleSheet, Text } from 'react-native';
import type { NomIcone } from '@/domaine/icones';
import { useTheme } from '@/theme/ThemeProvider';
import { Icone } from './Icone';

interface Props {
  libelle: string;
  icone?: NomIcone;
  onPress: () => void;
  variante?: 'accent' | 'danger' | 'discret';
}

export function BoutonPrincipal({ libelle, icone, onPress, variante = 'accent' }: Props) {
  const { couleurs } = useTheme();
  const plein = variante !== 'discret';
  const fond = variante === 'accent' ? couleurs.accent : variante === 'danger' ? couleurs.danger : couleurs.carte;
  const texte = plein ? couleurs.surAccent : couleurs.texte;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={[
        styles.bouton,
        { backgroundColor: fond, borderColor: plein ? fond : couleurs.bordure, shadowColor: fond },
        plein && styles.ombre,
      ]}
    >
      {icone ? <Icone nom={icone} couleur={texte} taille={18} /> : null}
      <Text style={[styles.libelle, { color: texte }]}>{libelle}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  bouton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 16,
    borderWidth: 1,
    paddingVertical: 15,
    paddingHorizontal: 16,
  },
  ombre: { shadowOpacity: 0.35, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, elevation: 6 },
  libelle: { fontSize: 16, fontWeight: '700' },
});
