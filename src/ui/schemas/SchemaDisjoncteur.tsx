// src/ui/schemas/SchemaDisjoncteur.tsx — le levier remonte de 0 à I, puis une coche (maquette 8).
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, G, Path, Rect, Text as SvgText } from 'react-native-svg';
import { useTheme } from '@/theme/ThemeProvider';
import { DUREE_DISJONCTEUR_MS, imageDisjoncteur } from './animation';
import { POLICE_SCHEMA } from './policeSchema';
import { useTempsBoucle } from './useTempsBoucle';

export function SchemaDisjoncteur({ immobile }: { immobile: boolean }) {
  const { couleurs } = useTheme();
  const t = useTempsBoucle(DUREE_DISJONCTEUR_MS, !immobile);
  const image = imageDisjoncteur(t, immobile);
  return (
    <View style={styles.zone}>
      <Svg width="100%" height="100%" viewBox="0 0 220 120">
        <Rect x={80} y={8} width={60} height={104} rx={8} fill={couleurs.carte} stroke={couleurs.texteDiscret} strokeWidth={2} />
        <Rect x={100} y={28} width={20} height={64} rx={4} fill={couleurs.bordure} />
        <Rect x={96} y={62 + image.decalageLevier} width={28} height={26} rx={5} fill={couleurs.accent} />
        <SvgText fontFamily={POLICE_SCHEMA} x={146} y={24} fill={couleurs.texteDiscret} fontSize={9}>
          I = marche
        </SvgText>
        <SvgText fontFamily={POLICE_SCHEMA} x={146} y={106} fill={couleurs.texteDiscret} fontSize={9}>
          0 = coupé
        </SvgText>
        <Path
          d="M40 86 V40 m-9 9 l9 -9 l9 9"
          fill="none"
          stroke={couleurs.verdictVert}
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={image.opaciteFleche}
        />
        <G opacity={image.opaciteCoche}>
          <Circle cx={175} cy={60} r={14} fill={couleurs.verdictVert} fillOpacity={0.13} />
          <Path
            d="M168 60 l5 5 l9 -10"
            fill="none"
            stroke={couleurs.verdictVert}
            strokeWidth={3}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </G>
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  zone: { width: '100%', aspectRatio: 220 / 120 },
});
