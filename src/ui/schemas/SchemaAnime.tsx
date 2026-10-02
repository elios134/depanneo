// src/ui/schemas/SchemaAnime.tsx — cadre du schéma sous une étape de tuto.
import { StyleSheet, View } from 'react-native';
import type { NomSchema } from '@/domaine/etapes';
import { teinte } from '@/theme/teinte';
import { useTheme } from '@/theme/ThemeProvider';
import { DESSINS } from './dessins';
import { SchemaDessine } from './SchemaDessine';
import { SchemaDisjoncteur } from './SchemaDisjoncteur';
import { SchemaSiphon } from './SchemaSiphon';
import { useMouvementReduit } from './useMouvementReduit';

const DESCRIPTIONS_COMPOSANTS = {
  siphon: 'Schéma : l\'eau remplit le coude du siphon et bloque les odeurs.',
  disjoncteur: 'Schéma : le levier du disjoncteur remonte de 0 (coupé) à I (marche).',
} as const;

function description(nom: NomSchema): string {
  return nom === 'siphon' || nom === 'disjoncteur' ? DESCRIPTIONS_COMPOSANTS[nom] : DESSINS[nom].description;
}

export function SchemaAnime({ nom }: { nom: NomSchema }) {
  const { couleurs } = useTheme();
  const immobile = useMouvementReduit();
  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel={description(nom)}
      style={[styles.cadre, { backgroundColor: teinte(couleurs.fond, 0.5), borderColor: couleurs.bordure }]}
    >
      {nom === 'siphon' ? (
        <SchemaSiphon immobile={immobile} />
      ) : nom === 'disjoncteur' ? (
        <SchemaDisjoncteur immobile={immobile} />
      ) : (
        <SchemaDessine dessin={DESSINS[nom]} immobile={immobile} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  cadre: { borderWidth: 1, borderRadius: 10, padding: 6 },
});
