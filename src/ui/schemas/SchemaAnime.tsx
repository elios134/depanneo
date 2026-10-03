// src/ui/schemas/SchemaAnime.tsx — cadre du schéma sous une étape de tuto.
import { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import type { NomSchema } from '@/domaine/etapes';
import { teinte } from '@/theme/teinte';
import { useTheme } from '@/theme/ThemeProvider';
import { DESSINS } from './dessins';
import { SchemaDessine } from './SchemaDessine';
import { SchemaDisjoncteur } from './SchemaDisjoncteur';
import { SchemaSiphon } from './SchemaSiphon';
import { useMouvementReduit } from './useMouvementReduit';
import { estVisible } from './visibilite';
import { useZoneVisible } from './ZoneVisible';

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
  const zone = useZoneVisible();
  const { height: hauteurEcran } = useWindowDimensions();
  const cadre = useRef<View>(null);
  // Tant que la position n'est pas mesurée, le schéma compte comme visible (rien ne reste figé au premier affichage).
  const [visibleMesure, setVisibleMesure] = useState(true);
  const mesurer = useCallback(() => {
    cadre.current?.measureInWindow((_x, y, _l, hauteur) => {
      if (!hauteur) return;
      setVisibleMesure(estVisible(y, y + hauteur, 0, hauteurEcran));
    });
  }, [hauteurEcran]);
  // Recalcul à chaque changement de la zone visible (le défilement, limité à ~10 fois par seconde).
  useEffect(() => {
    if (zone) mesurer();
  }, [zone, mesurer]);
  const visible = zone === null || visibleMesure;
  return (
    <View
      ref={cadre}
      onLayout={mesurer}
      accessible
      accessibilityRole="image"
      accessibilityLabel={description(nom)}
      style={[styles.cadre, { backgroundColor: teinte(couleurs.fond, 0.5), borderColor: couleurs.bordure }]}
    >
      {nom === 'siphon' ? (
        <SchemaSiphon immobile={immobile} visible={visible} />
      ) : nom === 'disjoncteur' ? (
        <SchemaDisjoncteur immobile={immobile} visible={visible} />
      ) : (
        <SchemaDessine dessin={DESSINS[nom]} immobile={immobile} visible={visible} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  cadre: { borderWidth: 1, borderRadius: 10, padding: 6 },
});
