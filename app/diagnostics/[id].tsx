import { Link, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { NumeroUrgence } from '@/ui/NumeroUrgence';
import { VerdictBadge } from '@/ui/VerdictBadge';
import { diagnostics } from '@/donnees/diagnostics';
import { estResultat, getEtape, getResultat } from '@/domaine/diagnosticEngine';

export default function EcranDiagnostic() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const diagnostic = diagnostics.find((d) => d.id === id);
  const [etapeActuelle, setEtapeActuelle] = useState(diagnostic?.etapeInitiale ?? '');

  if (!diagnostic) {
    return (
      <View style={styles.container}>
        <Text>Diagnostic introuvable.</Text>
      </View>
    );
  }

  if (estResultat(diagnostic, etapeActuelle)) {
    const resultat = getResultat(diagnostic, etapeActuelle);
    return (
      <ScrollView contentContainerStyle={styles.container}>
        <VerdictBadge verdict={resultat.verdict} />
        <Text style={styles.titreResultat}>{resultat.titre}</Text>
        <Text style={styles.conseil}>{resultat.conseil}</Text>

        {resultat.numeroUtile ? <NumeroUrgence numero={resultat.numeroUtile} /> : null}

        {resultat.gesteUrgenceId ? (
          <Link href={`/urgences/${resultat.gesteUrgenceId}`} asChild>
            <Pressable style={styles.boutonSecondaire}>
              <Text style={styles.boutonSecondaireTexte}>Voir le geste d'urgence</Text>
            </Pressable>
          </Link>
        ) : null}

        {resultat.tutoId ? (
          <Link href={`/tutos/${resultat.tutoId}`} asChild>
            <Pressable style={styles.boutonPrincipal}>
              <Text style={styles.boutonPrincipalTexte}>Voir le mini-tuto</Text>
            </Pressable>
          </Link>
        ) : null}
      </ScrollView>
    );
  }

  const etape = getEtape(diagnostic, etapeActuelle);
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.question}>{etape.question}</Text>
      <View style={styles.reponses}>
        {etape.reponses.map((reponse) => (
          <TouchableOpacity
            key={reponse.texte}
            style={styles.boutonReponse}
            onPress={() => setEtapeActuelle(reponse.suite)}
          >
            <Text style={styles.boutonReponseTexte}>{reponse.texte}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    gap: 16,
  },
  question: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  reponses: {
    gap: 10,
  },
  boutonReponse: {
    backgroundColor: '#eeeeee',
    borderRadius: 8,
    padding: 14,
  },
  boutonReponseTexte: {
    fontSize: 16,
  },
  titreResultat: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  conseil: {
    fontSize: 16,
  },
  numero: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  boutonPrincipal: {
    backgroundColor: '#1565c0',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  boutonPrincipalTexte: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  boutonSecondaire: {
    backgroundColor: '#eeeeee',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  boutonSecondaireTexte: {
    fontSize: 16,
  },
});
