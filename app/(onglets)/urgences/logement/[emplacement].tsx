import { useLocalSearchParams } from 'expo-router';
import { EcranEmplacement } from '@/fonctionnalites/logement/EcranEmplacement';

export default function RouteEmplacement() {
  const { emplacement } = useLocalSearchParams<{ emplacement: string }>();
  return <EcranEmplacement emplacement={emplacement} />;
}
