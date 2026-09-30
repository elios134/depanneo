import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import type { Resultat } from '@/domaine/types';
import { gestesUrgence } from '@/donnees/gestesUrgence';
import { tutos } from '@/donnees/tutos';
import { useTheme } from '@/theme/ThemeProvider';
import { BoutonPrincipal } from '@/ui/BoutonPrincipal';
import { CarteListe } from '@/ui/CarteListe';
import { NumeroUrgence } from '@/ui/NumeroUrgence';
import { VerdictBadge } from '@/ui/VerdictBadge';

export function CarteResultat({ resultat, onRecommencer }: { resultat: Resultat; onRecommencer: () => void }) {
  const { couleurs } = useTheme();
  const tuto = tutos.find((t) => t.id === resultat.tutoId);
  const geste = gestesUrgence.find((g) => g.id === resultat.gesteUrgenceId);

  const boutonTuto = tuto ? (
    <BoutonPrincipal
      key="tuto"
      libelle={`Voir le tuto (${tuto.duree})`}
      icone="book-open"
      onPress={() => router.push({ pathname: '/tutos/[id]', params: { id: tuto.id } })}
    />
  ) : null;
  const carteGeste = geste ? (
    <CarteListe
      key="geste"
      icone={geste.icone}
      couleur={couleurs.danger}
      titre={geste.titre}
      sousTitre="Geste de sécurité"
      onPress={() => router.push({ pathname: '/urgences/[id]', params: { id: geste.id } })}
    />
  ) : null;
  const numero = resultat.numeroUtile ? <NumeroUrgence key="numero" numero={resultat.numeroUtile} /> : null;

  const actions =
    resultat.verdict === 'vert' ? [boutonTuto, carteGeste] :
    resultat.verdict === 'orange' ? [carteGeste, numero, boutonTuto] :
    [numero, carteGeste, boutonTuto];

  return (
    <View style={styles.bloc}>
      <VerdictBadge verdict={resultat.verdict} />
      <Text style={[styles.conseil, { color: couleurs.texte }]}>{resultat.conseil}</Text>
      {actions}
      <BoutonPrincipal libelle="Recommencer" icone="rotate-ccw" variante="discret" onPress={onRecommencer} />
    </View>
  );
}

const styles = StyleSheet.create({
  bloc: { gap: 12 },
  conseil: { fontSize: 15, lineHeight: 22 },
});
