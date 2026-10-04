import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';

const OPTIONS: ImagePicker.ImagePickerOptions = { mediaTypes: ['images'], quality: 0.7 };

/** Photo facultative : appareil ou galerie. Une permission refusée donne un message, jamais un plantage. */
export function usePhoto(initiale: string | null = null) {
  const [uri, setUri] = useState<string | null>(initiale);
  const [mimeType, setMimeType] = useState<string | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);

  const recevoir = (res: ImagePicker.ImagePickerResult) => {
    if (res.canceled || !res.assets[0]) return;
    setUri(res.assets[0].uri);
    setMimeType(res.assets[0].mimeType ?? null);
  };

  const prendre = async () => {
    setErreur(null);
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        setErreur("L'appareil photo n'est pas autorisé. Tu peux l'activer dans les réglages du téléphone, ou choisir une photo dans la galerie.");
        return;
      }
      recevoir(await ImagePicker.launchCameraAsync(OPTIONS));
    } catch {
      setErreur("Impossible d'ouvrir l'appareil photo.");
    }
  };

  const choisir = async () => {
    setErreur(null);
    try {
      recevoir(await ImagePicker.launchImageLibraryAsync(OPTIONS));
    } catch {
      setErreur("Impossible d'ouvrir la galerie. Vérifie que Dépannéo a le droit d'accéder à tes photos.");
    }
  };

  return { uri, mimeType, erreur, prendre, choisir, retirer: () => setUri(null) };
}
