// src/fonctionnalites/urgences/EcranGeste.tsx
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text } from 'react-native';
import { gestesUrgence } from '@/donnees/gestesUrgence';
import { useTheme } from '@/theme/ThemeProvider';
import { EnTete } from '@/ui/EnTete';
import { EtapesList } from '@/ui/EtapesList';
import { FondEcran } from '@/ui/FondEcran';
import { NumeroUrgence } from '@/ui/NumeroUrgence';
import { ChezToi } from '../logement/components/ChezToi';
import { useLogement } from '../logement/LogementProvider';
import { emplacementDuGeste, estRenseigne } from '../logement/lib/logement';

export function EcranGeste({ id }: { id: string }) {
  const { couleurs } = useTheme();
  const { logement } = useLogement();
  const geste = gestesUrgence.find((g) => g.id === id);
  if (!geste) {
    return (
      <FondEcran>
        <EnTete titre="Geste d'urgence" action="retour" />
        <Text style={[styles.texte, { color: couleurs.texte }]}>Geste d&apos;urgence introuvable.</Text>
      </FondEcran>
    );
  }
  const emplacement = emplacementDuGeste(id);
  const info = emplacement ? logement[emplacement] : undefined;
  return (
    <FondEcran>
      <EnTete titre={geste.titre} action="retour" />
      {info && estRenseigne(info) ? <ChezToi info={info} compact={id === 'couper-gaz'} /> : null}
      {emplacement && !estRenseigne(info) ? (
        <Pressable
          testID="enregistrer-emplacement"
          accessibilityRole="link"
          onPress={() => router.push({ pathname: '/urgences/logement/[emplacement]', params: { emplacement } })}
        >
          <Text style={[styles.lien, { color: couleurs.accent }]}>Enregistrer l&apos;emplacement</Text>
        </Pressable>
      ) : null}
      <EtapesList etapes={geste.etapes} />
      {geste.numeroUtile ? <NumeroUrgence numero={geste.numeroUtile} /> : null}
    </FondEcran>
  );
}

const styles = StyleSheet.create({
  texte: { fontSize: 15 },
  lien: { fontSize: 13.5, fontWeight: '600' },
});
