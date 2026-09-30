import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Hauteur occupée par la barre flottante : marge 12 + barre 58, plus 16 d'air.
export function useMargeBarre(): number {
  const { bottom } = useSafeAreaInsets();
  return bottom + 12 + 58 + 16;
}
