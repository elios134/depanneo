// src/fonctionnalites/reglages/EcranAPropos.tsx
import Constants from 'expo-constants';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { EnTete } from '@/ui/EnTete';
import { FondEcran } from '@/ui/FondEcran';

const SECTIONS = [
  {
    titre: 'Avertissement',
    texte:
      "Dépannéo donne des conseils, mais ne remplace pas un professionnel. En cas de doute ou de danger, appelle un pro. Pour une odeur de gaz, sors du logement et appelle le 0800 47 33 33.",
  },
  {
    titre: 'Crédits',
    texte: 'Carte : OpenFreeMap © OpenMapTiles. Données © les contributeurs OpenStreetMap. Icônes : Lucide.',
  },
];

export function EcranAPropos() {
  const { couleurs } = useTheme();
  return (
    <FondEcran>
      <EnTete titre="À propos" action="retour" />
      {SECTIONS.map((s) => (
        <View key={s.titre} style={[styles.bloc, { backgroundColor: couleurs.carte, borderColor: couleurs.bordure }]}>
          <Text style={[styles.titre, { color: couleurs.texte }]}>{s.titre}</Text>
          <Text style={[styles.texte, { color: couleurs.texteDiscret }]}>{s.texte}</Text>
        </View>
      ))}
      <Text style={[styles.version, { color: couleurs.texteDiscret }]}>
        Version {Constants.expoConfig?.version ?? '?'}
      </Text>
    </FondEcran>
  );
}

const styles = StyleSheet.create({
  bloc: { borderWidth: 1, borderRadius: 14, padding: 14, gap: 6 },
  titre: { fontSize: 15, fontWeight: '700' },
  texte: { fontSize: 14, lineHeight: 20 },
  version: { fontSize: 12, textAlign: 'center', marginTop: 8 },
});
