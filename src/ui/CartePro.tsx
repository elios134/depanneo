// src/ui/CartePro.tsx
import { Pressable, StyleSheet } from 'react-native';
import { sousTitrePro, type Metier, type Pro } from '@/domaine/pro';
import { teinte } from '@/theme/teinte';
import { useTheme } from '@/theme/ThemeProvider';
import { appeler } from './appeler';
import { CarteListe } from './CarteListe';
import { Icone } from './Icone';

interface Props {
  pro: Pro;
  onOuvrir?: (pro: Pro) => void;
  /** Métier mis en avant (icône et couleur) ; par défaut le premier métier du pro. */
  metier?: Metier;
}

export function CartePro({ pro, onOuvrir, metier: metierDemande }: Props) {
  const { couleurs } = useTheme();
  const metier = metierDemande ?? pro.metiers[0];
  const telephone = pro.telephone;
  return (
    <CarteListe
      icone={metier === 'plombier' ? 'wrench' : 'zap'}
      couleur={metier === 'plombier' ? couleurs.plomberie : couleurs.electricite}
      titre={pro.nom}
      testID="carte-pro"
      onPress={onOuvrir ? () => onOuvrir(pro) : undefined}
      sousTitre={sousTitrePro(pro)}
      droite={
        telephone ? (
          <Pressable
            onPress={() => appeler(telephone)}
            accessibilityRole="button"
            accessibilityLabel={`Appeler ${pro.nom}`}
            hitSlop={6}
            style={[styles.appel, { backgroundColor: teinte(couleurs.accent, 0.18) }]}
          >
            <Icone nom="phone" couleur={couleurs.accent} taille={16} />
          </Pressable>
        ) : null
      }
    />
  );
}

const styles = StyleSheet.create({
  appel: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
});
