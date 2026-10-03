// src/fonctionnalites/tutos/components/SeparateurPlanB.tsx — séparateur « Plan B » entre les étapes (maquette 9).
import { StyleSheet, Text, View } from 'react-native';
import { teinte } from '@/theme/teinte';
import { useTheme } from '@/theme/ThemeProvider';

export function SeparateurPlanB({ sousTitre }: { sousTitre: string }) {
  const { couleurs } = useTheme();
  return (
    <View style={styles.ligne} testID="separateur-plan-b">
      <Text style={[styles.pastille, { color: couleurs.verdictOrange, backgroundColor: teinte(couleurs.verdictOrange, 0.13) }]}>
        Plan B
      </Text>
      <Text style={[styles.sousTitre, { color: couleurs.texteDiscret }]}>{sousTitre}</Text>
      <View style={[styles.trait, { backgroundColor: couleurs.bordure }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  ligne: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 14, marginBottom: 10 },
  pastille: { fontSize: 12, fontWeight: '700', borderRadius: 999, paddingVertical: 3, paddingHorizontal: 10, overflow: 'hidden' },
  sousTitre: { fontSize: 12 },
  trait: { flex: 1, height: 1 },
});
