import { StyleSheet, Text, View } from 'react-native';
import { texteRge, type LabelRge } from '@/domaine/pro';
import { teinte } from '@/theme/teinte';
import { useTheme } from '@/theme/ThemeProvider';
import { BadgeRge } from './BadgeRge';

/** Encadré de la fiche d'un pro RGE : label, qualification, organisme et date de validité. */
export function BlocRge({ rge }: { rge: LabelRge }) {
  const { couleurs } = useTheme();
  return (
    <View testID="bloc-rge" style={[styles.bloc, { backgroundColor: teinte(couleurs.verdictVert, 0.08), borderColor: teinte(couleurs.verdictVert, 0.3) }]}>
      <View style={styles.titre}>
        <BadgeRge />
        <Text style={[styles.texteTitre, { color: couleurs.texte }]}>Label reconnu par l’État</Text>
      </View>
      <Text style={[styles.detail, { color: couleurs.texteDiscret }]}>{texteRge(rge)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  bloc: { borderWidth: 1, borderRadius: 12, padding: 10, gap: 4, marginBottom: 6 },
  titre: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  texteTitre: { fontSize: 13.5, fontWeight: '700' },
  detail: { fontSize: 12.5, lineHeight: 17 },
});
