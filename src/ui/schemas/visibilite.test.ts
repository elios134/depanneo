import { estVisible } from './visibilite';

describe('estVisible', () => {
  it('visible quand le schéma est dans la vue', () => {
    expect(estVisible(100, 200, 0, 800)).toBe(true);
  });
  it('visible quand il dépasse en partie', () => {
    expect(estVisible(750, 900, 0, 800)).toBe(true);
    expect(estVisible(-50, 20, 0, 800)).toBe(true);
  });
  it('caché quand il est entièrement au-dessus ou au-dessous', () => {
    expect(estVisible(900, 1000, 0, 800)).toBe(false);
    expect(estVisible(-200, -10, 0, 800)).toBe(false);
  });
  it('un bord qui touche juste la vue ne compte pas', () => {
    expect(estVisible(800, 900, 0, 800)).toBe(false);
  });
});
