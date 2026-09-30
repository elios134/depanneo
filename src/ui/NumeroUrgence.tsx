// src/ui/NumeroUrgence.tsx
import { Linking } from 'react-native';
import { BoutonPrincipal } from './BoutonPrincipal';

export function NumeroUrgence({ numero }: { numero: string }) {
  return (
    <BoutonPrincipal
      libelle={`Appeler le ${numero}`}
      icone="phone"
      variante="danger"
      onPress={() => Linking.openURL('tel:' + numero.replace(/\s/g, ''))}
    />
  );
}
