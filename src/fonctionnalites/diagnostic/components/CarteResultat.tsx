// src/fonctionnalites/diagnostic/components/CarteResultat.tsx
import { router } from 'expo-router';
import { useState, type ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LIBELLES_METIER, type Metier, type Pro } from '@/domaine/pro';
import type { Resultat } from '@/domaine/types';
import { gestesUrgence } from '@/donnees/gestesUrgence';
import { tutos } from '@/donnees/tutos';
import { usePosition } from '@/fonctionnalites/pros/hooks/usePosition';
import { usePros } from '@/fonctionnalites/pros/hooks/usePros';
import { filtrerPros } from '@/fonctionnalites/pros/lib/filtrerPros';
import { useTheme } from '@/theme/ThemeProvider';
import { BoutonPrincipal } from '@/ui/BoutonPrincipal';
import { CarteListe } from '@/ui/CarteListe';
import { CarteRenvoi } from '@/ui/CarteRenvoi';
import { CartePro } from '@/ui/CartePro';
import { FichePro } from '@/ui/FichePro';
import { NumeroUrgence } from '@/ui/NumeroUrgence';
import { VerdictBadge } from '@/ui/VerdictBadge';
import { ordreActions, type Action } from '../lib/ordreActions';
import { prosVisibles } from '../lib/renvoi';
import { BlocQuiPaie } from './BlocQuiPaie';

interface Props {
  diagnosticId: string;
  /** Indices des réponses choisies, pour reconstruire le message « Envoyer à un pro ». */
  choix: number[];
  resultat: Resultat;
  metier: Metier;
  onRecommencer: () => void;
}

export function CarteResultat({ diagnosticId, choix, resultat, metier, onRecommencer }: Props) {
  const { couleurs } = useTheme();
  const { position } = usePosition({ passif: true });
  const { pros } = usePros(position);
  const [proOuvert, setProOuvert] = useState<Pro | null>(null);
  const tuto = tutos.find((t) => t.id === resultat.tutoId);
  const geste = gestesUrgence.find((g) => g.id === resultat.gesteUrgenceId);
  const prosMetier = prosVisibles(resultat)
    ? filtrerPros(pros, metier).slice(0, resultat.verdict === 'vert' ? 1 : 2)
    : [];

  const carteRenvoi = resultat.renvoi ? <CarteRenvoi key="renvoi" renvoi={resultat.renvoi} /> : null;
  const boutonTuto = tuto ? (
    <BoutonPrincipal
      key="tuto"
      testID="bouton-tuto"
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
          <CartePro key={pro.id} pro={pro} metier={metier} onOuvrir={setProOuvert} />
        ))}
      </View>
    ) : null;

  const boutonEnvoyer = (
    <BoutonPrincipal
      key="envoyer"
      testID="bouton-envoyer-plombier"
      libelle="Envoyer à un pro"
      icone="share"
      variante="discret"
      onPress={() =>
        router.push({ pathname: '/diagnostic/envoyer', params: { id: diagnosticId, choix: choix.join(',') } }, { withAnchor: true })
      }
    />
  );
  const quiPaie = <BlocQuiPaie key="qui-paie" info={resultat.quiPaie} />;

  const elements: Record<Action, ReactNode> = {
    renvoi: carteRenvoi, quiPaie, tuto: boutonTuto, geste: carteGeste, numero, envoyer: boutonEnvoyer, pros: sectionPros,
  };
  const actions = ordreActions(resultat.verdict).map((a) => elements[a]);

  return (
    <>
      <View style={styles.bloc}>
        <VerdictBadge verdict={resultat.verdict} />
        <Text style={[styles.conseil, { color: couleurs.texte }]}>{resultat.conseil}</Text>
        {actions}
        <BoutonPrincipal libelle="Recommencer" icone="rotate-ccw" variante="discret" onPress={onRecommencer} />
      </View>
      <FichePro pro={proOuvert} onFermer={() => setProOuvert(null)} />
    </>
  );
}

const styles = StyleSheet.create({
  bloc: { gap: 12 },
  conseil: { fontSize: 15, lineHeight: 22 },
  pros: { gap: 8 },
  titrePros: { fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.6 },
});
