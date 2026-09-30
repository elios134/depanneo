// src/ui/EtapesList.tsx
import { StyleSheet, Text, View } from 'react-native';
import { teinte } from '@/theme/teinte';
import { useTheme } from '@/theme/ThemeProvider';

export function EtapesList({ etapes }: { etapes: string[] }) {
  const { couleurs } = useTheme();
  return (
    <View style={styles.liste}>
      {etapes.map((etape, index) => (
        <View key={index} style={[styles.ligne, { backgroundColor: couleurs.carte, borderColor: couleurs.bordure }]}>
          <View style={[styles.numero, { backgroundColor: teinte(couleurs.accent, 0.18) }]}>
            <Text style={[styles.numeroTexte, { color: couleurs.accent }]}>{index + 1}</Text>
          </View>
          <Text style={[styles.texte, { color: couleurs.texte }]}>{etape}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  liste: { gap: 10 },
  ligne: { flexDirection: 'row', gap: 12, borderWidth: 1, borderRadius: 14, padding: 12 },
  numero: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  numeroTexte: { fontWeight: '700', fontSize: 14 },
  texte: { flex: 1, fontSize: 15, lineHeight: 21 },
});
