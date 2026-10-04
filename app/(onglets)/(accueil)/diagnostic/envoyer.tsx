import { useLocalSearchParams } from 'expo-router';
import { EcranEnvoyer } from '@/fonctionnalites/diagnostic/EcranEnvoyer';

export default function RouteEnvoyer() {
  const { id, choix } = useLocalSearchParams<{ id: string; choix?: string }>();
  return <EcranEnvoyer id={id} choix={choix} />;
}
