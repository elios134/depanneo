import { router } from 'expo-router';
import { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { EnTete } from '@/ui/EnTete';
import { FondEcran } from '@/ui/FondEcran';
import { useLogement } from './LogementProvider';
import { EMPLACEMENTS } from './lib/logement';

/** Liste des 4 emplacements à retrouver vite en cas d'urgence. */
export function EcranLogement() {
  const { couleurs } = useTheme();
  const { logement } = useLogement();
  const [photosKo, setPhotosKo] = useState<string[]>([]);
  return (
    <FondEcran>
      <EnTete titre="Mon logement" sousTitre="Où couper en cas d'urgence" action="retour" />
      {EMPLACEMENTS.map((e) => {
        const info = logement[e.id];
        return (
          <Pressable
            key={e.id}
            testID={`emplacement-${e.id}`}
            accessibilityRole="button"
            onPress={() => router.push({ pathname: '/urgences/logement/[emplacement]', params: { emplacement: e.id } })}
            style={[styles.ligne, { backgroundColor: couleurs.carte, borderColor: couleurs.bordure }]}
          >
            <View style={[styles.vignette, { borderColor: couleurs.bordure }]}>
              {info?.photo && !photosKo.includes(e.id) ? (
                <Image
                  source={{ uri: info.photo }}
                  style={styles.image}
                  accessibilityLabel={`Photo : ${e.titre}`}
                  onError={() => setPhotosKo((l) => [...l, e.id])}
                />
              ) : (
                <Text style={[styles.plus, { color: couleurs.accent }]}>{info?.photo ? 'Photo indisponible' : '+ photo'}</Text>
              )}
            </View>
            <View style={styles.textes}>
              <Text style={[styles.titre, { color: couleurs.texte }]}>{e.titre}</Text>
              <Text style={[styles.note, { color: couleurs.texteDiscret }]} numberOfLines={2}>
                {info?.note?.trim() ? info.note : 'À ajouter'}
              </Text>
            </View>
          </Pressable>
        );
      })}
      <Text style={[styles.vieprivee, { color: couleurs.texteDiscret }]}>
        Photos et notes restent uniquement sur ton téléphone.
      </Text>
    </FondEcran>
  );
}

const styles = StyleSheet.create({
  ligne: { flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderRadius: 14, padding: 10 },
  vignette: { width: 76, height: 56, borderRadius: 10, borderWidth: 1, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  image: { width: '100%', height: '100%' },
  plus: { fontSize: 12, fontWeight: '600' },
  textes: { flex: 1, gap: 2 },
  titre: { fontSize: 15, fontWeight: '600' },
  note: { fontSize: 12.5 },
  vieprivee: { fontSize: 12.5, textAlign: 'center', marginTop: 4 },
});
