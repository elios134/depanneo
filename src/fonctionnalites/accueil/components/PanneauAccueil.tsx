import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { BoutonPrincipal } from '@/ui/BoutonPrincipal';
import { Verre } from '@/ui/Verre';

export function PanneauAccueil() {
  const { couleurs } = useTheme();
  return (
    <Verre style={styles.panneau}>
      <View style={[styles.poignee, { backgroundColor: couleurs.bordure }]} />
      <BoutonPrincipal libelle="Diagnostiquer une panne" icone="stethoscope" onPress={() => router.push('/diagnostic')} />
      <Text style={[styles.avertissement, { color: couleurs.texteDiscret }]}>
        Conseils uniquement — ne remplace pas un professionnel.
      </Text>
    </Verre>
  );
}

const styles = StyleSheet.create({
  panneau: { borderRadius: 24, padding: 12, gap: 10 },
  poignee: { width: 38, height: 4, borderRadius: 2, alignSelf: 'center' },
  avertissement: { fontSize: 11.5, textAlign: 'center' },
});
