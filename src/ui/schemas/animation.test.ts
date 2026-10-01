import { adoucir, imageDisjoncteur, imageSiphon, interpoler, phaseBoucle } from './animation';

describe('interpoler', () => {
  const cles = [[0, 0], [0.5, 10], [1, 10]] as const;

  it('donne la première valeur avant le début', () => {
    expect(interpoler(-1, cles)).toBe(0);
  });

  it('donne la dernière valeur après la fin', () => {
    expect(interpoler(2, cles)).toBe(10);
  });

  it('interpole en ligne droite entre deux clés', () => {
    expect(interpoler(0.25, cles)).toBeCloseTo(5);
  });

  it('reste sur un palier', () => {
    expect(interpoler(0.75, cles)).toBe(10);
  });

  it('adoucit le mouvement si demandé (lent au début)', () => {
    expect(interpoler(0.1, cles, true)).toBeLessThan(interpoler(0.1, cles));
  });
});

describe('adoucir et phaseBoucle', () => {
  it('adoucir garde les extrémités et le milieu', () => {
    expect(adoucir(0)).toBe(0);
    expect(adoucir(0.5)).toBeCloseTo(0.5);
    expect(adoucir(1)).toBe(1);
  });

  it('phaseBoucle repart à zéro à chaque tour', () => {
    expect(phaseBoucle(0, 4000)).toBe(0);
    expect(phaseBoucle(1000, 4000)).toBeCloseTo(0.25);
    expect(phaseBoucle(4500, 4000)).toBeCloseTo(0.125);
  });
});

describe('imageSiphon', () => {
  it('commence siphon vide (eau en bas)', () => {
    expect(imageSiphon(0, false).decalageEau).toBe(60);
  });

  it('est plein à 70 % du tour', () => {
    expect(imageSiphon(0.7, false).decalageEau).toBeCloseTo(0);
  });

  it('fait tomber deux gouttes décalées d\'un demi-temps', () => {
    const { gouttes } = imageSiphon(0, false);
    expect(gouttes).toHaveLength(2);
    expect(gouttes[0].decalage).toBeCloseTo(0);
    expect(gouttes[1].decalage).toBeCloseTo(30);
  });

  it('efface la goutte en fin de chute', () => {
    // t = 0.225 → 4 × 0.225 = 0.9 : goutte 1 à 90 % de sa chute
    expect(imageSiphon(0.225, false).gouttes[0].opacite).toBeCloseTo(0.5);
  });

  it('immobile : siphon plein, sans goutte', () => {
    expect(imageSiphon(0.3, true)).toEqual({ decalageEau: 0, gouttes: [] });
  });
});

describe('imageDisjoncteur', () => {
  it('commence levier en bas, sans flèche ni coche', () => {
    expect(imageDisjoncteur(0, false)).toEqual({ decalageLevier: 0, opaciteFleche: 0, opaciteCoche: 0 });
  });

  it('montre la flèche pendant la montée', () => {
    expect(imageDisjoncteur(0.45, false).opaciteFleche).toBe(1);
  });

  it('levier en haut et coche visible à 80 %', () => {
    const image = imageDisjoncteur(0.8, false);
    expect(image.decalageLevier).toBe(-32);
    expect(image.opaciteCoche).toBe(1);
    expect(image.opaciteFleche).toBe(0);
  });

  it('immobile : levier en haut et coche visible', () => {
    expect(imageDisjoncteur(0, true)).toEqual({ decalageLevier: -32, opaciteFleche: 0, opaciteCoche: 1 });
  });
});
