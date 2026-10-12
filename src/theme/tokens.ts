export type NomTheme = 'sombre' | 'clair';

export interface Couleurs {
  fond: string;
  // Lueur bleue discrète derrière l'en-tête (fond de l'appli, maquette 14 option C).
  lueur: string;
  texte: string;
  texteDiscret: string;
  carte: string;
  bordure: string;
  verre: string;
  ombre: string;
  accent: string;
  surAccent: string;
  plomberie: string;
  electricite: string;
  danger: string;
  dangerTexte: string;
  verdictVert: string;
  verdictOrange: string;
  verdictRouge: string;
  carteSol: string;
  carteRoute: string;
  carteRouteGrande: string;
  carteBloc: string;
  carteParc: string;
  carteEau: string;
  schemaPiece: string;
  schemaSale: string;
  schemaTartre: string;
  schemaJoint: string;
  schemaFlexible: string;
  schemaEponge: string;
  schemaChiffon: string;
  schemaVinaigre: string;
  flou: 'dark' | 'light';
}

export const COULEURS: Record<NomTheme, Couleurs> = {
  sombre: {
    fond: '#0b0d12',
    lueur: 'rgba(79,163,255,0.18)',
    texte: 'rgba(255,255,255,0.9)',
    texteDiscret: 'rgba(255,255,255,0.5)',
    carte: 'rgba(255,255,255,0.03)',
    bordure: 'rgba(255,255,255,0.10)',
    verre: 'rgba(18,18,26,0.82)',
    ombre: '#000000',
    accent: '#4FA3FF',
    surAccent: '#ffffff',
    plomberie: '#2ee9a5',
    electricite: '#f5a623',
    danger: '#ef4444',
    dangerTexte: '#fca5a5',
    verdictVert: '#2ee9a5',
    verdictOrange: '#f5a623',
    verdictRouge: '#ef4444',
    carteSol: '#11141c',
    carteRoute: '#1c2230',
    carteRouteGrande: '#252c3d',
    carteBloc: '#151a25',
    carteParc: '#12251d',
    carteEau: '#10213a',
    schemaPiece: 'rgba(255,255,255,0.2)',
    schemaSale: '#9b7653',
    schemaTartre: '#ece6cc',
    schemaJoint: '#d9c7a0',
    schemaFlexible: '#c9ced8',
    schemaEponge: '#f5d76e',
    schemaChiffon: '#7d8fae',
    schemaVinaigre: '#f3e9b0',
    flou: 'dark',
  },
  clair: {
    fond: '#f5f7fb',
    lueur: 'rgba(79,163,255,0.16)',
    texte: '#0f172a',
    texteDiscret: 'rgba(15,23,42,0.5)',
    carte: '#ffffff',
    bordure: 'rgba(15,23,42,0.08)',
    verre: 'rgba(255,255,255,0.88)',
    ombre: '#0f172a',
    accent: '#4FA3FF',
    surAccent: '#ffffff',
    plomberie: '#10b981',
    electricite: '#d97706',
    danger: '#dc2626',
    dangerTexte: '#dc2626',
    verdictVert: '#2ee9a5',
    verdictOrange: '#f5a623',
    verdictRouge: '#ef4444',
    carteSol: '#e8edf3',
    carteRoute: '#ffffff',
    carteRouteGrande: '#ffffff',
    carteBloc: '#dde3ea',
    carteParc: '#d3ead9',
    carteEau: '#cfe0f5',
    schemaPiece: 'rgba(15,23,42,0.12)',
    schemaSale: '#8a6440',
    schemaTartre: '#c9bf98',
    schemaJoint: '#b89f6a',
    schemaFlexible: '#8b93a3',
    schemaEponge: '#e0b93a',
    schemaChiffon: '#6b7d9c',
    schemaVinaigre: '#e6d68a',
    flou: 'light',
  },
};
