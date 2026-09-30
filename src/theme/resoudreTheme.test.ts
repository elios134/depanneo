import { resoudreTheme } from './resoudreTheme';

describe('resoudreTheme', () => {
  it('respecte un choix explicite', () => {
    expect(resoudreTheme('sombre', 'light')).toBe('sombre');
    expect(resoudreTheme('clair', 'dark')).toBe('clair');
  });
  it('suit le téléphone en mode auto', () => {
    expect(resoudreTheme('auto', 'dark')).toBe('sombre');
    expect(resoudreTheme('auto', 'light')).toBe('clair');
  });
  it('prend le sombre en mode auto si le téléphone ne dit rien', () => {
    expect(resoudreTheme('auto', null)).toBe('sombre');
  });
});
