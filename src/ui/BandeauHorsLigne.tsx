// src/ui/BandeauHorsLigne.tsx
import { StyleSheet, Text } from 'react-native';
import { teinte } from '@/theme/teinte';
import { useTheme } from '@/theme/ThemeProvider';
import { Icone } from './Icone';
import { Verre } from './Verre';

export function BandeauHorsLigne() {
  const { couleurs } = useTheme();
  return (
    <Verre style={[styles.bandeau, { borderColor: teinte(couleurs.electricite, 0.45) }]}>
      <Icone nom="zap-off" couleur={couleurs.electricite} taille={14} />
      <Text style={[styles.texte, { color: couleurs.electricite }]}>Hors connexion</Text>
    </Verre>
  );
}

const styles = StyleSheet.create({
  bandeau: { flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 999, paddingVertical: 8, paddingHorizontal: 12 },
  texte: { fontSize: 12.5, fontWeight: '600' },
});
