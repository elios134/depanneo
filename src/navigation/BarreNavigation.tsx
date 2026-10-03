import type { Tabs } from 'expo-router';
import type { ComponentProps } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NomIcone } from '@/domaine/icones';
import { useTheme } from '@/theme/ThemeProvider';
import { Icone } from '@/ui/Icone';
import { Verre } from '@/ui/Verre';

type PropsBarre = Parameters<NonNullable<ComponentProps<typeof Tabs>['tabBar']>>[0];

const ONGLETS: Record<string, { icone: NomIcone; libelle: string; pilule?: boolean; danger?: boolean }> = {
  '(accueil)': { icone: 'house', libelle: 'Accueil' },
  urgences: { icone: 'triangle-alert', libelle: 'Urgences', danger: true },
  tutos: { icone: 'book-open', libelle: 'Tutos', pilule: true },
  pros: { icone: 'map-pin', libelle: 'Pros' },
  reglages: { icone: 'settings', libelle: 'Réglages' },
};

export function BarreNavigation({ state, navigation }: PropsBarre) {
  const { couleurs } = useTheme();
  const { bottom } = useSafeAreaInsets();
  return (
    <View style={[styles.conteneur, { bottom: bottom + 12 }]} pointerEvents="box-none">
      <Verre style={styles.barre}>
        {state.routes.map((route, index) => {
          const onglet = ONGLETS[route.name];
          if (!onglet) return null;
          const actif = state.index === index;
          const couleur = actif ? couleurs.surAccent : onglet.danger ? couleurs.dangerTexte : couleurs.texteDiscret;
          const aller = () => {
            const evenement = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
            if (!actif && !evenement.defaultPrevented) navigation.navigate(route.name);
          };
          return (
            <Pressable
              key={route.key}
              onPress={aller}
              testID={`onglet-${route.name.replace(/[()]/g, '')}`}
              accessibilityRole="tab"
              accessibilityLabel={onglet.libelle}
              accessibilityState={{ selected: actif }}
              style={[styles.bouton, onglet.pilule && styles.pilule, actif && { backgroundColor: couleurs.accent }]}
            >
              <Icone nom={onglet.icone} couleur={couleur} taille={onglet.pilule ? 16 : 20} />
              {onglet.pilule ? <Text style={[styles.texte, { color: couleur }]}>{onglet.libelle}</Text> : null}
            </Pressable>
          );
        })}
      </Verre>
    </View>
  );
}

const styles = StyleSheet.create({
  conteneur: { position: 'absolute', left: 0, right: 0, alignItems: 'center' },
  barre: { flexDirection: 'row', gap: 4, padding: 6, borderRadius: 26 },
  bouton: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  pilule: { width: 'auto', flexDirection: 'row', gap: 6, paddingHorizontal: 14 },
  texte: { fontSize: 13, fontWeight: '600' },
});
