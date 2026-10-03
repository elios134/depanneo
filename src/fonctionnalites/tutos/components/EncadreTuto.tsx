// src/fonctionnalites/tutos/components/EncadreTuto.tsx — encadré en haut d'un tuto (maquette 9) : alerte rouge ou info bleue.
import { StyleSheet, Text, View } from 'react-native';
import type { EncadreTuto as DonneesEncadre } from '@/domaine/types';
import { teinte } from '@/theme/teinte';
import { useTheme } from '@/theme/ThemeProvider';
import { CarteRenvoi } from '@/ui/CarteRenvoi';
import { Icone } from '@/ui/Icone';

export function EncadreTuto({ encadre }: { encadre: DonneesEncadre }) {
  const { couleurs } = useTheme();
  const alerte = encadre.ton === 'alerte';
  const couleur = alerte ? couleurs.danger : couleurs.accent;
  return (
    <View style={styles.bloc}>
      <View testID="encadre-tuto" style={[styles.encadre, { backgroundColor: teinte(couleur, 0.1), borderColor: teinte(couleur, 0.4) }]}>
        <View style={[styles.pastille, { backgroundColor: teinte(couleur, 0.2) }]}>
          <Icone nom={alerte ? 'triangle-alert' : 'info'} couleur={couleur} taille={13} />
        </View>
        <Text style={[styles.texte, { color: couleurs.texte }]}>
          {encadre.titre ? <Text style={styles.titre}>{encadre.titre}{'\n'}</Text> : null}
          {encadre.texte}
        </Text>
      </View>
      {encadre.renvoi ? <CarteRenvoi renvoi={encadre.renvoi} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  bloc: { gap: 10 },
  encadre: { flexDirection: 'row', gap: 9, borderWidth: 1, borderRadius: 14, padding: 10 },
  pastille: { width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  titre: { fontWeight: '700' },
  texte: { flex: 1, fontSize: 13, lineHeight: 18 },
});
