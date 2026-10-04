import { ordreActions } from './ordreActions';

describe('ordreActions', () => {
  it.each(['orange', 'rouge'] as const)('%s : rien ne précède le geste et le numéro sauf le renvoi, « Qui paie ? » vient après', (v) => {
    const o = ordreActions(v);
    const iQui = o.indexOf('quiPaie');
    expect(iQui).toBeGreaterThan(o.indexOf('geste'));
    expect(iQui).toBeGreaterThan(o.indexOf('numero'));
    expect(o.slice(0, o.indexOf('numero')).filter((a) => a !== 'renvoi' && a !== 'pros' && a !== 'geste')).toEqual([]);
    expect(o[0]).toBe('renvoi');
  });

  it('orange : renvoi, geste, numéro, puis le reste', () => {
    expect(ordreActions('orange').slice(0, 4)).toEqual(['renvoi', 'geste', 'numero', 'quiPaie']);
  });

  it('vert : « Qui paie ? » reste sous le conseil, juste après le renvoi', () => {
    expect(ordreActions('vert').slice(0, 2)).toEqual(['renvoi', 'quiPaie']);
  });

  it('chaque verdict contient les actions une seule fois', () => {
    for (const v of ['vert', 'orange', 'rouge'] as const) {
      const o = ordreActions(v);
      expect(new Set(o).size).toBe(o.length);
    }
  });
});
