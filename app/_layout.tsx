import * as SplashScreen from 'expo-splash-screen';
import { Stack } from 'expo-router';
import { EcranDemarrage } from '@/fonctionnalites/demarrage/EcranDemarrage';
import { ReglagesProvider } from '@/fonctionnalites/reglages/ReglagesProvider';
import { ThemeProvider } from '@/theme/ThemeProvider';

// L'écran natif reste affiché jusqu'à ce que notre écran de démarrage texturé prenne le relais.
SplashScreen.preventAutoHideAsync().catch(() => undefined);

export default function RootLayout() {
  return (
    <ReglagesProvider>
      <ThemeProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(onglets)" />
        </Stack>
        <EcranDemarrage />
      </ThemeProvider>
    </ReglagesProvider>
  );
}
