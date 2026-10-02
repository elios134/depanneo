// src/ui/CarteRenvoi.tsx — bouton « continuer avec… » (résultat de diagnostic, encadré de tuto ; maquettes 8 et 9).
import { router } from 'expo-router';
import { decrireRenvoi } from '@/domaine/renvoi';
import type { Renvoi } from '@/domaine/types';
import { diagnostics } from '@/donnees/diagnostics';
import { gestesUrgence } from '@/donnees/gestesUrgence';
import { useTheme } from '@/theme/ThemeProvider';
import { CarteListe } from '@/ui/CarteListe';

export function CarteRenvoi({ renvoi }: { renvoi: Renvoi }) {
  const { couleurs } = useTheme();
  const description = decrireRenvoi(renvoi, diagnostics, gestesUrgence);
  if (!description) return null;
  const couleur = description.ton === 'accent' ? couleurs.accent : couleurs.danger;
  const ouvrir = () => {
    if (renvoi.type === 'diagnostic') {
      // Nouvel écran : le diagnostic renvoyé démarre à sa première question.
      router.push({ pathname: '/diagnostic/[id]', params: { id: renvoi.id } });
    } else {
      router.push({ pathname: '/urgences/[id]', params: { id: renvoi.id } }, { withAnchor: true });
    }
  };
  return (
    <CarteListe
      icone={description.icone}
      couleur={couleur}
      couleurBordure={couleur}
      titre={description.titre}
      sousTitre={description.sousTitre}
      onPress={ouvrir}
    />
  );
}
