import { useLocalSearchParams } from 'expo-router';
import { EcranTuto } from '@/fonctionnalites/tutos/EcranTuto';

export default function RouteTuto() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <EcranTuto id={id} />;
}
