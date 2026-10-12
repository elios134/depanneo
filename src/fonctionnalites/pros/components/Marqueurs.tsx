import { StyleSheet, View } from 'react-native';
import type { Metier } from '@/domaine/pro';
import { teinte } from '@/theme/teinte';
import { useTheme } from '@/theme/ThemeProvider';
import { Icone } from '@/ui/Icone';

export function PointPosition() {
  const { couleurs } = useTheme();
  return (
    <View style={[styles.halo, { backgroundColor: teinte(couleurs.accent, 0.25) }]}>
      <View style={[styles.point, { backgroundColor: couleurs.accent, borderColor: couleurs.surAccent }]} />
    </View>
  );
}

export function EpinglePro({ metier }: { metier: Metier }) {
  const { couleurs } = useTheme();
  const couleur = metier === 'plombier' ? couleurs.plomberie : couleurs.electricite;
  return (
    <View style={[styles.epingle, { backgroundColor: couleur, shadowColor: couleurs.ombre }]}>
      <View style={styles.redresse}>
        <Icone nom={metier === 'plombier' ? 'wrench' : 'zap'} couleur={couleurs.fond} taille={13} />
      </View>
    </View>
  );
}

/** Pro sans téléphone (registre) : petit point gris, plus discret que l'épingle. */
export function PointPro() {
  const { couleurs } = useTheme();
  return <View style={[styles.pointPro, { backgroundColor: couleurs.texteDiscret, borderColor: couleurs.fond }]} />;
}

const styles = StyleSheet.create({
  pointPro: { width: 12, height: 12, borderRadius: 6, borderWidth: 2 },
  halo: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  point: { width: 16, height: 16, borderRadius: 8, borderWidth: 3 },
  epingle: {
    width: 26,
    height: 26,
    borderTopLeftRadius: 13,
    borderTopRightRadius: 13,
    borderBottomRightRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ rotate: '-45deg' }],
    shadowOpacity: 0.5,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  redresse: { transform: [{ rotate: '45deg' }] },
});
