// src/fonctionnalites/tutos/EcranTuto.tsx
import { StyleSheet, Text } from 'react-native';
import { tutos } from '@/donnees/tutos';
import { useTheme } from '@/theme/ThemeProvider';
import { EnTete } from '@/ui/EnTete';
import { EtapesList } from '@/ui/EtapesList';
import { FondEcran } from '@/ui/FondEcran';

export function EcranTuto({ id }: { id: string }) {
  const { couleurs } = useTheme();
  const tuto = tutos.find((t) => t.id === id);
  if (!tuto) {
    return (
      <FondEcran>
        <EnTete titre="Tuto" action="retour" />
        <Text style={[styles.texte, { color: couleurs.texte }]}>Tuto introuvable.</Text>
      </FondEcran>
    );
  }
  return (
    <FondEcran>
      <EnTete titre={tuto.titre} sousTitre={`${tuto.duree} · ${tuto.outil}`} action="retour" />
      <EtapesList etapes={tuto.etapes} />
    </FondEcran>
  );
}

const styles = StyleSheet.create({
  texte: { fontSize: 15 },
});
