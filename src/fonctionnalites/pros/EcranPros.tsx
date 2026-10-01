// src/fonctionnalites/pros/EcranPros.tsx
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
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
import { useCarteEchec } from './hooks/useCarteEchec';
import { usePosition } from './hooks/usePosition';
import { usePros } from './hooks/usePros';
import { ageTexte } from './lib/cachePros';
import { filtrerPros } from './lib/filtrerPros';

export function EcranPros() {
  const { couleurs } = useTheme();
  const { reglages, modifier } = useReglages();
  const { position, statut, demanderAutorisation } = usePosition({ passif: true });
  const { pros, etat, date, actualisation, reessayer } = usePros(position);
  const { carteEchec, setCarteEchec, rechargement, relancerCarte } = useCarteEchec();
  const [filtre, setFiltre] = useState<Metier | 'tous'>('tous');
  const liste = filtrerPros(pros, filtre);
  const horsLigne = etat === 'hors-ligne';
  // Le fond de carte n'existe pas dans l'état « aucune » : son échec précédent est ignoré.
  const sansReseau = horsLigne || (carteEchec && statut !== 'aucune');
  const discret = { color: couleurs.texteDiscret };

  return (
    <FondEcran>
      <EnTete titre="Pros près de toi" />
      {sansReseau ? <View style={styles.centre}><BandeauHorsLigne /></View> : null}
      {statut === 'aucune' ? (
        <>
          <Text style={[styles.message, discret]}>Indique ta ville pour trouver les pros autour de toi.</Text>
          <RechercheVille onChoisir={(lieu) => modifier({ villeParDefaut: lieu })} />
          <Pressable accessibilityRole="button" hitSlop={8} onPress={demanderAutorisation} style={styles.lienZone}>
            <Text style={[styles.lien, { color: couleurs.accent }]}>Utiliser ma position</Text>
          </Pressable>
        </>
      ) : (
        <>
          <View style={[styles.carte, { borderColor: couleurs.bordure }]}>
            <CartePros centre={position} pros={liste} horsLigne={horsLigne} recentrage={0} interactive={false} onEchecCarte={setCarteEchec} rechargement={rechargement} />
          </View>
          {sansReseau ? null : (
            <Text style={[styles.creditCarte, discret]}>© OpenFreeMap · OpenMapTiles · OpenStreetMap</Text>
          )}
          <Onglets<Metier | 'tous'>
            options={[
              { valeur: 'tous', libelle: 'Tous' },
              { valeur: 'plombier', libelle: 'Plombiers' },
              { valeur: 'electricien', libelle: 'Électriciens' },
            ]}
            valeur={filtre}
            onChange={setFiltre}
          />
          {etat === 'attente' || etat === 'chargement' || actualisation ? (
            <Text style={[styles.message, discret]}>Recherche des pros autour de toi…</Text>
          ) : null}
          {etat === 'ok' && pros.length === 0 ? (
            <Text style={[styles.message, discret]}>
              Aucun pro trouvé dans un rayon de {reglages.rayonKm} km. Les données d'OpenStreetMap peuvent être incomplètes.
            </Text>
          ) : null}
          {(etat === 'ok' || horsLigne) && pros.length > 0 && liste.length === 0 ? (
            <Text style={[styles.message, discret]}>
              Aucun {filtre === 'plombier' ? 'plombier' : 'électricien'} dans la liste. Essaie « Tous ».
            </Text>
          ) : null}
          {horsLigne && pros.length === 0 ? (
            <Text style={[styles.message, discret]}>Pas de liste enregistrée. Reconnecte-toi pour trouver les pros autour de toi.</Text>
          ) : null}
          {liste.map((pro) => (
            <CartePro key={pro.id} pro={pro} />
          ))}
          {date !== null && liste.length > 0 ? (
            <Text style={[styles.credit, discret]}>Données © OpenStreetMap · mis à jour {ageTexte(date, Date.now())}</Text>
          ) : null}
          {sansReseau ? (
            <Pressable
              accessibilityRole="button"
              hitSlop={8}
              onPress={() => {
                reessayer();
                relancerCarte();
              }} style={styles.lienZone}>
              <Text style={[styles.lien, { color: couleurs.accent }]}>Réessayer</Text>
            </Pressable>
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
  lienZone: { paddingVertical: 8, alignItems: 'center' },
  creditCarte: { fontSize: 10.5, textAlign: 'left' },
  credit: { fontSize: 11, textAlign: 'center', marginTop: 4 },
});
