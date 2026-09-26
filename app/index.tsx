import { Link, type Href } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { gestesUrgence } from '../data/gestesUrgence';

export default function Accueil() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.titre}>Une panne à la maison ?</Text>

      <Link href={'/diagnostics' as Href} asChild>
        <Pressable style={styles.boutonPrincipal}>
          <Text style={styles.boutonPrincipalTexte}>Diagnostiquer une panne</Text>
        </Pressable>
      </Link>

      <Text style={styles.sousTitre}>Gestes d'urgence</Text>
      <View style={styles.gestes}>
        {gestesUrgence.map((geste) => (
          <Link key={geste.id} href={`/urgences/${geste.id}` as Href} asChild>
            <Pressable style={styles.boutonGeste}>
              <Text style={styles.boutonGesteTexte}>{geste.titre}</Text>
            </Pressable>
          </Link>
        ))}
      </View>

      <Text style={styles.avertissement}>
        Dépann'Maison donne des conseils, mais ne remplace pas un professionnel.
        En cas de doute ou de danger, appelle un pro.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    gap: 20,
  },
  titre: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  sousTitre: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 12,
  },
  boutonPrincipal: {
    backgroundColor: '#1565c0',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  boutonPrincipalTexte: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  gestes: {
    gap: 10,
  },
  boutonGeste: {
    backgroundColor: '#eeeeee',
    borderRadius: 8,
    padding: 14,
  },
  boutonGesteTexte: {
    fontSize: 16,
  },
  avertissement: {
    fontSize: 13,
    color: '#666666',
    marginTop: 24,
    textAlign: 'center',
  },
});
