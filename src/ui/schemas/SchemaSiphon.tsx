// src/ui/schemas/SchemaSiphon.tsx — l'eau remplit le coude du siphon et bloque les odeurs (maquette 8).
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, ClipPath, Defs, G, Path, Rect, Text as SvgText } from 'react-native-svg';
import { useTheme } from '@/theme/ThemeProvider';
import { DUREE_SIPHON_MS, imageSiphon } from './animation';
import { useTempsBoucle } from './useTempsBoucle';

const TUYAU = 'M70 10 V70 a30 30 0 0 0 60 0 V10 h-16 V70 a14 14 0 0 1 -28 0 V10 Z';

export function SchemaSiphon({ immobile }: { immobile: boolean }) {
  const { couleurs } = useTheme();
  const t = useTempsBoucle(DUREE_SIPHON_MS, !immobile);
  const image = imageSiphon(t, immobile);
  return (
    <View style={styles.zone}>
      <Svg width="100%" height="100%" viewBox="0 0 220 120">
        <Defs>
          <ClipPath id="interieur-siphon">
            <Path d={TUYAU} />
          </ClipPath>
        </Defs>
        <Path d={TUYAU} fill={couleurs.carte} stroke={couleurs.texteDiscret} strokeWidth={2} />
        <Path d="M130 26 H200 M130 42 H200" stroke={couleurs.texteDiscret} strokeWidth={2} />
        <G clipPath="url(#interieur-siphon)">
          <Rect x={60} y={40 + image.decalageEau} width={80} height={80} fill={couleurs.accent} opacity={0.75} />
        </G>
        {image.gouttes.map((goutte, i) => (
          <Circle key={i} cx={78} cy={goutte.decalage} r={3.5} fill={couleurs.accent} opacity={goutte.opacite} />
        ))}
        <SvgText x={150} y={100} fill={couleurs.texteDiscret} fontSize={10}>
          l’eau bloque
        </SvgText>
        <SvgText x={150} y={112} fill={couleurs.texteDiscret} fontSize={10}>
          les odeurs
        </SvgText>
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  zone: { width: '100%', aspectRatio: 220 / 120 },
});
