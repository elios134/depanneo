import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/theme/ThemeProvider';
import { useMargeBarre } from '@/ui/useMargeBarre';
import { FondCarte } from '@/fonctionnalites/pros/components/FondCarte';
import { Logo } from './components/Logo';
import { PanneauAccueil } from './components/PanneauAccueil';

export function EcranAccueil() {
  const { couleurs } = useTheme();
  const { top } = useSafeAreaInsets();
  const margeBarre = useMargeBarre();
  return (
    <View style={[styles.racine, { backgroundColor: couleurs.carteSol }]}>
      <FondCarte />
      <View style={[styles.logo, { top: top + 12 }]}>
        <Logo />
      </View>
      <View style={[styles.panneau, { bottom: margeBarre - 8 }]}>
        <PanneauAccueil />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  racine: { flex: 1 },
  logo: { position: 'absolute', left: 16 },
  panneau: { position: 'absolute', left: 10, right: 10 },
});
