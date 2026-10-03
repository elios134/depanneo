// src/ui/FichePro.tsx
import { useState } from 'react';
import { Alert, Linking, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { formaterDistance } from '@/domaine/distance';
import type { NomIcone } from '@/domaine/icones';
import { formaterHoraires } from '@/domaine/horaires';
import { lienAvis } from '@/domaine/lienAvis';
import { LIBELLES_METIER, type Pro } from '@/domaine/pro';
import { teinte } from '@/theme/teinte';
import { useTheme } from '@/theme/ThemeProvider';
import { appeler } from './appeler';
import { BoutonPrincipal } from './BoutonPrincipal';
import { Icone } from './Icone';
import { Pastille } from './Pastille';
import { Verre } from './Verre';

interface Props {
  pro: Pro | null;
  onFermer: () => void;
}

function ouvrir(url: string) {
  Linking.openURL(url).catch(() => Alert.alert('Ouverture impossible', "Cette adresse ne peut pas s'ouvrir sur ton téléphone."));
}

function Ligne({ icone, texte, lien, libelle }: { icone: NomIcone; texte: string; lien?: string; libelle: string }) {
  const { couleurs } = useTheme();
  const contenu = (
    <>
      <Icone nom={icone} couleur={couleurs.texteDiscret} taille={16} />
      <Text style={[styles.texteLigne, { color: lien ? couleurs.accent : couleurs.texte }]}>{texte}</Text>
    </>
  );
  const style = [styles.ligne, { borderTopColor: couleurs.bordure }];
  if (!lien) return <View style={style}>{contenu}</View>;
  return (
    <Pressable onPress={() => ouvrir(lien)} accessibilityRole="link" accessibilityLabel={libelle} style={style}>
      {contenu}
    </Pressable>
  );
}

export function FichePro({ pro, onFermer }: Props) {
  const { couleurs } = useTheme();
  const { bottom } = useSafeAreaInsets();
  // On garde le dernier pro affiché pendant que la feuille redescend.
  const [dernier, setDernier] = useState<Pro | null>(pro);
  if (pro && pro !== dernier) setDernier(pro);
  const p = pro ?? dernier;
  const siteAffiche = p?.siteWeb?.replace(/^https?:\/\/(www\.)?/i, '').replace(/\/$/, '');
  const aDesInfos = Boolean(p && (p.adresse || p.horaires || p.siteWeb || p.email));

  return (
    <Modal visible={pro !== null} transparent animationType="slide" onRequestClose={onFermer} statusBarTranslucent>
      <View style={styles.fond}>
        <Pressable
          style={[StyleSheet.absoluteFill, { backgroundColor: teinte(couleurs.ombre, 0.55) }]}
          onPress={onFermer}
          accessibilityRole="button"
          accessibilityLabel="Fermer la fiche"
        />
        {p ? (
          <Verre style={[styles.feuille, { paddingBottom: 16 + bottom }]}>
            <View style={[styles.poignee, { backgroundColor: couleurs.bordure }]} />
            <View style={styles.tete}>
              <Pastille
                icone={p.metiers[0] === 'plombier' ? 'wrench' : 'zap'}
                couleur={p.metiers[0] === 'plombier' ? couleurs.plomberie : couleurs.electricite}
                taille={40}
              />
              <View style={styles.titres}>
                <Text style={[styles.nom, { color: couleurs.texte }]}>{p.nom}</Text>
                <Text style={[styles.sousTitre, { color: couleurs.texteDiscret }]}>
                  {[...p.metiers.map((m) => LIBELLES_METIER[m]), formaterDistance(p.distanceKm)].join(' · ')}
                </Text>
              </View>
              <Pressable
                onPress={onFermer}
                accessibilityRole="button"
                accessibilityLabel="Fermer"
                hitSlop={8}
                style={[styles.fermer, { backgroundColor: couleurs.carte }]}
              >
                <Icone nom="x" couleur={couleurs.texteDiscret} taille={16} />
              </Pressable>
            </View>
            {p.adresse ? <Ligne icone="map-pin" texte={p.adresse} libelle="Adresse" /> : null}
            {p.horaires ? <Ligne icone="clock" texte={formaterHoraires(p.horaires)} libelle="Horaires" /> : null}
            {p.siteWeb ? <Ligne icone="globe" texte={siteAffiche ?? p.siteWeb} lien={p.siteWeb} libelle={`Ouvrir le site de ${p.nom}`} /> : null}
            {p.email ? <Ligne icone="mail" texte={p.email} lien={`mailto:${p.email}`} libelle={`Écrire à ${p.nom}`} /> : null}
            {aDesInfos ? null : (
              <Text style={[styles.peu, { color: couleurs.texteDiscret, borderTopColor: couleurs.bordure }]}>
                Peu d&apos;infos disponibles pour ce pro.
              </Text>
            )}
            <View style={styles.boutons}>
              {p.telephone ? <BoutonPrincipal libelle="Appeler" icone="phone" accessibilityLabel={`Appeler ${p.nom}`} onPress={() => appeler(p.telephone!)} /> : null}
              <BoutonPrincipal
                libelle="Voir les avis sur le web"
                icone="search"
                variante="teinte"
                accessibilityLabel={`Voir les avis sur ${p.nom} sur le web`}
                onPress={() => ouvrir(lienAvis(p))}
              />
            </View>
            <Text style={[styles.note, { color: couleurs.texteDiscret }]}>
              Infos OpenStreetMap, parfois incomplètes. Les avis s&apos;ouvrent dans ton navigateur.
            </Text>
          </Verre>
        ) : null}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fond: { flex: 1, justifyContent: 'flex-end' },
  feuille: { borderTopLeftRadius: 24, borderTopRightRadius: 24, borderBottomWidth: 0, paddingHorizontal: 16, paddingTop: 10 },
  poignee: { width: 36, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: 12 },
  tete: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
  titres: { flex: 1, gap: 2 },
  nom: { fontSize: 17, fontWeight: '800' },
  sousTitre: { fontSize: 12.5 },
  fermer: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  ligne: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 11, borderTopWidth: 1 },
  texteLigne: { flex: 1, fontSize: 14 },
  peu: { fontSize: 13.5, paddingVertical: 12, borderTopWidth: 1 },
  boutons: { gap: 10, marginTop: 12 },
  note: { fontSize: 11, textAlign: 'center', marginTop: 12 },
});
