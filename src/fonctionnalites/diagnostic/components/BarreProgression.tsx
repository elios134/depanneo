import { StyleSheet, View } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';

export function BarreProgression({ valeur }: { valeur: number }) {
  const { couleurs } = useTheme();
  return (
    <View style={[styles.fond, { backgroundColor: couleurs.bordure }]}>
      <View style={[styles.plein, { width: `${Math.round(valeur * 100)}%`, backgroundColor: couleurs.accent }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  fond: { height: 6, borderRadius: 3, overflow: 'hidden' },
  plein: { height: '100%', borderRadius: 3 },
});
