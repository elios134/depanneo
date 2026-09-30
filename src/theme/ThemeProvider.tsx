import { StatusBar } from 'expo-status-bar';
import { createContext, useContext, type ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import { useReglages } from '@/fonctionnalites/reglages/ReglagesProvider';
import { resoudreTheme } from './resoudreTheme';
import { COULEURS, type Couleurs, type NomTheme } from './tokens';

interface ContexteTheme {
  nom: NomTheme;
  couleurs: Couleurs;
}

const Contexte = createContext<ContexteTheme | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { reglages } = useReglages();
  const systeme = useColorScheme();
  const nom = resoudreTheme(reglages.theme, systeme);
  return (
    <Contexte.Provider value={{ nom, couleurs: COULEURS[nom] }}>
      <StatusBar style={nom === 'sombre' ? 'light' : 'dark'} />
      {children}
    </Contexte.Provider>
  );
}

export function useTheme(): ContexteTheme {
  const valeur = useContext(Contexte);
  if (!valeur) throw new Error('useTheme doit être utilisé dans ThemeProvider');
  return valeur;
}
