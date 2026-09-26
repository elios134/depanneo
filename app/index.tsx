import { StyleSheet, Text, View } from 'react-native';

export default function Accueil() {
  return (
    <View style={styles.container}>
      <Text style={styles.titre}>Dépann'Maison</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titre: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});
