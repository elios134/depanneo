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
  /** `photo` = URI choisie ; si elle diffère de la photo déjà enregistrée, elle est copiée dans le dossier de l'appli. Rejette si la copie ou l'écriture échoue (rien n'est alors modifié). */
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

async function copierPhoto(source: string, emplacement: Emplacement, mimeType?: string | null): Promise<string> {
  const dossier = new Directory(Paths.document, 'logement');
  dossier.create({ idempotent: true, intermediates: true });
  const copie = new File(dossier, `${emplacement}-${Date.now()}.${extensionPhoto(source, mimeType)}`);
  await new File(source).copy(copie);
  return copie.uri;
}

export function LogementProvider({ children }: { children: ReactNode }) {
  const [logement, setLogement] = useState<Logement>({});
  const [charge, setCharge] = useState(false);
  const courant = useRef<Logement>({});

  // Écrit d'abord sur le disque : si l'écriture échoue, ni l'état ni les fichiers ne changent.
  const appliquer = async (suivant: Logement) => {
    await AsyncStorage.setItem(CLE_LOGEMENT, ecrireLogement(suivant));
    courant.current = suivant;
    setLogement(suivant);
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
    const nouvelle = Boolean(photo) && photo !== ancienne;
    if (photo && nouvelle) photo = await copierPhoto(photo, emplacement, mimeType);
    const suivant = { ...courant.current };
    if (photo || note) suivant[emplacement] = { ...(photo ? { photo } : {}), ...(note ? { note } : {}) };
    else delete suivant[emplacement];
    try {
      await appliquer(suivant);
    } catch (e) {
      if (nouvelle) effacerPhoto(photo);
      throw e;
    }
    if (ancienne && ancienne !== photo) effacerPhoto(ancienne);
  };

  const supprimer = async (emplacement: Emplacement) => {
    const ancienne = courant.current[emplacement]?.photo;
    const suivant = { ...courant.current };
    delete suivant[emplacement];
    await appliquer(suivant);
    effacerPhoto(ancienne);
  };

  return <Contexte.Provider value={{ logement, charge, enregistrer, supprimer }}>{children}</Contexte.Provider>;
}

export function useLogement(): ContexteLogement {
  const valeur = useContext(Contexte);
  if (!valeur) throw new Error('useLogement doit être utilisé dans LogementProvider');
  return valeur;
}
