import { Stack } from 'expo-router';
import { QuestionStatut } from '@/fonctionnalites/bienvenue/QuestionStatut';
import { LogementProvider } from '@/fonctionnalites/logement/LogementProvider';
import { ReglagesProvider } from '@/fonctionnalites/reglages/ReglagesProvider';
import { demarrerSurveillance } from '@/surveillance/sentry';
import { ThemeProvider } from '@/theme/ThemeProvider';

demarrerSurveillance();

export default function RootLayout() {
  return (
    <ReglagesProvider>
      <LogementProvider>
        <ThemeProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(onglets)" />
          </Stack>
          <QuestionStatut />
        </ThemeProvider>
      </LogementProvider>
    </ReglagesProvider>
  );
}
