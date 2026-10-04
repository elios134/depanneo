import { useMemo, useState } from 'react';
import { Alert, Image, Pressable, Share as ShareNatif, StyleSheet, Text, View } from 'react-native';
import Share from 'react-native-share';
import { estResultat, getResultat } from '@/domaine/diagnosticEngine';
import { diagnostics } from '@/donnees/diagnostics';
import { useTheme } from '@/theme/ThemeProvider';
import { BoutonPrincipal } from '@/ui/BoutonPrincipal';
import { EnTete } from '@/ui/EnTete';
import { FondEcran } from '@/ui/FondEcran';
import { Icone } from '@/ui/Icone';
import { usePhotoPanne } from './hooks/usePhotoPanne';
import { messagePlombier } from './lib/message';
import { etapeCourante, rejouer, reponsesChoisies } from './lib/parcours';

/** Écran « Envoyer à un pro » : aperçu du message, photo facultative, puis la feuille de partage du téléphone. */
export function EcranEnvoyer({ id, choix }: { id: string; choix?: string }) {
  const { couleurs } = useTheme();
  const photo = usePhotoPanne();
  const [erreurPartage, setErreurPartage] = useState<string | null>(null);

  const inconnu = !diagnostics.some((d) => d.id === id);
  const message = useMemo(() => {
    const diagnostic = diagnostics.find((d) => d.id === id);
    if (!diagnostic) return null;
    const etat = rejouer(diagnostic, choix);
    const courant = etapeCourante(etat);
    if (!estResultat(diagnostic, courant)) return null;
    return messagePlombier(diagnostic, reponsesChoisies(diagnostic, etat), getResultat(diagnostic, courant));
  }, [id, choix]);

  if (message === null) {
    return (
      <FondEcran>
        <EnTete titre="Envoyer à un pro" action="retour" />
        <Text style={{ color: couleurs.texte }}>{inconnu ? 'Diagnostic introuvable.' : "Ce diagnostic n'est pas terminé : reviens au résultat pour l'envoyer."}</Text>
      </FondEcran>
    );
  }

  const ajouterPhoto = () =>
    Alert.alert('Photo de la panne', undefined, [
      { text: "Prendre avec l'appareil photo", onPress: photo.prendre },
      { text: 'Choisir dans la galerie', onPress: photo.choisir },
      { text: 'Annuler', style: 'cancel' },
    ]);

  const partager = async () => {
    setErreurPartage(null);
    try {
      if (photo.uri) await Share.open({ message, url: photo.uri, type: photo.mimeType ?? 'image/jpeg', failOnCancel: false });
      else await ShareNatif.share({ message });
    } catch {
      setErreurPartage("Le partage n'a pas pu s'ouvrir. Réessaie dans un instant.");
    }
  };

  return (
    <FondEcran>
      <EnTete titre="Envoyer à un pro" action="retour" />
      {photo.uri ? (
        <View style={styles.vignette}>
          <Image testID="photo-panne" source={{ uri: photo.uri }} style={styles.image} />
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
      <Pressable onPress={ajouterPhoto} accessibilityRole="button" testID="ajouter-photo-panne">
        <Text style={[styles.lien, { color: couleurs.accent }]}>
          {photo.uri ? 'Changer la photo' : '+ Ajouter une photo de la panne'}
        </Text>
      </Pressable>
      {photo.erreur ? <Text style={[styles.erreur, { color: couleurs.dangerTexte }]}>{photo.erreur}</Text> : null}
      <View testID="apercu-message" style={[styles.message, { backgroundColor: couleurs.carte, borderColor: couleurs.bordure }]}>
        <Text style={[styles.texteMessage, { color: couleurs.texte }]}>{message}</Text>
      </View>
      <BoutonPrincipal testID="bouton-partager" libelle="Partager…" icone="share" onPress={partager} />
      {erreurPartage ? <Text style={[styles.erreur, { color: couleurs.dangerTexte }]}>{erreurPartage}</Text> : null}
      <Text style={[styles.note, { color: couleurs.texteDiscret }]}>
        Ouvre SMS, WhatsApp, e-mail… Rien ne passe par un serveur.
      </Text>
    </FondEcran>
  );
}

const styles = StyleSheet.create({
  vignette: { alignSelf: 'flex-start' },
  image: { width: 160, height: 120, borderRadius: 14 },
  retirer: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lien: { fontSize: 14, fontWeight: '600' },
  erreur: { fontSize: 13, lineHeight: 19 },
  message: { borderWidth: 1, borderRadius: 14, padding: 14 },
  texteMessage: { fontSize: 14.5, lineHeight: 22 },
  note: { fontSize: 12.5, textAlign: 'center' },
});
