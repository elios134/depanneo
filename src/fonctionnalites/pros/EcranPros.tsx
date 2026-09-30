// src/fonctionnalites/pros/EcranPros.tsx
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { Metier } from '@/domaine/pro';
import { useReglages } from '@/fonctionnalites/reglages/ReglagesProvider';
import { useTheme } from '@/theme/ThemeProvider';
import { BandeauHorsLigne } from '@/ui/BandeauHorsLigne';
import { CartePro } from '@/ui/CartePro';
import { EnTete } from '@/ui/EnTete';
import { FondEcran } from '@/ui/FondEcran';
import { Onglets } from '@/ui/Onglets';
import { CartePros } from './components/CartePros';
import { RechercheVille } from './components/RechercheVille';
import { usePosition } from './hooks/usePosition';
import { usePros } from './hooks/usePros';
import { ageTexte } from './lib/cachePros';
import { filtrerPros } from './lib/filtrerPros';

export function EcranPros() {
  const { couleurs } = useTheme();
  const { reglages, modifier } = useReglages();
  const { position, statut, demanderAutorisation } = usePosition();
  const { pros, etat, date } = usePros(position);
  const [filtre, setFiltre] = useState<Metier | 'tous'>('tous');
  const liste = filtrerPros(pros, filtre);
  const horsLigne = etat === 'hors-ligne';
  const discret = { color: couleurs.texteDiscret };

  return (
    <FondEcran>
      <EnTete titre="Pros près de toi" />
      {horsLigne ? <View style={styles.centre}><BandeauHorsLigne /></View> : null}
      {statut === 'aucune' ? (
        <>
          <Text style={[styles.message, discret]}>Indique ta ville pour trouver les pros autour de toi.</Text>
          <RechercheVille onChoisir={(lieu) => modifier({ villeParDefaut: lieu })} />
          <Text style={[styles.lien, { color: couleurs.accent }]} onPress={demanderAutorisation}>
            Utiliser ma position
          </Text>
        </>
      ) : (
        <>
          <View style={[styles.carte, { borderColor: couleurs.bordure }]}>
            <CartePros centre={position} pros={liste} horsLigne={horsLigne} recentrage={0} />
          </View>
          <Onglets<Metier | 'tous'>
            options={[
              { valeur: 'tous', libelle: 'Tous' },
              { valeur: 'plombier', libelle: 'Plombiers' },
              { valeur: 'electricien', libelle: 'Électriciens' },
            ]}
            valeur={filtre}
            onChange={setFiltre}
          />
          {etat === 'attente' || etat === 'chargement' ? (
            <Text style={[styles.message, discret]}>Recherche des pros autour de toi…</Text>
          ) : null}
          {etat === 'ok' && liste.length === 0 ? (
            <Text style={[styles.message, discret]}>
              Aucun pro trouvé dans un rayon de {reglages.rayonKm} km. Les données d'OpenStreetMap peuvent être incomplètes.
            </Text>
          ) : null}
          {liste.map((pro) => (
            <CartePro key={pro.id} pro={pro} />
          ))}
          {date !== null && liste.length > 0 ? (
            <Text style={[styles.credit, discret]}>Données © OpenStreetMap · mis à jour {ageTexte(date, Date.now())}</Text>
          ) : null}
        </>
      )}
    </FondEcran>
  );
}

const styles = StyleSheet.create({
  centre: { alignItems: 'center' },
  carte: { height: 170, borderRadius: 18, borderWidth: 1, overflow: 'hidden' },
  message: { fontSize: 13.5, textAlign: 'center', lineHeight: 19 },
  lien: { fontSize: 14, textAlign: 'center' },
  credit: { fontSize: 11, textAlign: 'center', marginTop: 4 },
});
