// src/fonctionnalites/bienvenue/QuestionStatut.tsx
import { useEffect } from 'react';
import { BackHandler, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { BoutonPrincipal } from '@/ui/BoutonPrincipal';
import { FondEcran } from '@/ui/FondEcran';
import { useReglages } from '../reglages/ReglagesProvider';

/** Question posée une seule fois au premier lancement : locataire ou propriétaire ? (sert au bloc « Qui paie ? »). */
export function QuestionStatut() {
  const { couleurs } = useTheme();
  const { reglages, modifier, charge } = useReglages();
  const visible = charge && reglages.statutLogement === null;

  // Pas de fermeture sans choix : le bouton retour d'Android ne fait rien tant que la question est affichée.
  useEffect(() => {
    if (!visible) return;
    const abonnement = BackHandler.addEventListener('hardwareBackPress', () => true);
    return () => abonnement.remove();
  }, [visible]);

  if (!visible) return null;
  return (
    <View
      style={StyleSheet.absoluteFill}
      testID="question-statut"
      accessibilityViewIsModal
      importantForAccessibility="yes"
    >
      <FondEcran defilant={false}>
        <View style={styles.centre}>
          <Text style={[styles.titre, { color: couleurs.texte }]}>Une dernière chose</Text>
          <Text style={[styles.texte, { color: couleurs.texte }]}>Tu es locataire ou propriétaire ?</Text>
          <Text style={[styles.detail, { color: couleurs.texteDiscret }]}>Ça sert à te dire qui paie la réparation.</Text>
          <BoutonPrincipal
            testID="statut-locataire"
            libelle="Je suis locataire"
            onPress={() => modifier({ statutLogement: 'locataire' })}
          />
          <BoutonPrincipal
            testID="statut-proprietaire"
            libelle="Je suis propriétaire"
            variante="discret"
            onPress={() => modifier({ statutLogement: 'proprietaire' })}
          />
          <Pressable
            testID="statut-non-precise"
            accessibilityRole="button"
            onPress={() => modifier({ statutLogement: 'non-precise' })}
            style={styles.lien}
          >
            <Text style={[styles.libelleLien, { color: couleurs.accent }]}>Je préfère ne pas dire</Text>
          </Pressable>
        </View>
      </FondEcran>
    </View>
  );
}

const styles = StyleSheet.create({
  centre: { flex: 1, justifyContent: 'center', gap: 10 },
  titre: { fontSize: 24, fontWeight: '800', textAlign: 'center' },
  texte: { fontSize: 16, textAlign: 'center', marginTop: 6 },
  detail: { fontSize: 13.5, textAlign: 'center', marginBottom: 10 },
  lien: { alignItems: 'center', paddingVertical: 12 },
  libelleLien: { fontSize: 14 },
});
