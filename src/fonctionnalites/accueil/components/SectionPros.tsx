// src/fonctionnalites/accueil/components/SectionPros.tsx
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { Pro } from '@/domaine/pro';
import { RechercheVille } from '@/fonctionnalites/pros/components/RechercheVille';
import type { StatutPosition } from '@/fonctionnalites/pros/hooks/usePosition';
import { estEchec, type EtatPros } from '@/fonctionnalites/pros/hooks/usePros';
import { ageTexte } from '@/fonctionnalites/pros/lib/cachePros';
import { useReglages } from '@/fonctionnalites/reglages/ReglagesProvider';
import { useTheme } from '@/theme/ThemeProvider';
import { CartePro } from '@/ui/CartePro';

interface Props {
  statut: StatutPosition;
  pros: Pro[];
  etat: EtatPros;
  date: number | null;
  onUtiliserPosition: () => void;
  // Hors connexion ou fond de carte non chargé.
  peutReessayer: boolean;
  onReessayer: () => void;
}

function Lien({ texte, onPress }: { texte: string; onPress: () => void }) {
  const { couleurs } = useTheme();
  return (
    <Pressable onPress={onPress} accessibilityRole="button" hitSlop={6}>
      <Text style={[styles.lien, { color: couleurs.accent }]}>{texte}</Text>
    </Pressable>
  );
}

export function SectionPros({ statut, pros, etat, date, onUtiliserPosition, peutReessayer, onReessayer }: Props) {
  const { couleurs } = useTheme();
  const { reglages, modifier } = useReglages();
  const titre = (texte: string, avecToutVoir: boolean) => (
    <View style={styles.entete}>
      <Text style={[styles.titre, { color: couleurs.texteDiscret }]}>{texte}</Text>
      {avecToutVoir ? <Lien texte="Tout voir" onPress={() => router.navigate('/pros')} /> : null}
    </View>
  );

  if (statut === 'chargement') return null;

  if (statut === 'aucune') {
    return (
      <View style={styles.bloc}>
        {titre('Trouver des pros', false)}
        <RechercheVille onChoisir={(lieu) => modifier({ villeParDefaut: lieu })} />
        <Lien texte="Utiliser ma position" onPress={onUtiliserPosition} />
      </View>
    );
  }

  if (etat === 'attente' || etat === 'chargement') {
    return (
      <View style={styles.bloc}>
        {titre('Pros près de toi', false)}
        <Text style={[styles.message, { color: couleurs.texteDiscret }]}>Recherche des pros autour de toi…</Text>
      </View>
    );
  }

  if (pros.length === 0) {
    const horsLigne = estEchec(etat);
    return (
      <View style={styles.bloc}>
        {titre('Pros près de toi', false)}
        <Text style={[styles.vide, { color: couleurs.texte }]}>
          {horsLigne ? 'Pas de liste enregistrée' : `Aucun pro trouvé dans un rayon de ${reglages.rayonKm} km`}
        </Text>
        <Text style={[styles.message, { color: couleurs.texteDiscret }]}>
          {etat === 'indisponible'
            ? 'Le service des pros ne répond pas. Réessaie dans quelques minutes.'
            : horsLigne
            ? 'Reconnecte-toi pour trouver les pros autour de toi.'
            : "Les données viennent d'OpenStreetMap et peuvent être incomplètes."}
        </Text>
        {horsLigne || peutReessayer ? <Lien texte="Réessayer" onPress={onReessayer} /> : null}
        {!horsLigne && reglages.rayonKm < 20 ? <Lien texte="Élargir à 20 km" onPress={() => modifier({ rayonKm: 20 })} /> : null}
      </View>
    );
  }

  return (
    <View style={styles.bloc}>
      {titre('Pros près de toi', true)}
      {pros.slice(0, 2).map((pro) => (
        <CartePro key={pro.id} pro={pro} />
      ))}
      {estEchec(etat) && date !== null ? (
        <Text style={[styles.message, { color: couleurs.texteDiscret }]}>Liste enregistrée {ageTexte(date, Date.now())}</Text>
      ) : null}
      {peutReessayer ? <Lien texte="Réessayer" onPress={onReessayer} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  bloc: { gap: 8 },
  entete: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 2 },
  titre: { fontSize: 11.5, textTransform: 'uppercase', letterSpacing: 0.6 },
  lien: { fontSize: 13, textAlign: 'center' },
  vide: { fontSize: 14, fontWeight: '700', textAlign: 'center' },
  message: { fontSize: 12, textAlign: 'center' },
});
