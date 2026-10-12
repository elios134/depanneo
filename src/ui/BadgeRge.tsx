import { StyleSheet, Text } from 'react-native';
import { teinte } from '@/theme/teinte';
import { useTheme } from '@/theme/ThemeProvider';

/** Petit badge vert « RGE » (label reconnu par l'État). */
export function BadgeRge() {
  const { couleurs } = useTheme();
  return (
    <Text
      accessibilityLabel="Label RGE"
      style={[styles.badge, { color: couleurs.verdictVert, backgroundColor: teinte(couleurs.verdictVert, 0.14), borderColor: teinte(couleurs.verdictVert, 0.45) }]}
    >
      RGE
    </Text>
  );
}

const styles = StyleSheet.create({
  badge: { fontSize: 10, fontWeight: '800', borderWidth: 1, borderRadius: 5, paddingHorizontal: 4, overflow: 'hidden' },
});
