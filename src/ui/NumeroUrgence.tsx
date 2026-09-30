// src/ui/NumeroUrgence.tsx
import { appeler } from './appeler';
import { BoutonPrincipal } from './BoutonPrincipal';

export function NumeroUrgence({ numero }: { numero: string }) {
  return (
    <BoutonPrincipal
      libelle={`Appeler le ${numero}`}
      icone="phone"
      variante="danger"
      onPress={() => appeler(numero)}
    />
  );
}
