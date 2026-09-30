import { Camera, Map, ViewAnnotation, type CameraRef } from '@maplibre/maplibre-react-native';
import { useEffect, useRef } from 'react';
import { StyleSheet } from 'react-native';
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

export function CartePros({ centre, pros, horsLigne, recentrage, interactive = true }: PropsCartePros) {
  const { nom } = useTheme();
  const camera = useRef<CameraRef>(null);
  const lat = centre?.lat;
  const lon = centre?.lon;

  useEffect(() => {
    if (lat === undefined || lon === undefined) return;
    camera.current?.flyTo({ center: [lon, lat], zoom: ZOOM_PROCHE, duration: 800 });
  }, [lat, lon, recentrage]);

  if (horsLigne) return <FondCarte neutre />;

  return (
    <Map style={StyleSheet.absoluteFill} mapStyle={STYLES[nom]} attribution={false} logo={false} compass={false}
      dragPan={interactive}
      touchZoom={interactive}
      doubleTapZoom={interactive}
      doubleTapHoldZoom={interactive}
      touchRotate={interactive}
      touchPitch={interactive}
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
      {pros.map((pro) => (
        <ViewAnnotation key={pro.id} id={pro.id} lngLat={[pro.lon, pro.lat]} anchor="bottom">
          <EpinglePro metier={pro.metiers[0]} />
        </ViewAnnotation>
      ))}
    </Map>
  );
}
