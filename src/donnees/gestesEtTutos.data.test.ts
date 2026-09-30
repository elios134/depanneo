import { gestesUrgence } from '@/donnees/gestesUrgence';
import { tutos } from '@/donnees/tutos';
import { diagnostics } from '@/donnees/diagnostics';

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

  it('le geste "couper-gaz" affiche le numéro d\'urgence gaz', () => {
    const gaz = gestesUrgence.find((g) => g.id === 'couper-gaz');
    expect(gaz).toBeDefined();
    expect(gaz!.numeroUtile).toBe('0800 47 33 33');
  });
});
