export const NOMS_ICONES = [
  'droplets', 'toilet', 'waves', 'heater', 'hourglass', 'rotate-cw', 'circle-x', 'wrench',
  'droplet', 'gauge', 'shower-head', 'wind', 'cylinder', 'droplet-off', 'bath', 'audio-waveform',
  'toggle-left', 'zap-off', 'door-open', 'plug', 'lightbulb-off', 'lightbulb',
  'house', 'triangle-alert', 'book-open', 'map-pin', 'settings', 'stethoscope', 'phone',
  'locate-fixed', 'search', 'rotate-ccw', 'shield-alert', 'hard-hat', 'flame', 'power', 'siren',
  'chevron-right', 'chevron-left', 'chevron-up', 'x', 'zap', 'clock', 'globe', 'mail', 'info', 'euro', 'share',
] as const;

export type NomIcone = (typeof NOMS_ICONES)[number];

export function estNomIcone(nom: string): nom is NomIcone {
  return (NOMS_ICONES as readonly string[]).includes(nom);
}
