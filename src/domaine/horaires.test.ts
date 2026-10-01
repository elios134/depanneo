import { formaterHoraires } from './horaires';

describe('formaterHoraires', () => {
  it('met en forme tous les jours', () => {
    expect(formaterHoraires('Mo-Su 10:00-20:00')).toBe('Tous les jours 10h–20h');
  });

  it('gère plusieurs plages et plusieurs règles', () => {
    expect(formaterHoraires('Mo-Fr 08:30-12:00,14:00-18:00; Sa 09:00-12:00')).toBe('Lun–Ven 8h30–12h, 14h–18h · Sam 9h–12h');
  });

  it('gère 24/7, fermé, jours fériés et listes de jours', () => {
    expect(formaterHoraires('24/7')).toBe('24h/24, 7j/7');
    expect(formaterHoraires('Mo-Fr 09:00-18:00; Sa,Su off')).toBe('Lun–Ven 9h–18h · Sam, Dim fermé');
    expect(formaterHoraires('Mo-Sa 09:00-18:00; PH off')).toBe('Lun–Sam 9h–18h · fermé les jours fériés');
    expect(formaterHoraires('off')).toBe('fermé');
  });

  it('renvoie le texte brut si la syntaxe est inconnue', () => {
    expect(formaterHoraires('Apr-Sep Mo-Fr 08:00-18:00')).toBe('Apr-Sep Mo-Fr 08:00-18:00');
    expect(formaterHoraires('sur rendez-vous')).toBe('sur rendez-vous');
    expect(formaterHoraires('Mo-Fr 08:00-18:00 "sauf été"')).toBe('Mo-Fr 08:00-18:00 "sauf été"');
  });
});
