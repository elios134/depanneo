import { Stack } from 'expo-router';
import { ReglagesProvider } from '@/fonctionnalites/reglages/ReglagesProvider';
import { ThemeProvider } from '@/theme/ThemeProvider';

export default function RootLayout() {
  return (
    <ReglagesProvider>
      <ThemeProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(onglets)" />
        </Stack>
      </ThemeProvider>
    </ReglagesProvider>
  );
}
