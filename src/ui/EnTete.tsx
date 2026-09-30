// src/ui/EnTete.tsx
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { Icone } from './Icone';
import { Verre } from './Verre';

interface Props {
  titre: string;
  sousTitre?: string;
  action?: 'retour' | 'fermer';
}

export function EnTete({ titre, sousTitre, action }: Props) {
  const { couleurs } = useTheme();
  return (
    <View style={styles.ligne}>
      {action ? (
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel={action === 'retour' ? 'Retour' : 'Fermer'}
        >
          <Verre style={styles.bouton}>
            <Icone nom={action === 'retour' ? 'chevron-left' : 'x'} couleur={couleurs.texte} taille={18} />
          </Verre>
        </Pressable>
      ) : null}
      <View style={styles.textes}>
        <Text style={[action ? styles.titrePetit : styles.titre, { color: couleurs.texte }]}>{titre}</Text>
        {sousTitre ? <Text style={[styles.sousTitre, { color: couleurs.texteDiscret }]}>{sousTitre}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  ligne: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 4 },
  bouton: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  textes: { flex: 1, gap: 2 },
  titre: { fontSize: 24, fontWeight: '800' },
  titrePetit: { fontSize: 17, fontWeight: '700' },
  sousTitre: { fontSize: 13 },
});
