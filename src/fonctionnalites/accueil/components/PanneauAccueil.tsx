// src/fonctionnalites/accueil/components/PanneauAccueil.tsx — panneau du bas de l'accueil, repliable (maquette 10).
import { router } from 'expo-router';
import { useMemo, useState, type ReactNode } from 'react';
import { LayoutAnimation, PanResponder, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { BoutonPrincipal } from '@/ui/BoutonPrincipal';
import { Icone } from '@/ui/Icone';
import { Verre } from '@/ui/Verre';
import { decisionGlissement, libelleReplie } from '../lib/panneau';

export function PanneauAccueil({ children, nombrePros }: { children?: ReactNode; nombrePros: number }) {
  const { couleurs } = useTheme();
  const [replie, setReplie] = useState(false);

  const changer = (valeur: boolean) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setReplie(valeur);
  };

  // Glisser vers le bas replie, vers le haut déplie ; les appuis sur les boutons restent normaux.
  const glissement = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_e, g) => Math.abs(g.dy) > 8 && Math.abs(g.dy) > Math.abs(g.dx),
        onPanResponderRelease: (_e, g) => {
          const decision = decisionGlissement(g.dy);
          if (decision) changer(decision === 'replier');
        },
      }),
    [],
  );

  return (
    <View {...glissement.panHandlers}>
      <Verre style={styles.panneau}>
        <Pressable
          onPress={() => changer(!replie)}
          accessibilityRole="button"
          accessibilityLabel={replie ? 'Déplier le panneau' : 'Replier le panneau'}
          hitSlop={10}
          style={styles.zonePoignee}
        >
          <View style={[styles.poignee, { backgroundColor: couleurs.bordure }]} />
        </Pressable>
        <BoutonPrincipal libelle="Diagnostiquer une panne" icone="stethoscope" onPress={() => router.push('/diagnostic')} />
        {replie ? (
          <Pressable onPress={() => changer(false)} accessibilityRole="button" style={styles.replie} hitSlop={6}>
            <Icone nom="chevron-up" taille={14} couleur={couleurs.texteDiscret} />
            <Text style={[styles.texteReplie, { color: couleurs.texteDiscret }]}>{libelleReplie(nombrePros)}</Text>
          </Pressable>
        ) : (
          <>
            {children}
            <Text style={[styles.avertissement, { color: couleurs.texteDiscret }]}>
              Conseils uniquement — ne remplace pas un professionnel.
            </Text>
          </>
        )}
      </Verre>
    </View>
  );
}

const styles = StyleSheet.create({
  panneau: { borderRadius: 24, padding: 12, gap: 10 },
  zonePoignee: { alignSelf: 'stretch', alignItems: 'center', paddingVertical: 2 },
  poignee: { width: 38, height: 4, borderRadius: 2 },
  replie: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  texteReplie: { fontSize: 13 },
  avertissement: { fontSize: 12.5, textAlign: 'center' },
});
