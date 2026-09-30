import { Alert, Linking } from 'react-native';

export function appeler(numero: string): void {
  Linking.openURL('tel:' + numero.replace(/\s/g, '')).catch(() =>
    Alert.alert('Appel impossible', `Compose le ${numero} depuis ton téléphone.`),
  );
}
