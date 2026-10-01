import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { CLE_REGLAGES, ecrireReglages, lireReglages, REGLAGES_DEFAUT, type Reglages } from './lib/reglages';

interface ContexteReglages {
  reglages: Reglages;
  modifier: (partiel: Partial<Reglages>) => void;
  charge: boolean;
}

const Contexte = createContext<ContexteReglages | null>(null);

export function ReglagesProvider({ children }: { children: ReactNode }) {
  const [reglages, setReglages] = useState<Reglages>(REGLAGES_DEFAUT);
  const [charge, setCharge] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(CLE_REGLAGES)
      .then((brut) => setReglages(lireReglages(brut)))
      .catch(() => setReglages(REGLAGES_DEFAUT))
      .finally(() => setCharge(true));
  }, []);

  const modifier = (partiel: Partial<Reglages>) => {
    setReglages((actuels) => {
      const nouveaux = { ...actuels, ...partiel };
      AsyncStorage.setItem(CLE_REGLAGES, ecrireReglages(nouveaux)).catch(() => undefined);
      return nouveaux;
    });
  };

  return <Contexte.Provider value={{ reglages, modifier, charge }}>{children}</Contexte.Provider>;
}

export function useReglages(): ContexteReglages {
  const valeur = useContext(Contexte);
  if (!valeur) throw new Error('useReglages doit être utilisé dans ReglagesProvider');
  return valeur;
}
