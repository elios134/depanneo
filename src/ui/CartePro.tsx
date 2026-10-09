// src/ui/CartePro.tsx
import { Pressable, StyleSheet } from 'react-native';
import { lienChercherNumero } from '@/domaine/liensPro';
import { estJoignable, sousTitrePro, type Metier, type Pro } from '@/domaine/pro';
import { teinte } from '@/theme/teinte';
import { useTheme } from '@/theme/ThemeProvider';
import { appeler } from './appeler';
import { BadgeRge } from './BadgeRge';
import { CarteListe } from './CarteListe';
import { Icone } from './Icone';
import { ouvrirLien } from './ouvrirLien';

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
  const joignable = estJoignable(pro);
  return (
    <CarteListe
      icone={metier === 'plombier' ? 'wrench' : 'zap'}
      couleur={metier === 'plombier' ? couleurs.plomberie : couleurs.electricite}
      titre={pro.nom}
      testID={joignable ? 'carte-pro' : 'carte-pro-registre'}
      onPress={onOuvrir ? () => onOuvrir(pro) : undefined}
      sousTitre={sousTitrePro(pro)}
      badge={pro.rge ? <BadgeRge /> : undefined}
      discret={!joignable}
      droite={
        telephone ? (
          <Pressable
            onPress={() => appeler(telephone)}
            accessibilityRole="button"
            accessibilityLabel={`Appeler ${pro.nom}`}
            hitSlop={6}
            style={[styles.rond, { backgroundColor: teinte(couleurs.accent, 0.18) }]}
          >
            <Icone nom="phone" couleur={couleurs.accent} taille={16} />
          </Pressable>
        ) : (
          <Pressable
            onPress={() => ouvrirLien(lienChercherNumero(pro))}
            accessibilityRole="button"
            accessibilityLabel={`Chercher le numéro de ${pro.nom}`}
            hitSlop={6}
            style={[styles.rond, { borderWidth: 1, borderColor: teinte(couleurs.accent, 0.4) }]}
          >
            <Icone nom="search" couleur={couleurs.accent} taille={16} />
          </Pressable>
        )
      }
    />
  );
}

const styles = StyleSheet.create({
  rond: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
});
