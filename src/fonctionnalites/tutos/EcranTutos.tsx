// src/fonctionnalites/tutos/EcranTutos.tsx
import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import type { Categorie } from '@/domaine/types';
import { tutos } from '@/donnees/tutos';
import { couleurCategorie } from '@/theme/couleurCategorie';
import { useTheme } from '@/theme/ThemeProvider';
import { CarteListe } from '@/ui/CarteListe';
import { EnTete } from '@/ui/EnTete';
import { FondEcran } from '@/ui/FondEcran';
import { Onglets } from '@/ui/Onglets';

export function EcranTutos() {
  const { couleurs } = useTheme();
  const [categorie, setCategorie] = useState<Categorie>('plomberie');
  const liste = tutos.filter((t) => t.categorie === categorie);
  return (
    <FondEcran>
      <EnTete titre="Tutos" sousTitre="Réparations simples, pas à pas." />
      <Onglets
        options={[
          { valeur: 'plomberie', libelle: 'Plomberie' },
          { valeur: 'electricite', libelle: 'Électricité' },
        ]}
        valeur={categorie}
        onChange={setCategorie}
      />
      {liste.map((tuto) => (
        <CarteListe
          key={tuto.id}
          icone={tuto.icone}
          couleur={couleurCategorie(couleurs, tuto.categorie)}
          titre={tuto.titre}
          sousTitre={`${tuto.duree} · ${tuto.outil}`}
          onPress={() => router.push({ pathname: '/tutos/[id]', params: { id: tuto.id } })}
        />
      ))}
      {liste.length === 0 ? (
        <Text style={[styles.vide, { color: couleurs.texteDiscret }]}>Aucun tuto pour l&apos;instant.</Text>
      ) : null}
    </FondEcran>
  );
}

const styles = StyleSheet.create({
  vide: { fontSize: 14, textAlign: 'center', marginTop: 12 },
});
