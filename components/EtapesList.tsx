import { StyleSheet, Text, View } from 'react-native';

export function EtapesList({ etapes }: { etapes: string[] }) {
  return (
    <View style={styles.container}>
      {etapes.map((etape, index) => (
        <View key={index} style={styles.ligne}>
          <Text style={styles.numero}>{index + 1}</Text>
          <Text style={styles.texte}>{etape}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  ligne: {
    flexDirection: 'row',
    gap: 12,
  },
  numero: {
    fontSize: 16,
    fontWeight: 'bold',
    width: 24,
  },
  texte: {
    fontSize: 16,
    flex: 1,
  },
});
