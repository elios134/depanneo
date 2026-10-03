// src/fonctionnalites/accueil/EcranAccueil.tsx
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CartePros } from '@/fonctionnalites/pros/components/CartePros';
import { useCarteEchec } from '@/fonctionnalites/pros/hooks/useCarteEchec';
import { usePosition } from '@/fonctionnalites/pros/hooks/usePosition';
import { usePros } from '@/fonctionnalites/pros/hooks/usePros';
import { useTheme } from '@/theme/ThemeProvider';
import { BandeauHorsLigne } from '@/ui/BandeauHorsLigne';
import { useMargeBarre } from '@/ui/useMargeBarre';
import { BoutonRecentrer } from './components/BoutonRecentrer';
import { PanneauAccueil } from './components/PanneauAccueil';
import { SectionPros } from './components/SectionPros';

export function EcranAccueil() {
  const { couleurs } = useTheme();
  const { top } = useSafeAreaInsets();
  const margeBarre = useMargeBarre();
  const { position, statut, demanderAutorisation } = usePosition();
  const { pros, etat, date, reessayer } = usePros(position);
  const { carteEchec, setCarteEchec, rechargement, relancerCarte } = useCarteEchec();
  const [recentrage, setRecentrage] = useState(0);
  const horsLigne = etat === 'hors-ligne';
  // Fond de carte non chargé (mode avion avec liste en cache) : même bandeau que hors connexion.
  const sansReseau = horsLigne || carteEchec;
  const indisponible = etat === 'indisponible';

  return (
    <View style={[styles.racine, { backgroundColor: couleurs.carteSol }]}>
      <CartePros centre={position} pros={pros} horsLigne={horsLigne} recentrage={recentrage} onEchecCarte={setCarteEchec} rechargement={rechargement} />
      <View style={[styles.haut, { top: top + 12 }]}>
        <View style={styles.place} />
        {sansReseau ? <BandeauHorsLigne /> : indisponible ? <BandeauHorsLigne texte="Service des pros indisponible" /> : null}
        {statut === 'gps' && !sansReseau ? (
          <BoutonRecentrer onPress={() => setRecentrage((n) => n + 1)} />
        ) : (
          <View style={styles.place} />
        )}
      </View>
      {!sansReseau ? (
        <Text style={[styles.credit, { top: top + 62, color: couleurs.texteDiscret }]}>© OpenFreeMap · OpenMapTiles · OpenStreetMap</Text>
      ) : null}
      <View style={[styles.panneau, { bottom: margeBarre - 8 }]}>
        <PanneauAccueil>
          <SectionPros statut={statut} pros={pros} etat={etat} date={date} onUtiliserPosition={demanderAutorisation} peutReessayer={sansReseau || indisponible}
            onReessayer={() => {
              reessayer();
              relancerCarte();
            }}
          />
        </PanneauAccueil>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  racine: { flex: 1 },
  haut: { position: 'absolute', pointerEvents: 'box-none', left: 16, right: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  place: { width: 44, height: 44 },
  credit: { position: 'absolute', left: 16, fontSize: 10 },
  panneau: { position: 'absolute', left: 10, right: 10 },
});
