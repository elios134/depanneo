// src/fonctionnalites/pros/EcranPros.tsx
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { EnTete } from '@/ui/EnTete';
import { FondEcran } from '@/ui/FondEcran';
import { Pastille } from '@/ui/Pastille';

export function EcranPros() {
  const { couleurs } = useTheme();
  return (
    <FondEcran>
      <EnTete titre="Pros près de toi" />
      <View style={[styles.bloc, { backgroundColor: couleurs.carte, borderColor: couleurs.bordure }]}>
        <Pastille icone="map-pin" couleur={couleurs.accent} taille={52} />
        <Text style={[styles.titre, { color: couleurs.texte }]}>Bientôt disponible</Text>
        <Text style={[styles.texte, { color: couleurs.texteDiscret }]}>
          La carte des plombiers et électriciens proches de chez toi arrive dans la prochaine version.
        </Text>
      </View>
    </FondEcran>
  );
}

const styles = StyleSheet.create({
  bloc: { borderWidth: 1, borderRadius: 18, padding: 24, gap: 10, alignItems: 'center' },
  titre: { fontSize: 17, fontWeight: '700' },
  texte: { fontSize: 14, lineHeight: 20, textAlign: 'center' },
});
