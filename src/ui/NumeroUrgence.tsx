import { Linking, Pressable, StyleSheet, Text } from 'react-native';

export function NumeroUrgence({ numero }: { numero: string }) {
  return (
    <Pressable
      style={styles.bouton}
      accessibilityRole="button"
      accessibilityLabel={`Appeler le ${numero}`}
      onPress={() => Linking.openURL('tel:' + numero.replace(/\s/g, ''))}
    >
      <Text style={styles.texte}>📞 Appeler le {numero}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  bouton: {
    backgroundColor: '#c62828',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  texte: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 17,
  },
});
