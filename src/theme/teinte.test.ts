import { teinte } from './teinte';

describe('teinte', () => {
  it('convertit une couleur hexadécimale en rgba', () => {
    expect(teinte('#2ee9a5', 0.13)).toBe('rgba(46,233,165,0.13)');
  });
  it('accepte les majuscules', () => {
    expect(teinte('#4FA3FF', 0.5)).toBe('rgba(79,163,255,0.5)');
  });
});
