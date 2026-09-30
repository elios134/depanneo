import { Stack } from 'expo-router';

export const unstable_settings = { initialRouteName: 'index' };

export default function LayoutUrgences() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
