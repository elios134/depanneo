import { Platform } from 'react-native';

/** Police des libellés des schémas : sans empattement sur le web ; sur mobile, la police par défaut l'est déjà. */
export const POLICE_SCHEMA = Platform.select({ web: 'system-ui, sans-serif' });
