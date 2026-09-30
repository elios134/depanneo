import { Stack } from 'expo-router';
import { ReglagesProvider } from '@/fonctionnalites/reglages/ReglagesProvider';

export default function RootLayout() {
  return (
    <ReglagesProvider>
      <Stack>
        <Stack.Screen name="index" options={{ title: 'Dépann\'Maison' }} />
        <Stack.Screen name="diagnostics/index" options={{ title: 'Diagnostiquer une panne' }} />
        <Stack.Screen name="diagnostics/[id]" options={{ title: 'Diagnostic' }} />
        <Stack.Screen name="urgences/[id]" options={{ title: 'Geste d\'urgence' }} />
        <Stack.Screen name="tutos/[id]" options={{ title: 'Tuto' }} />
      </Stack>
    </ReglagesProvider>
  );
}
