import { adresseDe, emailDe, horairesDe, siteWebDe, villeDe } from './detailsOsm';

describe('detailsOsm', () => {
  it("formate l'adresse avec numéro, rue, code postal et ville", () => {
    expect(adresseDe({ 'addr:housenumber': '12', 'addr:street': 'rue de la Rose', 'addr:postcode': '13013', 'addr:city': 'Marseille' })).toBe(
      '12 rue de la Rose, 13013 Marseille',
    );
  });

  it('accepte une adresse partielle mais exige une rue', () => {
    expect(adresseDe({ 'addr:street': 'rue de la Rose' })).toBe('rue de la Rose');
    expect(adresseDe({ 'addr:street': 'rue de la Rose', 'addr:city': 'Aix' })).toBe('rue de la Rose, Aix');
    expect(adresseDe({ 'addr:city': 'Marseille', 'addr:postcode': '13013' })).toBeNull();
    expect(adresseDe({})).toBeNull();
  });

  it('ajoute https:// au site et refuse les autres protocoles', () => {
    expect(siteWebDe({ website: 'sodexal.fr' })).toBe('https://sodexal.fr');
    expect(siteWebDe({ 'contact:website': 'http://a.fr/x' })).toBe('http://a.fr/x');
    expect(siteWebDe({ website: 'javascript:alert(1)' })).toBeNull();
    expect(siteWebDe({ website: 'ftp://a.fr' })).toBeNull();
    expect(siteWebDe({ website: '  ' })).toBeNull();
    expect(siteWebDe({ website: '', 'contact:website': 'b.fr' })).toBe('https://b.fr');
  });

  it("lit l'e-mail, les horaires et la ville, null si vide", () => {
    expect(emailDe({ email: ' a@b.fr ' })).toBe('a@b.fr');
    expect(emailDe({ 'contact:email': 'c@d.fr;e@f.fr' })).toBe('c@d.fr');
    expect(emailDe({ email: '' })).toBeNull();
    expect(horairesDe({ opening_hours: 'Mo-Fr 08:00-18:00' })).toBe('Mo-Fr 08:00-18:00');
    expect(horairesDe({})).toBeNull();
    expect(villeDe({ 'addr:city': 'Marseille' })).toBe('Marseille');
    expect(villeDe({ 'addr:city': ' ' })).toBeNull();
  });
});
