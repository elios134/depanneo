// src/ui/BoutonPrincipal.tsx
import { Pressable, StyleSheet, Text } from 'react-native';
import type { NomIcone } from '@/domaine/icones';
import { teinte } from '@/theme/teinte';
import { useTheme } from '@/theme/ThemeProvider';
import { Icone } from './Icone';

interface Props {
  libelle: string;
  icone?: NomIcone;
  onPress: () => void;
  variante?: 'accent' | 'danger' | 'discret' | 'teinte';
  accessibilityLabel?: string;
  testID?: string;
  disabled?: boolean;
}

export function BoutonPrincipal({ libelle, icone, onPress, variante = 'accent', accessibilityLabel, testID, disabled }: Props) {
  const { couleurs } = useTheme();
  const teinte_ = variante === 'teinte';
  const plein = variante === 'accent' || variante === 'danger';
  const fond = variante === 'accent' ? couleurs.accent : variante === 'danger' ? couleurs.danger : couleurs.carte;
  const texte = plein ? couleurs.surAccent : teinte_ ? couleurs.accent : couleurs.texte;
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={disabled ? { disabled: true } : undefined}
      style={[
        styles.bouton,
        disabled && styles.inactif,
        teinte_
          ? { backgroundColor: teinte(couleurs.accent, 0.14), borderColor: 'transparent' }
          : { backgroundColor: fond, borderColor: plein ? fond : couleurs.bordure, shadowColor: fond },
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
  inactif: { opacity: 0.5 },
  libelle: { fontSize: 16, fontWeight: '700' },
});
