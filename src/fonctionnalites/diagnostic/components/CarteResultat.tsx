// src/fonctionnalites/diagnostic/components/CarteResultat.tsx
import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { LIBELLES_METIER, type Metier } from '@/domaine/pro';
import type { Resultat } from '@/domaine/types';
import { gestesUrgence } from '@/donnees/gestesUrgence';
import { tutos } from '@/donnees/tutos';
import { usePosition } from '@/fonctionnalites/pros/hooks/usePosition';
import { usePros } from '@/fonctionnalites/pros/hooks/usePros';
import { filtrerPros } from '@/fonctionnalites/pros/lib/filtrerPros';
import { useTheme } from '@/theme/ThemeProvider';
import { BoutonPrincipal } from '@/ui/BoutonPrincipal';
import { CarteListe } from '@/ui/CarteListe';
import { CartePro } from '@/ui/CartePro';
import { NumeroUrgence } from '@/ui/NumeroUrgence';
import { VerdictBadge } from '@/ui/VerdictBadge';

interface Props {
  resultat: Resultat;
  metier: Metier;
  onRecommencer: () => void;
}

export function CarteResultat({ resultat, metier, onRecommencer }: Props) {
  const { couleurs } = useTheme();
  const { position } = usePosition();
  const { pros } = usePros(position);
  const tuto = tutos.find((t) => t.id === resultat.tutoId);
  const geste = gestesUrgence.find((g) => g.id === resultat.gesteUrgenceId);
  const prosMetier = filtrerPros(pros, metier).slice(0, resultat.verdict === 'vert' ? 1 : 2);

  const boutonTuto = tuto ? (
    <BoutonPrincipal
      key="tuto"
      libelle={`Voir le tuto (${tuto.duree})`}
      icone="book-open"
      onPress={() => router.push({ pathname: '/tutos/[id]', params: { id: tuto.id } }, { withAnchor: true })}
    />
  ) : null;
  const carteGeste = geste ? (
    <CarteListe
      key="geste"
      icone={geste.icone}
      couleur={couleurs.danger}
      titre={geste.titre}
      sousTitre="Geste de sécurité"
      onPress={() => router.push({ pathname: '/urgences/[id]', params: { id: geste.id } }, { withAnchor: true })}
    />
  ) : null;
  const numero = resultat.numeroUtile ? <NumeroUrgence key="numero" numero={resultat.numeroUtile} /> : null;
  const sectionPros =
    prosMetier.length > 0 ? (
      <View key="pros" style={styles.pros}>
        <Text style={[styles.titrePros, { color: couleurs.texteDiscret }]}>
          {resultat.verdict === 'vert' ? 'Si tu préfères un pro' : `${LIBELLES_METIER[metier]}s près de toi`}
        </Text>
        {prosMetier.map((pro) => (
          <CartePro key={pro.id} pro={pro} />
        ))}
      </View>
    ) : null;

  const actions =
    resultat.verdict === 'vert' ? [boutonTuto, carteGeste, sectionPros] :
    resultat.verdict === 'orange' ? [carteGeste, numero, sectionPros, boutonTuto] :
    [numero, sectionPros, carteGeste];

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
  pros: { gap: 8 },
  titrePros: { fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.6 },
});
