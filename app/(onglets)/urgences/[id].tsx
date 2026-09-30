import { useLocalSearchParams } from 'expo-router';
import { EcranGeste } from '@/fonctionnalites/urgences/EcranGeste';

export default function RouteGeste() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <EcranGeste id={id} />;
}
