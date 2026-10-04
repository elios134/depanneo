// src/fonctionnalites/diagnostic/components/BlocQuiPaie.tsx
import { StyleSheet, Text, View } from 'react-native';
import { titreQuiPaie } from '@/domaine/quiPaie';
import type { InfoQuiPaie } from '@/domaine/types';
import { useReglages } from '@/fonctionnalites/reglages/ReglagesProvider';
import { useTheme } from '@/theme/ThemeProvider';
import { Icone } from '@/ui/Icone';

/** Carte discrète « Qui paie ? » : titre adapté au statut de l'utilisateur, puis la phrase explicative. */
export function BlocQuiPaie({ info }: { info: InfoQuiPaie }) {
  const { couleurs } = useTheme();
  const { reglages } = useReglages();
  const { titre, ton } = titreQuiPaie(info.qui, reglages.statutLogement);
  const couleurTitre = ton === 'vert' ? couleurs.verdictVert : ton === 'orange' ? couleurs.verdictOrange : couleurs.texte;
  return (
    <View testID="bloc-qui-paie" style={[styles.bloc, { backgroundColor: couleurs.carte, borderColor: couleurs.bordure }]}>
      <View style={styles.ligne}>
        <Icone nom="euro" couleur={couleurs.verdictOrange} taille={16} />
        <Text style={[styles.titre, { color: couleurs.texte }]}>
          Qui paie ? <Text style={{ color: couleurTitre }}>{titre}</Text>
        </Text>
      </View>
      <Text style={[styles.phrase, { color: couleurs.texteDiscret }]}>{info.phrase}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  bloc: { borderWidth: 1, borderRadius: 12, padding: 12, gap: 4 },
  ligne: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  titre: { flex: 1, fontSize: 14, fontWeight: '700' },
  phrase: { fontSize: 13, lineHeight: 19 },
});
