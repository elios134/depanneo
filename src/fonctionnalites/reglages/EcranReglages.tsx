// src/fonctionnalites/reglages/EcranReglages.tsx
import { router } from 'expo-router';
import { useState, type ReactNode } from 'react';
import { Platform, StyleSheet, Switch, Text, View } from 'react-native';
import { libelleLieu } from '@/domaine/lieux';
import { RechercheVille } from '@/fonctionnalites/pros/components/RechercheVille';
import { useTheme } from '@/theme/ThemeProvider';
import { CarteListe } from '@/ui/CarteListe';
import { EnTete } from '@/ui/EnTete';
import { FondEcran } from '@/ui/FondEcran';
import { Onglets } from '@/ui/Onglets';
import { useReglages } from './ReglagesProvider';
import type { ModeTheme, RayonKm } from './lib/reglages';

function Bloc({ titre, description, children }: { titre: string; description: string; children: ReactNode }) {
  const { couleurs } = useTheme();
  return (
    <View style={[styles.bloc, { backgroundColor: couleurs.carte, borderColor: couleurs.bordure }]}>
      <Text style={[styles.titre, { color: couleurs.texte }]}>{titre}</Text>
      <Text style={[styles.description, { color: couleurs.texteDiscret }]}>{description}</Text>
      {children}
    </View>
  );
}

export function EcranReglages() {
  const { couleurs } = useTheme();
  const { reglages, modifier } = useReglages();
  const [choixVille, setChoixVille] = useState(false);
  return (
    <FondEcran>
      <EnTete titre="Réglages" />
      <Bloc titre="Thème" description="Apparence de l'appli">
        <Onglets<ModeTheme>
          options={[
            { valeur: 'sombre', libelle: 'Sombre' },
            { valeur: 'clair', libelle: 'Clair' },
            { valeur: 'auto', libelle: 'Auto' },
          ]}
          valeur={reglages.theme}
          onChange={(theme) => modifier({ theme })}
        />
      </Bloc>
      <Bloc titre="Rayon de recherche" description="Distance max des pros">
        <Onglets<RayonKm>
          options={[
            { valeur: 5, libelle: '5 km' },
            { valeur: 10, libelle: '10 km' },
            { valeur: 20, libelle: '20 km' },
          ]}
          valeur={reglages.rayonKm}
          onChange={(rayonKm) => modifier({ rayonKm })}
        />
      </Bloc>
      <View style={[styles.bloc, styles.ligne, { backgroundColor: couleurs.carte, borderColor: couleurs.bordure }]}>
        <View style={styles.flex}>
          <Text style={[styles.titre, { color: couleurs.texte }]}>Localisation</Text>
          <Text style={[styles.description, { color: couleurs.texteDiscret }]}>Utiliser ma position</Text>
        </View>
        <Switch
          value={reglages.localisation}
          onValueChange={(localisation) => modifier({ localisation })}
          trackColor={{ true: couleurs.accent, false: couleurs.bordure }}
          thumbColor={couleurs.surAccent}
          // Sur le web, le pouce coché utilise activeThumbColor (sinon il reste vert par défaut).
          {...(Platform.OS === 'web' ? { activeThumbColor: couleurs.surAccent } : {})}
        />
      </View>
      <CarteListe
        icone="map-pin"
        couleur={couleurs.accent}
        titre="Ville par défaut"
        sousTitre={reglages.villeParDefaut ? libelleLieu(reglages.villeParDefaut) : 'Utilisée si la localisation est désactivée'}
        onPress={() => setChoixVille((ouvert) => !ouvert)}
      />
      {choixVille ? (
        <RechercheVille
          onChoisir={(lieu) => {
            modifier({ villeParDefaut: lieu });
            setChoixVille(false);
          }}
        />
      ) : null}
      <CarteListe
        icone="settings"
        couleur={couleurs.accent}
        titre="À propos et mentions légales"
        sousTitre="Avertissement, crédits, version"
        onPress={() => router.push('/reglages/a-propos')}
      />
    </FondEcran>
  );
}

const styles = StyleSheet.create({
  bloc: { borderWidth: 1, borderRadius: 14, padding: 12, gap: 4 },
  ligne: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  flex: { flex: 1, gap: 2 },
  titre: { fontSize: 15, fontWeight: '600' },
  description: { fontSize: 12.5, marginBottom: 6 },
});
