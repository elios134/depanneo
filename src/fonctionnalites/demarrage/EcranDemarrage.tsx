// src/fonctionnalites/demarrage/EcranDemarrage.tsx — écran de démarrage texturé (maquette 11, option A).
// Android n'affiche qu'une couleur unie au lancement : on prend le relais ici avec le fond à halos,
// le logo exactement à la même place, puis un fondu vers l'appli.
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useRef, useState } from 'react';
import { Animated, Image, StyleSheet } from 'react-native';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';
import { COULEURS_DEMARRAGE as C } from '@/theme/tokens';
import { useMouvementReduit } from '@/ui/schemas/useMouvementReduit';

const DUREE_AFFICHAGE_MS = 900;
const DUREE_FONDU_MS = 300;
// Même taille que le logo de l'écran natif (cercle d'Android 12 : 2/3 de 288 dp).
const LARGEUR_LOGO = 113;
const LOGO = require('../../../assets/images/logo-demarrage.png');

export function EcranDemarrage() {
  const [visible, setVisible] = useState(true);
  const opacite = useRef(new Animated.Value(1)).current;
  const immobile = useMouvementReduit();

  useEffect(() => {
    const id = setTimeout(() => {
      if (immobile) {
        setVisible(false);
        return;
      }
      Animated.timing(opacite, { toValue: 0, duration: DUREE_FONDU_MS, useNativeDriver: true }).start(() =>
        setVisible(false),
      );
    }, DUREE_AFFICHAGE_MS);
    return () => clearTimeout(id);
  }, [immobile, opacite]);

  if (!visible) return null;
  return (
    <Animated.View
      onLayout={() => SplashScreen.hideAsync().catch(() => undefined)}
      style={[StyleSheet.absoluteFill, styles.centre, { backgroundColor: C.fond, opacity: opacite }]}
    >
      <Svg style={StyleSheet.absoluteFill}>
        <Defs>
          <RadialGradient id="demarrageViolet" cx="85%" cy="8%" r="55%">
            <Stop offset="0" stopColor={C.haloViolet} />
            <Stop offset="1" stopColor={C.fond} stopOpacity="0" />
          </RadialGradient>
          <RadialGradient id="demarrageBleu" cx="10%" cy="70%" r="60%">
            <Stop offset="0" stopColor={C.haloBleu} />
            <Stop offset="1" stopColor={C.fond} stopOpacity="0" />
          </RadialGradient>
        </Defs>
        <Rect width="100%" height="100%" fill="url(#demarrageViolet)" />
        <Rect width="100%" height="100%" fill="url(#demarrageBleu)" />
      </Svg>
      <Image
        source={LOGO}
        accessibilityLabel="Dépannéo"
        style={{ width: LARGEUR_LOGO, aspectRatio: 600 / 767 }}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  centre: { alignItems: 'center', justifyContent: 'center', zIndex: 100, pointerEvents: 'none' },
});
