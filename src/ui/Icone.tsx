import {
  AudioWaveform, Bath, BookOpen, ChevronLeft, ChevronRight, CircleX, Cylinder, DoorOpen, Droplet,
  DropletOff, Droplets, Flame, Gauge, HardHat, Heater, Hourglass, House, Lightbulb, LightbulbOff,
  LocateFixed, MapPin, Phone, Plug, Power, RotateCcw, RotateCw, Search, Settings, ShieldAlert,
  ShowerHead, Siren, Stethoscope, Toilet, ToggleLeft, TriangleAlert, Waves, Wind, Wrench, X, Zap,
  ZapOff, type LucideIcon,
} from 'lucide-react-native';
import type { NomIcone } from '@/domaine/icones';

const COMPOSANTS: Record<NomIcone, LucideIcon> = {
  droplets: Droplets, toilet: Toilet, waves: Waves, heater: Heater, hourglass: Hourglass,
  'rotate-cw': RotateCw, 'circle-x': CircleX, wrench: Wrench, droplet: Droplet, gauge: Gauge,
  'shower-head': ShowerHead, wind: Wind, cylinder: Cylinder, 'droplet-off': DropletOff, bath: Bath,
  'audio-waveform': AudioWaveform, 'toggle-left': ToggleLeft, 'zap-off': ZapOff, 'door-open': DoorOpen,
  plug: Plug, 'lightbulb-off': LightbulbOff, lightbulb: Lightbulb, house: House,
  'triangle-alert': TriangleAlert, 'book-open': BookOpen, 'map-pin': MapPin, settings: Settings,
  stethoscope: Stethoscope, phone: Phone, 'locate-fixed': LocateFixed, search: Search,
  'rotate-ccw': RotateCcw, 'shield-alert': ShieldAlert, 'hard-hat': HardHat, flame: Flame,
  power: Power, siren: Siren, 'chevron-right': ChevronRight, 'chevron-left': ChevronLeft, x: X, zap: Zap,
};

interface Props {
  nom: NomIcone;
  couleur: string;
  taille?: number;
  epaisseur?: number;
}

export function Icone({ nom, couleur, taille = 20, epaisseur = 2 }: Props) {
  const Composant = COMPOSANTS[nom];
  return <Composant color={couleur} size={taille} strokeWidth={epaisseur} />;
}
