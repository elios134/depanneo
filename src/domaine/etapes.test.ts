import { estNomSchema, schemaEtape, texteEtape } from '@/domaine/etapes';

describe('étapes de tuto', () => {
  it('lit le texte d\'une étape simple', () => {
    expect(texteEtape('Coupe l\'eau.')).toBe('Coupe l\'eau.');
  });

  it('lit le texte d\'une étape avec schéma', () => {
    expect(texteEtape({ texte: 'Fais couler l\'eau.', schema: 'siphon' })).toBe('Fais couler l\'eau.');
  });

  it('une étape simple n\'a pas de schéma', () => {
    expect(schemaEtape('Coupe l\'eau.')).toBeUndefined();
  });

  it('donne le schéma d\'une étape avec schéma', () => {
    expect(schemaEtape({ texte: 'Remonte le levier.', schema: 'disjoncteur' })).toBe('disjoncteur');
  });

  it('reconnaît les noms de schémas', () => {
    expect(estNomSchema('siphon')).toBe(true);
    expect(estNomSchema('disjoncteur')).toBe(true);
    expect(estNomSchema('robinet')).toBe(false);
  });
});
