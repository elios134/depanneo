// src/ui/VerdictBadge.tsx
import { StyleSheet, Text, View } from 'react-native';
import type { NomIcone } from '@/domaine/icones';
import type { Verdict } from '@/domaine/types';
import type { Couleurs } from '@/theme/tokens';
import { teinte } from '@/theme/teinte';
import { useTheme } from '@/theme/ThemeProvider';
import { Pastille } from './Pastille';

const CONFIG: Record<Verdict, { icone: NomIcone; libelle: string; detail: string; couleur: keyof Couleurs }> = {
  vert: { icone: 'wrench', libelle: 'Tu peux réparer', detail: 'Réparation simple, sans danger', couleur: 'verdictVert' },
  orange: {
    icone: 'shield-alert',
    libelle: 'Sécurise en attendant',
    detail: 'Mets en sécurité, puis appelle un pro',
    couleur: 'verdictOrange',
  },
  rouge: {
    icone: 'hard-hat',
    libelle: 'Appelle un pro tout de suite',
    detail: 'Ne répare pas toi-même',
    couleur: 'verdictRouge',
  },
};

export function VerdictBadge({ verdict }: { verdict: Verdict }) {
  const { couleurs } = useTheme();
  const config = CONFIG[verdict];
  const couleur = couleurs[config.couleur] as string;
  return (
    <View style={[styles.badge, { backgroundColor: teinte(couleur, 0.12), borderColor: teinte(couleur, 0.4) }]}>
      <Pastille icone={config.icone} couleur={couleur} taille={44} />
      <View style={styles.textes}>
        <Text style={[styles.libelle, { color: couleur }]}>{config.libelle}</Text>
        <Text style={[styles.detail, { color: couleurs.texteDiscret }]}>{config.detail}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderRadius: 18, padding: 14 },
  textes: { flex: 1, gap: 2 },
  libelle: { fontSize: 17, fontWeight: '700' },
  detail: { fontSize: 12.5 },
});
