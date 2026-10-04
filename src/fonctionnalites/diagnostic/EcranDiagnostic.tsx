import { Pressable, StyleSheet, Text } from 'react-native';
import { metierDeCategorie } from '@/domaine/pro';
import type { Diagnostic } from '@/domaine/types';
import { diagnostics } from '@/donnees/diagnostics';
import { useTheme } from '@/theme/ThemeProvider';
import { EnTete } from '@/ui/EnTete';
import { FondEcran } from '@/ui/FondEcran';
import { BarreProgression } from './components/BarreProgression';
import { CarteQuestion } from './components/CarteQuestion';
import { CarteResultat } from './components/CarteResultat';
import { useParcoursDiagnostic } from './hooks/useParcoursDiagnostic';

function Parcours({ diagnostic }: { diagnostic: Diagnostic }) {
  const { couleurs } = useTheme();
  const parcours = useParcoursDiagnostic(diagnostic);
  if (parcours.resultat) {
    return (
      <FondEcran>
        <EnTete titre="Résultat" action="fermer" />
        <CarteResultat diagnosticId={diagnostic.id} choix={parcours.choix} resultat={parcours.resultat} metier={metierDeCategorie(diagnostic.categorie)} onRecommencer={parcours.recommencer} />
      </FondEcran>
    );
  }
  return (
    <FondEcran>
      <EnTete titre={diagnostic.titre} action="fermer" />
      <BarreProgression valeur={parcours.progression} />
      <Text style={[styles.numero, { color: couleurs.texteDiscret }]}>Question {parcours.numeroQuestion}</Text>
      {parcours.etape ? <CarteQuestion etape={parcours.etape} onRepondre={parcours.repondre} /> : null}
      {parcours.peutRevenir ? (
        <Pressable onPress={parcours.precedente} accessibilityRole="button">
          <Text style={[styles.precedente, { color: couleurs.accent }]}>← Question précédente</Text>
        </Pressable>
      ) : null}
    </FondEcran>
  );
}

export function EcranDiagnostic({ id }: { id: string }) {
  const { couleurs } = useTheme();
  const diagnostic = diagnostics.find((d) => d.id === id);
  if (!diagnostic) {
    return (
      <FondEcran>
        <EnTete titre="Diagnostic" action="retour" />
        <Text style={{ color: couleurs.texte }}>Diagnostic introuvable.</Text>
      </FondEcran>
    );
  }
  return <Parcours key={diagnostic.id} diagnostic={diagnostic} />;
}

const styles = StyleSheet.create({
  numero: { fontSize: 12.5 },
  precedente: { fontSize: 14, textAlign: 'center', marginTop: 12 },
});
