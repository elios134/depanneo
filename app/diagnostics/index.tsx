import { Link } from 'expo-router';
import { FlatList, Pressable, StyleSheet, Text } from 'react-native';
import { diagnostics } from '../../data/diagnostics';

export default function ListeDiagnostics() {
  return (
    <FlatList
      contentContainerStyle={styles.container}
      data={diagnostics}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <Link href={`/diagnostics/${item.id}`} asChild>
          <Pressable style={styles.ligne}>
            <Text style={styles.icone}>{item.icone}</Text>
            <Text style={styles.titre}>{item.titre}</Text>
          </Pressable>
        </Link>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    gap: 10,
  },
  ligne: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#eeeeee',
    borderRadius: 8,
    padding: 14,
  },
  icone: {
    fontSize: 22,
  },
  titre: {
    fontSize: 16,
  },
});
