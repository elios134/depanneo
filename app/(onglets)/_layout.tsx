import { Tabs } from 'expo-router';
import { BarreNavigation } from '@/navigation/BarreNavigation';

export default function LayoutOnglets() {
  return (
    <Tabs tabBar={(props) => <BarreNavigation {...props} />} screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="(accueil)" />
      <Tabs.Screen name="urgences" options={{ popToTopOnBlur: true }} />
      <Tabs.Screen name="tutos" />
      <Tabs.Screen name="pros" />
      <Tabs.Screen name="reglages" />
    </Tabs>
  );
}
