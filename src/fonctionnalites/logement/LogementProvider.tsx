import AsyncStorage from '@react-native-async-storage/async-storage';
import { Directory, File, Paths } from 'expo-file-system';
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import {
  CLE_LOGEMENT, ecrireLogement, extensionPhoto, lireLogement, NOTE_MAX, type Emplacement, type InfoEmplacement,
  type Logement,
} from './lib/logement';

interface ContexteLogement {
  logement: Logement;
  charge: boolean;
  /** `photo` = URI choisie ; si elle diffère de la photo déjà enregistrée, elle est copiée dans le dossier de l'appli. */
  enregistrer: (emplacement: Emplacement, info: InfoEmplacement, mimeType?: string | null) => Promise<void>;
  supprimer: (emplacement: Emplacement) => Promise<void>;
}

const Contexte = createContext<ContexteLogement | null>(null);

function effacerPhoto(uri: string | undefined) {
  if (!uri) return;
  try {
    const f = new File(uri);
    if (f.exists) f.delete();
  } catch {
    // Une photo déjà disparue ne doit pas bloquer l'enregistrement.
  }
}

function copierPhoto(source: string, emplacement: Emplacement, mimeType?: string | null): string {
  const dossier = new Directory(Paths.document, 'logement');
  dossier.create({ idempotent: true, intermediates: true });
  const copie = new File(dossier, `${emplacement}-${Date.now()}.${extensionPhoto(source, mimeType)}`);
  new File(source).copy(copie);
  return copie.uri;
}

export function LogementProvider({ children }: { children: ReactNode }) {
  const [logement, setLogement] = useState<Logement>({});
  const [charge, setCharge] = useState(false);
  const courant = useRef<Logement>({});

  const appliquer = async (suivant: Logement) => {
    courant.current = suivant;
    setLogement(suivant);
    await AsyncStorage.setItem(CLE_LOGEMENT, ecrireLogement(suivant));
  };

  useEffect(() => {
    AsyncStorage.getItem(CLE_LOGEMENT)
      .then((brut) => {
        courant.current = lireLogement(brut);
        setLogement(courant.current);
      })
      .catch(() => undefined)
      .finally(() => setCharge(true));
  }, []);

  const enregistrer: ContexteLogement['enregistrer'] = async (emplacement, info, mimeType) => {
    const ancienne = courant.current[emplacement]?.photo;
    const note = info.note?.trim().slice(0, NOTE_MAX);
    let photo = info.photo;
    if (photo && photo !== ancienne) photo = copierPhoto(photo, emplacement, mimeType);
    if (ancienne && ancienne !== photo) effacerPhoto(ancienne);
    const suivant = { ...courant.current };
    if (photo || note) suivant[emplacement] = { ...(photo ? { photo } : {}), ...(note ? { note } : {}) };
    else delete suivant[emplacement];
    await appliquer(suivant);
  };

  const supprimer = async (emplacement: Emplacement) => {
    effacerPhoto(courant.current[emplacement]?.photo);
    const suivant = { ...courant.current };
    delete suivant[emplacement];
    await appliquer(suivant);
  };

  return <Contexte.Provider value={{ logement, charge, enregistrer, supprimer }}>{children}</Contexte.Provider>;
}

export function useLogement(): ContexteLogement {
  const valeur = useContext(Contexte);
  if (!valeur) throw new Error('useLogement doit être utilisé dans LogementProvider');
  return valeur;
}
