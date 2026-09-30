import { useLocalSearchParams } from 'expo-router';
import { EcranDiagnostic } from '@/fonctionnalites/diagnostic/EcranDiagnostic';

export default function RouteDiagnostic() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <EcranDiagnostic id={id} />;
}
