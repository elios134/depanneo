import { NOMS_SCHEMAS } from '@/domaine/etapes';
import { validerDessin } from '../dessin';
import { DESSINS } from './index';

describe('dessins des tutos', () => {
  const noms = NOMS_SCHEMAS.filter((n) => n !== 'siphon' && n !== 'disjoncteur');

  it('chaque nom de schéma a son dessin, et rien de plus', () => {
    expect(Object.keys(DESSINS).sort()).toEqual([...noms].sort());
  });

  it.each(noms)('%s est valide', (nom) => {
    expect(validerDessin(DESSINS[nom])).toEqual([]);
  });

  it.each(noms)('%s a une description lisible', (nom) => {
    expect(DESSINS[nom].description).toMatch(/^Schéma : .+\.$/);
  });
});
