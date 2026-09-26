import { gestesUrgence } from '../data/gestesUrgence';
import { tutos } from '../data/tutos';
import { diagnostics } from '../data/diagnostics';

describe('gestes d\'urgence et tutos', () => {
  it('contient les 3 gestes d\'urgence attendus', () => {
    const ids = gestesUrgence.map((g) => g.id).sort();
    expect(ids).toEqual(['couper-courant', 'couper-eau', 'couper-gaz']);
  });

  it('contient les 4 mini-tutos attendus', () => {
    const ids = tutos.map((t) => t.id).sort();
    expect(ids).toEqual(['changer-joint', 'deboucher-evier', 'deboucher-wc', 'reparer-disjoncteur']);
  });

  it('chaque gesteUrgenceId référencé dans les diagnostics existe dans gestesUrgence', () => {
    const idsExistants = new Set(gestesUrgence.map((g) => g.id));
    for (const diag of diagnostics) {
      for (const resultat of Object.values(diag.resultats)) {
        if (resultat.gesteUrgenceId) {
          expect(idsExistants.has(resultat.gesteUrgenceId)).toBe(true);
        }
      }
    }
  });

  it('chaque tutoId référencé dans les diagnostics existe dans tutos', () => {
    const idsExistants = new Set(tutos.map((t) => t.id));
    for (const diag of diagnostics) {
      for (const resultat of Object.values(diag.resultats)) {
        if (resultat.tutoId) {
          expect(idsExistants.has(resultat.tutoId)).toBe(true);
        }
      }
    }
  });
});
