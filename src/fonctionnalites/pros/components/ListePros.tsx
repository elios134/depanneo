import { StyleSheet, Text, View } from 'react-native';
import { estJoignable, type Metier, type Pro } from '@/domaine/pro';
import { useTheme } from '@/theme/ThemeProvider';
import { CartePro } from '@/ui/CartePro';

interface Props {
  pros: Pro[];
  filtre: Metier | 'tous';
  onOuvrir: (pro: Pro) => void;
}

/** Deux sections : les pros qu'on peut appeler, puis les artisans du registre (numéro à chercher). */
export function ListePros({ pros, filtre, onOuvrir }: Props) {
  const { couleurs } = useTheme();
  const joignables = pros.filter(estJoignable);
  const autres = pros.filter((p) => !estJoignable(p));
  const metier = filtre === 'tous' ? undefined : filtre;
  const titre = { color: couleurs.texteDiscret };
  return (
    <>
      {joignables.length > 0 ? (
        <View style={styles.section}>
          <Text testID="section-joignables" style={[styles.titre, titre]}>Joignables tout de suite</Text>
          {joignables.map((pro) => (
            <CartePro key={pro.id} pro={pro} metier={metier} onOuvrir={onOuvrir} />
          ))}
        </View>
      ) : null}
      {autres.length > 0 ? (
        <View style={styles.section}>
          <Text testID="section-registre" style={[styles.titre, titre]}>
            Autres artisans déclarés <Text style={styles.aide}>· numéro à chercher</Text>
          </Text>
          {autres.map((pro) => (
            <CartePro key={pro.id} pro={pro} metier={metier} onOuvrir={onOuvrir} />
          ))}
        </View>
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  section: { gap: 8 },
  titre: { fontSize: 11.5, textTransform: 'uppercase', letterSpacing: 0.6, marginTop: 4 },
  aide: { textTransform: 'none', letterSpacing: 0 },
});
