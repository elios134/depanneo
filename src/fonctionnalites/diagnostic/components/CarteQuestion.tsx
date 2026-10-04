import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { Etape } from '@/domaine/types';
import { useTheme } from '@/theme/ThemeProvider';

export function CarteQuestion({ etape, onRepondre }: { etape: Etape; onRepondre: (indice: number, suite: string) => void }) {
  const { couleurs } = useTheme();
  return (
    <View style={styles.bloc}>
      <Text style={[styles.question, { color: couleurs.texte }]}>{etape.question}</Text>
      {etape.reponses.map((reponse, indice) => (
        <Pressable
          key={reponse.texte}
          accessibilityRole="button"
          onPress={() => onRepondre(indice, reponse.suite)}
          style={[
            styles.reponse,
            { backgroundColor: couleurs.carte, borderColor: couleurs.bordure },
            reponse.inconnu && styles.pointille,
          ]}
        >
          <Text style={[styles.texte, { color: reponse.inconnu ? couleurs.texteDiscret : couleurs.texte }]}>
            {reponse.texte}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  bloc: { gap: 10 },
  question: { fontSize: 22, fontWeight: '700', lineHeight: 29, marginBottom: 6 },
  reponse: { borderWidth: 1, borderRadius: 14, paddingVertical: 15, paddingHorizontal: 14 },
  pointille: { borderStyle: 'dashed' },
  texte: { fontSize: 15, fontWeight: '600' },
});
