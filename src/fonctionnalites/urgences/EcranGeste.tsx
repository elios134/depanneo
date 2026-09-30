// src/fonctionnalites/urgences/EcranGeste.tsx
import { StyleSheet, Text } from 'react-native';
import { gestesUrgence } from '@/donnees/gestesUrgence';
import { useTheme } from '@/theme/ThemeProvider';
import { EnTete } from '@/ui/EnTete';
import { EtapesList } from '@/ui/EtapesList';
import { FondEcran } from '@/ui/FondEcran';
import { NumeroUrgence } from '@/ui/NumeroUrgence';

export function EcranGeste({ id }: { id: string }) {
  const { couleurs } = useTheme();
  const geste = gestesUrgence.find((g) => g.id === id);
  if (!geste) {
    return (
      <FondEcran>
        <EnTete titre="Geste d'urgence" action="retour" />
        <Text style={[styles.texte, { color: couleurs.texte }]}>Geste d'urgence introuvable.</Text>
      </FondEcran>
    );
  }
  return (
    <FondEcran>
      <EnTete titre={geste.titre} action="retour" />
      <EtapesList etapes={geste.etapes} />
      {geste.numeroUtile ? <NumeroUrgence numero={geste.numeroUtile} /> : null}
    </FondEcran>
  );
}

const styles = StyleSheet.create({
  texte: { fontSize: 15 },
});
