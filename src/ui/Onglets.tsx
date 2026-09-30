// src/ui/Onglets.tsx
import { Pressable, StyleSheet, Text } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { Verre } from './Verre';

interface Props<T extends string | number> {
  options: { valeur: T; libelle: string }[];
  valeur: T;
  onChange: (valeur: T) => void;
}

export function Onglets<T extends string | number>({ options, valeur, onChange }: Props<T>) {
  const { couleurs } = useTheme();
  return (
    <Verre style={styles.barre}>
      {options.map((option) => {
        const actif = option.valeur === valeur;
        return (
          <Pressable
            key={String(option.valeur)}
            onPress={() => onChange(option.valeur)}
            accessibilityRole="tab"
            accessibilityState={{ selected: actif }}
            style={[styles.onglet, actif && { backgroundColor: couleurs.accent }]}
          >
            <Text style={[styles.libelle, { color: actif ? couleurs.surAccent : couleurs.texteDiscret }]}>
              {option.libelle}
            </Text>
          </Pressable>
        );
      })}
    </Verre>
  );
}

const styles = StyleSheet.create({
  barre: { flexDirection: 'row', gap: 4, padding: 4, borderRadius: 14 },
  onglet: { flex: 1, alignItems: 'center', paddingVertical: 9, borderRadius: 10 },
  libelle: { fontSize: 13, fontWeight: '600' },
});
