import { Camera, Map, ViewAnnotation, type CameraRef } from '@maplibre/maplibre-react-native';
import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import type { PropsCartePros } from './carteTypes';
import { FondCarte } from './FondCarte';
import { EpinglePro, PointPosition } from './Marqueurs';

const STYLES = {
  sombre: 'https://tiles.openfreemap.org/styles/dark',
  clair: 'https://tiles.openfreemap.org/styles/positron',
} as const;
const FRANCE: [number, number] = [2.4, 46.6];
const ZOOM_PROCHE = 13;
const MAX_EPINGLES = 50;

export function CartePros({ centre, pros, horsLigne, recentrage, interactive = true, onEchecCarte, rechargement = 0, onOuvrirPro }: PropsCartePros) {
  const { nom } = useTheme();
  const camera = useRef<CameraRef>(null);
  const [echec, setEchec] = useState(false);
  const lat = centre?.lat;
  const lon = centre?.lon;
  // Si la position existe dès le premier rendu, la caméra démarre dessus (initialViewState) : pas d'animation.
  const premierRendu = useRef(lat !== undefined && lon !== undefined);

  useEffect(() => {
    if (premierRendu.current) {
      premierRendu.current = false;
      return;
    }
    if (lat === undefined || lon === undefined) return;
    try {
      // flyTo peut renvoyer une promesse selon la version : on évite un rejet non géré.
      const retour: unknown = camera.current?.flyTo({ center: [lon, lat], zoom: ZOOM_PROCHE, duration: 800 });
      if (retour instanceof Promise) retour.catch(() => undefined);
    } catch {
      // Caméra pas prête : la carte reste où elle est.
    }
  }, [lat, lon, recentrage]);

  const changerEchec = (valeur: boolean) => {
    setEchec(valeur);
    onEchecCarte?.(valeur);
  };

  // La carte est remontée (key) : l'échec précédent n'est plus valable.
  useEffect(() => {
    if (rechargement === 0) return;
    setEchec(false);
    onEchecCarte?.(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rechargement]);

  if (horsLigne) return <FondCarte neutre />;

  return (
    <>
      <Map key={rechargement} style={StyleSheet.absoluteFill} mapStyle={STYLES[nom]} attribution={false} logo={false} compass={false}
        dragPan={interactive}
        touchZoom={interactive}
        doubleTapZoom={interactive}
        doubleTapHoldZoom={interactive}
        touchRotate={interactive}
        touchPitch={interactive}
        onDidFailLoadingMap={() => changerEchec(true)}
        onDidFinishLoadingMap={() => changerEchec(false)}
      >
        <Camera
          ref={camera}
          initialViewState={
            lat !== undefined && lon !== undefined
              ? { center: [lon, lat], zoom: ZOOM_PROCHE }
              : { center: FRANCE, zoom: 5 }
          }
        />
        {lat !== undefined && lon !== undefined ? (
          <ViewAnnotation id="moi" lngLat={[lon, lat]}>
            <PointPosition />
          </ViewAnnotation>
        ) : null}
        {pros.slice(0, MAX_EPINGLES).map((pro) => (
          <ViewAnnotation key={pro.id} id={pro.id} lngLat={[pro.lon, pro.lat]} anchor="bottom">
            <Pressable
              onPress={() => onOuvrirPro?.(pro)}
              disabled={!onOuvrirPro}
              accessibilityRole="button"
              accessibilityLabel={`Voir la fiche de ${pro.nom}`}
              hitSlop={8}
            >
              <EpinglePro metier={pro.metiers[0]} />
            </Pressable>
          </ViewAnnotation>
        ))}
      </Map>
      {echec ? <FondCarte neutre /> : null}
    </>
  );
}
