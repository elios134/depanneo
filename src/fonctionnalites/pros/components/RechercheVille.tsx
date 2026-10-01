// src/fonctionnalites/pros/components/RechercheVille.tsx
import { useEffect, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { libelleLieu, type Lieu } from '@/domaine/lieux';
import { useTheme } from '@/theme/ThemeProvider';
import { CarteListe } from '@/ui/CarteListe';
import { Icone } from '@/ui/Icone';
import { Verre } from '@/ui/Verre';
import { chercherVille } from '../api/chercherVille';

const ATTENTE_MS = 400;

export function RechercheVille({ onChoisir }: { onChoisir: (lieu: Lieu) => void }) {
  const { couleurs } = useTheme();
  const [texte, setTexte] = useState('');
  const [lieux, setLieux] = useState<Lieu[]>([]);
  const [erreur, setErreur] = useState(false);

  useEffect(() => {
    const recherche = texte.trim();
    if (recherche.length < 2) {
      setLieux([]);
      setErreur(false);
      return;
    }
    let annule = false;
    const minuterie = setTimeout(() => {
      chercherVille(recherche)
        .then((trouves) => {
          if (annule) return;
          setLieux(trouves);
          setErreur(false);
        })
        .catch(() => {
          if (!annule) setErreur(true);
        });
    }, ATTENTE_MS);
    return () => {
      annule = true;
      clearTimeout(minuterie);
    };
  }, [texte]);

  return (
    <View style={styles.bloc}>
      <Verre style={styles.champ}>
        <Icone nom="search" couleur={couleurs.texteDiscret} taille={16} />
        <TextInput
          value={texte}
          onChangeText={setTexte}
          placeholder="Ta ville ou ton code postal"
          placeholderTextColor={couleurs.texteDiscret}
          accessibilityLabel="Ta ville ou ton code postal"
          autoCorrect={false}
          style={[styles.saisie, { color: couleurs.texte }]}
        />
      </Verre>
      {erreur ? (
        <Text style={[styles.message, { color: couleurs.texteDiscret }]}>Recherche impossible sans connexion.</Text>
      ) : null}
      {lieux.map((lieu) => (
        <CarteListe
          key={`${lieu.nom}-${lieu.codePostal}`}
          icone="map-pin"
          couleur={couleurs.accent}
          titre={libelleLieu(lieu)}
          onPress={() => {
            onChoisir(lieu);
            setTexte('');
            setLieux([]);
          }}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  bloc: { gap: 8 },
  champ: { flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 12, paddingHorizontal: 12 },
  saisie: { flex: 1, fontSize: 14, paddingVertical: 11 },
  message: { fontSize: 12.5, textAlign: 'center' },
});
