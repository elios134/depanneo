// Version web : MapLibre n'existe qu'en natif, on garde le fond de carte factice.
import type { PropsCartePros } from './carteTypes';
import { FondCarte } from './FondCarte';

export function CartePros({ centre, horsLigne }: PropsCartePros) {
  return <FondCarte neutre={horsLigne} avecPoint={centre !== null} />;
}
