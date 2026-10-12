import { Alert, Linking } from 'react-native';

/** Ouvre une adresse (web, mailto…) ; message clair si le téléphone ne sait pas l'ouvrir. */
export function ouvrirLien(url: string): void {
  Linking.openURL(url).catch(() => Alert.alert('Ouverture impossible', "Cette adresse ne peut pas s'ouvrir sur ton téléphone."));
}
