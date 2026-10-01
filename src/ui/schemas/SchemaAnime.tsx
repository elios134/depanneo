// src/ui/schemas/SchemaAnime.tsx — cadre du schéma sous une étape de tuto.
import { StyleSheet, View } from 'react-native';
import type { NomSchema } from '@/domaine/etapes';
import { teinte } from '@/theme/teinte';
import { useTheme } from '@/theme/ThemeProvider';
import { SchemaDisjoncteur } from './SchemaDisjoncteur';
import { SchemaSiphon } from './SchemaSiphon';
import { useMouvementReduit } from './useMouvementReduit';

const DESCRIPTIONS: Record<NomSchema, string> = {
  siphon: 'Schéma : l\'eau remplit le coude du siphon et bloque les odeurs.',
  disjoncteur: 'Schéma : le levier du disjoncteur remonte de 0 (coupé) à I (marche).',
};

export function SchemaAnime({ nom }: { nom: NomSchema }) {
  const { couleurs } = useTheme();
  const immobile = useMouvementReduit();
  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel={DESCRIPTIONS[nom]}
      style={[styles.cadre, { backgroundColor: teinte(couleurs.fond, 0.5), borderColor: couleurs.bordure }]}
    >
      {nom === 'siphon' ? <SchemaSiphon immobile={immobile} /> : <SchemaDisjoncteur immobile={immobile} />}
    </View>
  );
}

const styles = StyleSheet.create({
  cadre: { borderWidth: 1, borderRadius: 10, padding: 6 },
});
