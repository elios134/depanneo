import {
  ecrireLogement, emplacementDuGeste, estRenseigne, extensionPhoto, lireLogement, NOTE_MAX, resumeLogement,
} from './logement';

describe('lireLogement', () => {
  it('rend un logement vide si rien ou JSON cassé', () => {
    expect(lireLogement(null)).toEqual({});
    expect(lireLogement('{pas du json')).toEqual({});
    expect(lireLogement('[1,2]')).toEqual({});
  });
  it('ignore les emplacements inconnus et les entrées vides', () => {
    const brut = JSON.stringify({ cave: { note: 'x' }, tableau: { note: 'Placard' }, 'robinet-gaz': { note: '  ' } });
    expect(lireLogement(brut)).toEqual({ tableau: { note: 'Placard' } });
  });
  it('tronque la note à 120 caractères', () => {
    const brut = JSON.stringify({ tableau: { note: 'a'.repeat(300) } });
    expect(lireLogement(brut).tableau?.note).toHaveLength(NOTE_MAX);
  });
  it('relit ce qui a été écrit', () => {
    const l = { 'robinet-eau': { photo: 'file:///a.jpg', note: 'Sous évier' } };
    expect(lireLogement(ecrireLogement(l))).toEqual(l);
  });
});

describe('estRenseigne', () => {
  it('vrai si photo ou note non vide', () => {
    expect(estRenseigne(undefined)).toBe(false);
    expect(estRenseigne({})).toBe(false);
    expect(estRenseigne({ note: '  ' })).toBe(false);
    expect(estRenseigne({ note: 'ok' })).toBe(true);
    expect(estRenseigne({ photo: 'file:///a.jpg' })).toBe(true);
  });
});

describe('resumeLogement', () => {
  it('accorde le texte', () => {
    expect(resumeLogement({})).toBe('Aucun emplacement enregistré');
    expect(resumeLogement({ tableau: { note: 'a' } })).toBe('1 emplacement sur 4 enregistré');
    expect(resumeLogement({ tableau: { note: 'a' }, 'robinet-eau': { note: 'b' } })).toBe('2 emplacements sur 4 enregistrés');
    expect(
      resumeLogement({
        tableau: { note: 'a' }, 'robinet-eau': { note: 'b' }, 'robinet-gaz': { note: 'c' }, 'chauffe-eau': { note: 'd' },
      }),
    ).toBe('4 emplacements sur 4 enregistrés');
  });
});

describe('emplacementDuGeste', () => {
  it('relie les gestes aux emplacements', () => {
    expect(emplacementDuGeste('couper-eau')).toBe('robinet-eau');
    expect(emplacementDuGeste('couper-courant')).toBe('tableau');
    expect(emplacementDuGeste('couper-gaz')).toBe('robinet-gaz');
    expect(emplacementDuGeste('autre')).toBeNull();
  });
});

describe('extensionPhoto', () => {
  it('prend l’extension de l’URI, sinon le type MIME', () => {
    expect(extensionPhoto('file:///x/IMG.JPG')).toBe('jpg');
    expect(extensionPhoto('content://media/42', 'image/png')).toBe('png');
    expect(extensionPhoto('content://media/42', 'image/jpeg')).toBe('jpg');
    expect(extensionPhoto('content://media/42')).toBe('jpg');
  });
});
