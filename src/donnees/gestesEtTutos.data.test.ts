import { estNomIcone } from '@/domaine/icones';
import { CATEGORIES } from '@/domaine/types';
import { gestesUrgence } from '@/donnees/gestesUrgence';
import { tutos } from '@/donnees/tutos';
import { numerosUtiles } from './numerosUtiles';
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

  it('chaque geste et chaque tuto a une icône connue', () => {
    for (const g of gestesUrgence) expect(estNomIcone(g.icone)).toBe(true);
    for (const t of tutos) expect(estNomIcone(t.icone)).toBe(true);
  });

  it('chaque tuto a une catégorie, une durée et un outil', () => {
    for (const t of tutos) {
      expect(CATEGORIES).toContain(t.categorie);
      expect(t.duree.length).toBeGreaterThan(0);
      expect(t.outil.length).toBeGreaterThan(0);
    }
  });

  it('le geste gaz s\'appelle « Odeur de gaz ? »', () => {
    expect(gestesUrgence.find((g) => g.id === 'couper-gaz')!.titre).toBe('Odeur de gaz ?');
  });

  it('liste les numéros utiles gaz et 112', () => {
    expect(numerosUtiles.map((n) => n.numero)).toEqual(['0800 47 33 33', '112']);
  });
});
