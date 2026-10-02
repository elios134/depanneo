// src/ui/EtapesList.tsx
import { StyleSheet, Text, View } from 'react-native';
import { schemaEtape, texteEtape, type EtapeTuto } from '@/domaine/etapes';
import { teinte } from '@/theme/teinte';
import { useTheme } from '@/theme/ThemeProvider';
import { SchemaAnime } from './schemas/SchemaAnime';

export function EtapesList({ etapes, premierNumero = 1 }: { etapes: readonly EtapeTuto[]; premierNumero?: number }) {
  const { couleurs } = useTheme();
  return (
    <View style={styles.liste}>
      {etapes.map((etape, index) => {
        const schema = schemaEtape(etape);
        return (
          <View key={index} style={[styles.ligne, { backgroundColor: couleurs.carte, borderColor: couleurs.bordure }]}>
            <View style={[styles.numero, { backgroundColor: teinte(couleurs.accent, 0.18) }]}>
              <Text style={[styles.numeroTexte, { color: couleurs.accent }]}>{premierNumero + index}</Text>
            </View>
            <View style={styles.corps}>
              <Text style={[styles.texte, { color: couleurs.texte }]}>{texteEtape(etape)}</Text>
              {schema ? <SchemaAnime nom={schema} /> : null}
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  liste: { gap: 10 },
  ligne: { flexDirection: 'row', gap: 12, borderWidth: 1, borderRadius: 14, padding: 12 },
  numero: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  numeroTexte: { fontWeight: '700', fontSize: 14 },
  corps: { flex: 1, gap: 10 },
  texte: { fontSize: 15, lineHeight: 21 },
});
