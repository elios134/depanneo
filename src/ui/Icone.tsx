import {
  AudioWaveform, Bath, BookOpen, ChevronLeft, ChevronRight, ChevronUp, CircleX, Clock, Cylinder, DoorOpen, Droplet,
  DropletOff, Droplets, Euro, Flame, Gauge, Globe, HardHat, Heater, Hourglass, House, Info, Lightbulb, LightbulbOff,
  LocateFixed, Mail, MapPin, Phone, Plug, Power, RotateCcw, RotateCw, Search, Settings, Share2, ShieldAlert,
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
  power: Power, clock: Clock, globe: Globe, mail: Mail, info: Info, siren: Siren, 'chevron-right': ChevronRight, 'chevron-left': ChevronLeft, 'chevron-up': ChevronUp, x: X, zap: Zap, euro: Euro, share: Share2,
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
