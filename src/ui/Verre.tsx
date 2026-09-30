// src/ui/Verre.tsx
import { BlurView } from 'expo-blur';
import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';

export function Verre({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  const { couleurs } = useTheme();
  return (
    <View style={[styles.base, { borderColor: couleurs.bordure, shadowColor: couleurs.ombre }, style]}>
      <BlurView intensity={40} tint={couleurs.flou} style={StyleSheet.absoluteFill} />
      <View style={[StyleSheet.absoluteFill, { backgroundColor: couleurs.verre }]} />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    overflow: 'hidden',
    borderWidth: 1,
    shadowOpacity: 0.35,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
});
