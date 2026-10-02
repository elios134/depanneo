// Une étape de tuto : un texte, ou un texte accompagné d'un petit schéma animé.
export const NOMS_SCHEMAS = [
  'siphon',
  'disjoncteur',
  'evier-devisser-siphon',
  'evier-nettoyer',
  'evier-ventouse',
  'evier-demonter-siphon',
  'evier-furet',
] as const;

export type NomSchema = (typeof NOMS_SCHEMAS)[number];

/** Schémas décrits comme des données (moteur `src/ui/schemas/dessin.ts`) ; siphon et disjoncteur ont leur propre composant. */
export type NomDessine = Exclude<NomSchema, 'siphon' | 'disjoncteur'>;

export type EtapeTuto = string | { texte: string; schema: NomSchema };

export function estNomSchema(nom: string): nom is NomSchema {
  return (NOMS_SCHEMAS as readonly string[]).includes(nom);
}

export function texteEtape(etape: EtapeTuto): string {
  return typeof etape === 'string' ? etape : etape.texte;
}

export function schemaEtape(etape: EtapeTuto): NomSchema | undefined {
  return typeof etape === 'string' ? undefined : etape.schema;
}
