import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Image, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { BoutonPrincipal } from '@/ui/BoutonPrincipal';
import { EnTete } from '@/ui/EnTete';
import { FondEcran } from '@/ui/FondEcran';
import { Icone } from '@/ui/Icone';
import { usePhoto } from '@/ui/usePhoto';
import { useLogement } from './LogementProvider';
import { EMPLACEMENTS, estEmplacement, NOTE_MAX } from './lib/logement';

/** Attend le chargement du logement avant d'afficher le formulaire, pour ne jamais écraser des données existantes. */
export function EcranEmplacement({ emplacement }: { emplacement: string }) {
  const { couleurs } = useTheme();
  const { charge } = useLogement();
  if (!charge) {
    return (
      <FondEcran>
        <EnTete titre="Mon logement" action="retour" />
        <Text style={{ color: couleurs.texteDiscret }}>Chargement…</Text>
      </FondEcran>
    );
  }
  return <FormulaireEmplacement emplacement={emplacement} />;
}

/** Édition d'un emplacement : photo (appareil ou galerie) et une phrase. */
function FormulaireEmplacement({ emplacement }: { emplacement: string }) {
  const { couleurs } = useTheme();
  const { logement, enregistrer, supprimer } = useLogement();
  const existant = estEmplacement(emplacement) ? logement[emplacement] : undefined;
  const photo = usePhoto(existant?.photo ?? null);
  const [note, setNote] = useState(existant?.note ?? '');
  const [erreur, setErreur] = useState<string | null>(null);

  if (!estEmplacement(emplacement)) {
    return (
      <FondEcran>
        <EnTete titre="Mon logement" action="retour" />
        <Text style={{ color: couleurs.texte }}>Emplacement introuvable.</Text>
      </FondEcran>
    );
  }
  const titre = EMPLACEMENTS.find((e) => e.id === emplacement)?.titre ?? '';

  const ajouterPhoto = () =>
    Alert.alert('Photo', undefined, [
      { text: "Prendre avec l'appareil photo", onPress: photo.prendre },
      { text: 'Choisir dans la galerie', onPress: photo.choisir },
      { text: 'Annuler', style: 'cancel' },
    ]);

  const valider = async () => {
    setErreur(null);
    try {
      await enregistrer(emplacement, { photo: photo.uri ?? undefined, note }, photo.mimeType);
      router.back();
    } catch {
      setErreur("L'enregistrement n'a pas marché. Réessaie dans un instant.");
    }
  };

  const effacer = () =>
    Alert.alert("Supprimer l'emplacement ?", 'La photo et la note seront effacées de ton téléphone.', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: () => {
          supprimer(emplacement).then(
            () => router.back(),
            () => setErreur("La suppression n'a pas marché."),
          );
        },
      },
    ]);

  return (
    <FondEcran>
      <EnTete titre={titre} action="retour" />
      {photo.uri ? (
        <View>
          <Image testID="photo-emplacement" source={{ uri: photo.uri }} style={styles.photo} accessibilityLabel={`Photo : ${titre}`} />
          <Pressable
            onPress={photo.retirer}
            accessibilityRole="button"
            accessibilityLabel="Retirer la photo"
            hitSlop={8}
            style={[styles.retirer, { backgroundColor: couleurs.fond, borderColor: couleurs.bordure }]}
          >
            <Icone nom="x" couleur={couleurs.texte} taille={16} />
          </Pressable>
        </View>
      ) : null}
      <Pressable onPress={ajouterPhoto} accessibilityRole="button" testID="ajouter-photo-emplacement">
        <Text style={[styles.lien, { color: couleurs.accent }]}>{photo.uri ? 'Changer la photo' : '+ Ajouter une photo'}</Text>
      </Pressable>
      {photo.erreur ? <Text style={{ color: couleurs.dangerTexte }}>{photo.erreur}</Text> : null}
      <Text style={[styles.etiquette, { color: couleurs.texteDiscret }]}>Où c&apos;est, en une phrase</Text>
      <TextInput
        testID="champ-note"
        value={note}
        onChangeText={(t) => setNote(t.slice(0, NOTE_MAX))}
        maxLength={NOTE_MAX}
        placeholder="Ex : sous l'évier de la cuisine, à gauche"
        placeholderTextColor={couleurs.texteDiscret}
        style={[styles.champ, { color: couleurs.texte, backgroundColor: couleurs.carte, borderColor: couleurs.bordure }]}
      />
      <Text style={[styles.compteur, { color: couleurs.texteDiscret }]}>
        {note.length}/{NOTE_MAX}
      </Text>
      {erreur ? <Text style={{ color: couleurs.dangerTexte }}>{erreur}</Text> : null}
      <BoutonPrincipal testID="bouton-enregistrer" libelle="Enregistrer" onPress={valider} />
      {existant ? <BoutonPrincipal libelle="Supprimer l'emplacement" variante="discret" onPress={effacer} /> : null}
      <Text style={[styles.vieprivee, { color: couleurs.texteDiscret }]}>Photos et notes restent uniquement sur ton téléphone.</Text>
    </FondEcran>
  );
}

const styles = StyleSheet.create({
  photo: { width: '100%', height: 200, borderRadius: 14 },
  retirer: { position: 'absolute', top: 8, right: 8, width: 28, height: 28, borderRadius: 14, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  lien: { fontSize: 15, fontWeight: '600' },
  etiquette: { fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.6, marginTop: 6 },
  champ: { borderWidth: 1, borderRadius: 12, padding: 12, fontSize: 15 },
  compteur: { fontSize: 12, textAlign: 'right' },
  vieprivee: { fontSize: 12.5, textAlign: 'center' },
});
