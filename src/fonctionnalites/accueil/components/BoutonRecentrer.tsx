// src/fonctionnalites/accueil/components/BoutonRecentrer.tsx
import { Pressable, StyleSheet } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { Icone } from '@/ui/Icone';
import { Verre } from '@/ui/Verre';

export function BoutonRecentrer({ onPress }: { onPress: () => void }) {
  const { couleurs } = useTheme();
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel="Recentrer la carte sur ma position" hitSlop={6}>
      <Verre style={styles.bouton}>
        <Icone nom="locate-fixed" couleur={couleurs.texte} taille={18} />
      </Verre>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  bouton: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
});
