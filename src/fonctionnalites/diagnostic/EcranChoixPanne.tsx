import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, TextInput } from 'react-native';
import type { Categorie } from '@/domaine/types';
import { diagnostics } from '@/donnees/diagnostics';
import { couleurCategorie } from '@/theme/couleurCategorie';
import { useTheme } from '@/theme/ThemeProvider';
import { CarteListe } from '@/ui/CarteListe';
import { EnTete } from '@/ui/EnTete';
import { FondEcran } from '@/ui/FondEcran';
import { Icone } from '@/ui/Icone';
import { Onglets } from '@/ui/Onglets';
import { Verre } from '@/ui/Verre';
import { filtrerPannes } from './lib/recherche';

export function EcranChoixPanne() {
  const { couleurs } = useTheme();
  const [categorie, setCategorie] = useState<Categorie>('plomberie');
  const [recherche, setRecherche] = useState('');
  const liste = filtrerPannes(diagnostics, categorie, recherche);
  return (
    <FondEcran>
      <EnTete titre="Quelle panne ?" action="retour" />
      <Onglets
        options={[
          { valeur: 'plomberie', libelle: 'Plomberie' },
          { valeur: 'electricite', libelle: 'Électricité' },
        ]}
        valeur={categorie}
        onChange={setCategorie}
      />
      <Verre style={styles.recherche}>
        <Icone nom="search" couleur={couleurs.texteDiscret} taille={16} />
        <TextInput
          value={recherche}
          onChangeText={setRecherche}
          placeholder="Chercher : « fuite », « WC »…"
          placeholderTextColor={couleurs.texteDiscret}
          style={[styles.champ, { color: couleurs.texte }]}
        />
      </Verre>
      {liste.map((panne) => (
        <CarteListe
          key={panne.id}
          icone={panne.icone}
          couleur={couleurCategorie(couleurs, panne.categorie)}
          titre={panne.titre}
          onPress={() => router.push({ pathname: '/diagnostic/[id]', params: { id: panne.id } })}
        />
      ))}
      {liste.length === 0 ? (
        <Text style={[styles.vide, { color: couleurs.texteDiscret }]}>Aucune panne trouvée.</Text>
      ) : null}
    </FondEcran>
  );
}

const styles = StyleSheet.create({
  recherche: { flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 12, paddingHorizontal: 12 },
  champ: { flex: 1, fontSize: 14, paddingVertical: 11 },
  vide: { fontSize: 14, textAlign: 'center', marginTop: 12 },
});
