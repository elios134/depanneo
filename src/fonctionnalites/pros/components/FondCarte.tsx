import { StyleSheet, View, type DimensionValue, type StyleProp, type ViewStyle } from 'react-native';
import { teinte } from '@/theme/teinte';
import { useTheme } from '@/theme/ThemeProvider';

type Forme = { left: DimensionValue; top: DimensionValue; width: DimensionValue; height: DimensionValue };

const GRANDES_ROUTES: Forme[] = [
  { left: 0, top: '42%', width: '100%', height: 10 },
  { left: '42%', top: 0, width: 10, height: '100%' },
];
const ROUTES: Forme[] = [
  { left: 0, top: '14%', width: '100%', height: 6 },
  { left: '72%', top: 0, width: 6, height: '100%' },
  { left: '13%', top: 0, width: 6, height: '100%' },
  { left: 0, top: '66%', width: '100%', height: 6 },
];
const BLOCS: Forme[] = [
  { left: '18%', top: '17%', width: '20%', height: '8%' },
  { left: '76%', top: '17%', width: '17%', height: '10%' },
  { left: '18%', top: '46%', width: '20%', height: '9%' },
  { left: '48%', top: '70%', width: '20%', height: '8%' },
];

export function FondCarte({ neutre = false, avecPoint = true }: { neutre?: boolean; avecPoint?: boolean }) {
  const { couleurs } = useTheme();
  const rect = (formes: Forme[], couleur: string, rayon = 0) =>
    formes.map((f, i) => <View key={i} style={[styles.abs, f, { backgroundColor: couleur, borderRadius: rayon }]} />);
  const racine: StyleProp<ViewStyle> = [StyleSheet.absoluteFill, { backgroundColor: couleurs.carteSol, overflow: 'hidden', pointerEvents: 'none' }];
  if (neutre) {
    return (
      <View style={racine}>
        {rect(ROUTES, couleurs.carteBloc)}
        {rect(GRANDES_ROUTES, couleurs.carteBloc)}
      </View>
    );
  }
  return (
    <View style={racine}>
      <View style={[styles.abs, styles.riviere, { backgroundColor: couleurs.carteEau }]} />
      {rect(ROUTES, couleurs.carteRoute)}
      {rect(GRANDES_ROUTES, couleurs.carteRouteGrande)}
      {rect(BLOCS, couleurs.carteBloc, 4)}
      <View style={[styles.abs, styles.parc, { backgroundColor: couleurs.carteParc }]} />
      {avecPoint ? (
        <>
          <View style={[styles.abs, styles.halo, { backgroundColor: teinte(couleurs.accent, 0.12) }]} />
          <View style={[styles.abs, styles.haloProche, { backgroundColor: teinte(couleurs.accent, 0.25) }]} />
          <View style={[styles.abs, styles.point, { backgroundColor: couleurs.accent, borderColor: couleurs.surAccent }]} />
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  abs: { position: 'absolute' },
  riviere: { left: '-10%', top: '26%', width: '120%', height: 26, transform: [{ rotate: '-12deg' }] },
  parc: { left: '48%', top: '32%', width: '20%', height: '8%', borderRadius: 10 },
  halo: { left: '42%', top: '42%', width: 60, height: 60, borderRadius: 30, marginLeft: -25, marginTop: -25 },
  haloProche: { left: '42%', top: '42%', width: 36, height: 36, borderRadius: 18, marginLeft: -13, marginTop: -13 },
  point: { left: '42%', top: '42%', width: 16, height: 16, borderRadius: 8, borderWidth: 3, marginLeft: -3, marginTop: -3 },
});
