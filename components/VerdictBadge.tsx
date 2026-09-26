import { StyleSheet, Text, View } from 'react-native';
import type { Verdict } from '../lib/types';

const CONFIG: Record<Verdict, { emoji: string; libelle: string; couleur: string }> = {
  vert: { emoji: '🟢', libelle: 'Tu peux réparer', couleur: '#2e7d32' },
  orange: { emoji: '🟠', libelle: 'Sécurise en attendant', couleur: '#ef6c00' },
  rouge: { emoji: '🔴', libelle: 'Appelle un pro tout de suite', couleur: '#c62828' },
};

export function VerdictBadge({ verdict }: { verdict: Verdict }) {
  const config = CONFIG[verdict];
  return (
    <View style={[styles.container, { borderColor: config.couleur }]}>
      <Text style={styles.emoji}>{config.emoji}</Text>
      <Text style={[styles.libelle, { color: config.couleur }]}>{config.libelle}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderRadius: 8,
    padding: 12,
    gap: 8,
  },
  emoji: {
    fontSize: 24,
  },
  libelle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});
