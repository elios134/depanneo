import { useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { EtapesList } from '@/ui/EtapesList';
import { NumeroUrgence } from '@/ui/NumeroUrgence';
import { gestesUrgence } from '@/donnees/gestesUrgence';

export default function EcranGesteUrgence() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const geste = gestesUrgence.find((g) => g.id === id);

  if (!geste) {
    return (
      <View style={styles.container}>
        <Text>Geste d'urgence introuvable.</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.titre}>{geste.titre}</Text>
      <EtapesList etapes={geste.etapes} />
      {geste.numeroUtile ? <NumeroUrgence numero={geste.numeroUtile} /> : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    gap: 20,
  },
  titre: {
    fontSize: 22,
    fontWeight: 'bold',
  },
});
