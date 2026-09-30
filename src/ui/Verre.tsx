// src/ui/Verre.tsx
import { BlurView } from 'expo-blur';
import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';

export function Verre({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  const { couleurs } = useTheme();
  return (
    <View style={[styles.base, { borderColor: couleurs.bordure, shadowColor: couleurs.ombre }, style]}>
      <BlurView intensity={40} tint={couleurs.flou} pointerEvents="none" style={[StyleSheet.absoluteFill, styles.calque]} />
      <View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.calque, { backgroundColor: couleurs.verre }]} />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  // Sur le web, les calques absolus se peignent sinon au-dessus des enfants.
  calque: { zIndex: -1 },
  base: {
    overflow: 'hidden',
    borderWidth: 1,
    shadowOpacity: 0.35,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
});
