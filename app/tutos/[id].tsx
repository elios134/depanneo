import { useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { EtapesList } from '@/ui/EtapesList';
import { tutos } from '@/donnees/tutos';

export default function EcranTuto() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const tuto = tutos.find((t) => t.id === id);

  if (!tuto) {
    return (
      <View style={styles.container}>
        <Text>Tuto introuvable.</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.titre}>{tuto.titre}</Text>
      <EtapesList etapes={tuto.etapes} />
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
