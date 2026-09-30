// src/fonctionnalites/urgences/EcranUrgences.tsx
import { router } from 'expo-router';
import { StyleSheet, Text } from 'react-native';
import type { GesteUrgence } from '@/domaine/types';
import { gestesUrgence } from '@/donnees/gestesUrgence';
import { numerosUtiles } from '@/donnees/numerosUtiles';
import type { Couleurs } from '@/theme/tokens';
import { useTheme } from '@/theme/ThemeProvider';
import { appeler } from '@/ui/appeler';
import { CarteListe } from '@/ui/CarteListe';
import { EnTete } from '@/ui/EnTete';
import { FondEcran } from '@/ui/FondEcran';

function couleurGeste(c: Couleurs, id: string): string {
  if (id === 'couper-gaz') return c.danger;
  if (id === 'couper-courant') return c.electricite;
  return c.accent;
}

function sousTitreGeste(geste: GesteUrgence): string {
  return geste.numeroUtile ? `Sors et appelle le ${geste.numeroUtile}` : `${geste.etapes.length} étapes`;
}

export function EcranUrgences() {
  const { couleurs } = useTheme();
  return (
    <FondEcran>
      <EnTete titre="Urgences" sousTitre="Les bons gestes en attendant le pro." />
      {gestesUrgence.map((geste) => (
        <CarteListe
          key={geste.id}
          grande
          icone={geste.icone}
          couleur={couleurGeste(couleurs, geste.id)}
          titre={geste.titre}
          sousTitre={sousTitreGeste(geste)}
          danger={geste.id === 'couper-gaz'}
          onPress={() => router.push({ pathname: '/urgences/[id]', params: { id: geste.id } })}
        />
      ))}
      <Text style={[styles.section, { color: couleurs.texteDiscret }]}>Numéros utiles</Text>
      {numerosUtiles.map((n) => (
        <CarteListe
          key={n.numero}
          icone={n.numero === '112' ? 'siren' : 'phone'}
          couleur={couleurs.danger}
          titre={n.libelle}
          sousTitre={n.detail ? `${n.numero} · ${n.detail}` : n.numero}
          onPress={() => appeler(n.numero)}
        />
      ))}
    </FondEcran>
  );
}

const styles = StyleSheet.create({
  section: { fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.6, marginTop: 8 },
});
