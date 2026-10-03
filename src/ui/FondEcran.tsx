// src/ui/FondEcran.tsx
import { useState, type ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';
import { useTheme } from '@/theme/ThemeProvider';
import { ZoneVisibleContexte, type ZoneVisible } from './schemas/ZoneVisible';
import { useMargeBarre } from './useMargeBarre';

export function FondEcran({ children, defilant = true }: { children: ReactNode; defilant?: boolean }) {
  const { couleurs } = useTheme();
  const { top } = useSafeAreaInsets();
  const margeBarre = useMargeBarre();
  // Zone visible du défilement : les schémas animés s'en servent pour se mettre en pause hors de l'écran.
  const [zone, setZone] = useState<ZoneVisible | null>(null);
  const contenuStyle = { paddingTop: top + 12, paddingBottom: margeBarre, paddingHorizontal: 16, gap: 12 };
  return (
    <View style={[styles.racine, { backgroundColor: couleurs.fond }]}>
      <Svg style={StyleSheet.absoluteFill}>
        <Defs>
          <RadialGradient id="halo1" cx="15%" cy="60%" r="60%">
            <Stop offset="0" stopColor={couleurs.halo1} />
            <Stop offset="1" stopColor={couleurs.fond} stopOpacity="0" />
          </RadialGradient>
          <RadialGradient id="halo2" cx="85%" cy="10%" r="50%">
            <Stop offset="0" stopColor={couleurs.halo2} />
            <Stop offset="1" stopColor={couleurs.fond} stopOpacity="0" />
          </RadialGradient>
        </Defs>
        <Rect width="100%" height="100%" fill="url(#halo1)" />
        <Rect width="100%" height="100%" fill="url(#halo2)" />
      </Svg>
      {defilant ? (
        <ScrollView
          contentContainerStyle={contenuStyle}
          scrollEventThrottle={100}
          onScroll={(e) => {
            const { contentOffset, layoutMeasurement } = e.nativeEvent;
            setZone({ debut: contentOffset.y, fin: contentOffset.y + layoutMeasurement.height });
          }}
          onLayout={(e) => setZone((z) => ({ debut: z?.debut ?? 0, fin: (z?.debut ?? 0) + e.nativeEvent.layout.height }))}
        >
          <ZoneVisibleContexte.Provider value={zone}>{children}</ZoneVisibleContexte.Provider>
        </ScrollView>
      ) : (
        <View style={[styles.racine, contenuStyle]}>{children}</View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  racine: { flex: 1 },
});
