import { Image, StyleSheet, Text, View } from 'react-native';
import { teinte } from '@/theme/teinte';
import { useTheme } from '@/theme/ThemeProvider';
import { Icone } from '@/ui/Icone';
import type { InfoEmplacement } from '../lib/logement';

/** Bloc « Chez toi » : photo et phrase de l'utilisateur, affichés avant les étapes d'un geste d'urgence. */
export function ChezToi({ info, compact }: { info: InfoEmplacement; compact?: boolean }) {
  const { couleurs } = useTheme();
  return (
    <View
      testID="chez-toi"
      style={[styles.bloc, { backgroundColor: teinte(couleurs.accent, 0.1), borderColor: teinte(couleurs.accent, 0.4) }]}
    >
      <View style={styles.titre}>
        <Icone nom="house" couleur={couleurs.accent} taille={16} />
        <Text style={[styles.libelle, { color: couleurs.accent }]}>Chez toi</Text>
      </View>
      <View style={compact ? styles.ligne : undefined}>
        {info.photo ? (
          <Image
            source={{ uri: info.photo }}
            accessibilityLabel="Ta photo de l'emplacement"
            style={compact ? styles.mini : styles.photo}
          />
        ) : null}
        {info.note ? <Text style={[styles.note, compact && styles.noteMini, { color: couleurs.texte }]}>{info.note}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bloc: { borderWidth: 1, borderRadius: 14, padding: 12, gap: 8 },
  titre: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  libelle: { fontSize: 13, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  ligne: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  photo: { width: '100%', height: 170, borderRadius: 10 },
  mini: { width: 72, height: 54, borderRadius: 8 },
  note: { fontSize: 15, marginTop: 4 },
  noteMini: { flex: 1, marginTop: 0 },
});
