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
  /** `photo` = URI choisie (ou URI déjà affichée si inchangée) ; si elle diffère de la photo déjà enregistrée, elle est copiée dans le dossier de l'appli. Rejette si la copie ou l'écriture échoue (rien n'est alors modifié). */
  enregistrer: (emplacement: Emplacement, info: InfoEmplacement, mimeType?: string | null) => Promise<void>;
  supprimer: (emplacement: Emplacement) => Promise<void>;
}

/** Anciennes données : une URI absolue est ramenée à son nom de fichier. */
function noms(l: Logement): Logement {
  const sortie: Logement = {};
  for (const [cle, info] of Object.entries(l) as [Emplacement, InfoEmplacement][]) {
    sortie[cle] = info.photo ? { ...info, photo: nomFichierPhoto(info.photo) } : info;
  }
  return sortie;
}

const Contexte = createContext<ContexteLogement | null>(null);

const DOSSIER = 'logement';

/** Garde seulement le nom du fichier (les anciennes données contenaient l'URI absolue). */
export function nomFichierPhoto(valeur: string): string {
  return valeur.split(/[\/]/).pop()?.split('?')[0] ?? valeur;
}

/** Reconstruit l'URI d'une photo à partir de son nom, avec le dossier documents actuel de l'appli. */
function uriPhoto(nom: string): string {
  return new File(new Directory(Paths.document, DOSSIER), nomFichierPhoto(nom)).uri;
}

function effacerPhoto(nom: string | undefined) {
  if (!nom) return;
  try {
    const f = new File(uriPhoto(nom));
    if (f.exists) f.delete();
  } catch {
    // Une photo déjà disparue ne doit pas bloquer l'enregistrement.
  }
}

/** Copie la photo dans le dossier de l'appli et renvoie son NOM de fichier (pas l'URI). */
async function copierPhoto(source: string, emplacement: Emplacement, mimeType?: string | null): Promise<string> {
  const dossier = new Directory(Paths.document, DOSSIER);
  dossier.create({ idempotent: true, intermediates: true });
  const copie = new File(dossier, `${emplacement}-${Date.now()}.${extensionPhoto(source, mimeType)}`);
  await new File(source).copy(copie);
  return nomFichierPhoto(copie.uri);
}

/** Logement tel qu'affiché : les noms de fichiers deviennent des URI complètes. */
function versAffichage(l: Logement): Logement {
  const sortie: Logement = {};
  for (const [cle, info] of Object.entries(l) as [Emplacement, InfoEmplacement][]) {
    sortie[cle] = info.photo ? { ...info, photo: uriPhoto(info.photo) } : info;
  }
  return sortie;
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
        courant.current = noms(lireLogement(brut));
        setLogement(courant.current);
      })
      .catch(() => undefined)
      .finally(() => setCharge(true));
  }, []);

  const enregistrer: ContexteLogement['enregistrer'] = async (emplacement, info, mimeType) => {
    const ancienne = courant.current[emplacement]?.photo;
    const note = info.note?.trim().slice(0, NOTE_MAX);
    let photo = info.photo;
    // Une photo inchangée revient de l'écran sous forme d'URI complète : on la compare à celle reconstruite.
    const nouvelle = Boolean(photo) && photo !== (ancienne ? uriPhoto(ancienne) : undefined);
    if (photo && nouvelle) photo = await copierPhoto(photo, emplacement, mimeType);
    else if (photo) photo = nomFichierPhoto(photo);
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

  return <Contexte.Provider value={{ logement: versAffichage(logement), charge, enregistrer, supprimer }}>{children}</Contexte.Provider>;
}

export function useLogement(): ContexteLogement {
  const valeur = useContext(Contexte);
  if (!valeur) throw new Error('useLogement doit être utilisé dans LogementProvider');
  return valeur;
}
