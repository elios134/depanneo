// src/ui/schemas/SchemaDessine.tsx — dessine un schéma décrit en données (moteur dessin.ts, maquette 9).
import { useId } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, ClipPath, Defs, Ellipse, G, Marker, Path, Rect, Text as SvgText } from 'react-native-svg';
import type { Couleurs } from '@/theme/tokens';
import { useTheme } from '@/theme/ThemeProvider';
import { etatAnim, type Dessin, type Forme } from './dessin';
import { couleurTeinte, stylePeinture } from './peinture';
import { POLICE_SCHEMA } from './policeSchema';
import { useTempsBoucle } from './useTempsBoucle';

interface Contexte {
  couleurs: Couleurs;
  t: number;
  /** Préfixe unique des id SVG (pointe de flèche, découpes) : plusieurs schémas peuvent être à l'écran. */
  prefixe: string;
}

function contenu(forme: Forme, ctx: Contexte, chemin: string, tiret: number | undefined) {
  const { couleurs } = ctx;
  switch (forme.type) {
    case 'rect':
      return <Rect x={forme.x} y={forme.y} width={forme.l} height={forme.h} rx={forme.rx} {...stylePeinture(forme.peinture, couleurs)} strokeDashoffset={tiret} />;
    case 'chemin':
      return <Path d={forme.d} {...stylePeinture(forme.peinture, couleurs)} strokeDashoffset={tiret} />;
    case 'cercle':
      return <Circle cx={forme.cx} cy={forme.cy} r={forme.r} {...stylePeinture(forme.peinture, couleurs)} />;
    case 'ellipse':
      return <Ellipse cx={forme.cx} cy={forme.cy} rx={forme.rx} ry={forme.ry} {...stylePeinture(forme.peinture, couleurs)} />;
    case 'texte':
      return (
        <SvgText fontFamily={POLICE_SCHEMA} x={forme.x} y={forme.y} fontSize={9} fill={couleurTeinte(forme.teinte ?? 'trait', couleurs)}>
          {forme.texte}
        </SvgText>
      );
    case 'fleche':
      return (
        <Path d={forme.d} fill="none" stroke={couleurs.verdictVert} strokeWidth={2.5} strokeLinecap="round"
          strokeLinejoin="round" markerEnd={`url(#${ctx.prefixe}-pointe)`} />
      );
    case 'coche':
      return (
        <G>
          <Circle cx={forme.x} cy={forme.y} r={12} fill={couleurs.verdictVert} fillOpacity={0.13} />
          <Path d={`M${forme.x - 6} ${forme.y} l4 4 l8 -9`} fill="none" stroke={couleurs.verdictVert}
            strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
        </G>
      );
    case 'groupe': {
      const idDecoupe = `${ctx.prefixe}-d${chemin}`;
      return (
        <G clipPath={forme.decoupe ? `url(#${idDecoupe})` : undefined}>
          {forme.decoupe ? (
            <Defs>
              <ClipPath id={idDecoupe}>
                <Path d={forme.decoupe} />
              </ClipPath>
            </Defs>
          ) : null}
          {forme.formes.map((f, i) => (
            <FormeAnimee key={i} forme={f} ctx={ctx} chemin={`${chemin}-${i}`} />
          ))}
        </G>
      );
    }
  }
}

function FormeAnimee({ forme, ctx, chemin }: { forme: Forme; ctx: Contexte; chemin: string }) {
  const etat = etatAnim(forme.anim, ctx.t);
  if (etat.opacite <= 0.001) return null;
  return (
    <G transform={etat.transform} opacity={etat.opacite}>
      {contenu(forme, ctx, chemin, etat.tiret)}
    </G>
  );
}

export function SchemaDessine({ dessin, immobile }: { dessin: Dessin; immobile: boolean }) {
  const { couleurs } = useTheme();
  const tBoucle = useTempsBoucle(dessin.dureeMs, !immobile);
  // Les id SVG ne doivent pas contenir de « : » (anciennes versions de React) : on les retire.
  const prefixe = `s${useId().replace(/:/g, '')}`;
  const ctx: Contexte = { couleurs, t: immobile ? dessin.instantFige : tBoucle, prefixe };
  return (
    <View style={styles.zone}>
      <Svg width="100%" height="100%" viewBox="0 0 220 120">
        <Defs>
          <Marker id={`${prefixe}-pointe`} viewBox="0 0 10 10" refX={6} refY={5} markerWidth={5} markerHeight={5} orient="auto">
            <Path d="M0 0 L10 5 L0 10 Z" fill={couleurs.verdictVert} />
          </Marker>
        </Defs>
        {dessin.formes.map((f, i) => (
          <FormeAnimee key={i} forme={f} ctx={ctx} chemin={`${i}`} />
        ))}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  zone: { width: '100%', aspectRatio: 220 / 120, overflow: 'hidden' },
});
