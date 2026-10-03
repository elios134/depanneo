import { NOMS_SCHEMAS, estNomSchema, schemaEtape, texteEtape, toutesLesEtapes } from '@/domaine/etapes';
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

  it('contient les 10 tutos attendus', () => {
    const ids = tutos.map((t) => t.id).sort();
    expect(ids).toEqual([
      'changer-ampoule', 'changer-flexible-douche', 'changer-joint', 'changer-mecanisme-chasse',
      'deboucher-evier', 'deboucher-wc', 'detartrer-flotteur', 'detartrer-mousseur',
      'remplir-siphon', 'reparer-disjoncteur',
    ]);
  });

  it('chaque étape de tuto a un texte et un schéma connu s\'il y en a un', () => {
    for (const t of tutos) {
      expect(t.etapes.length).toBeGreaterThan(0);
      for (const e of toutesLesEtapes(t)) {
        expect(texteEtape(e).length).toBeGreaterThan(0);
        const schema = schemaEtape(e);
        if (schema !== undefined) expect(estNomSchema(schema)).toBe(true);
      }
    }
  });

  it('chaque schéma dessiné est utilisé par un tuto', () => {
    const utilises = new Set(tutos.flatMap((t) => toutesLesEtapes(t).map(schemaEtape)));
    expect(NOMS_SCHEMAS.filter((n) => !utilises.has(n))).toEqual([]);
  });

  it('« Odeur d\'égout dans la maison » renvoie vers « Odeur de gaz ? »', () => {
    const tuto = tutos.find((t) => t.id === 'remplir-siphon')!;
    expect(tuto.titre).toBe('Odeur d\'égout dans la maison');
    expect(tuto.encadre?.renvoi).toEqual({ type: 'urgence', id: 'couper-gaz' });
  });

  it('« Déboucher des WC » : jamais de ventouse après l\'acide', () => {
    const tuto = tutos.find((t) => t.id === 'deboucher-wc')!;
    expect(tuto.etapes.map(texteEtape).join(' ')).toContain('ventouse');
    expect(tuto.planB?.etapes.map(texteEtape).join(' ')).toContain('sans utiliser la ventouse');
  });

  it('« Remplir un siphon » montre le schéma du siphon', () => {
    const tuto = tutos.find((t) => t.id === 'remplir-siphon')!;
    expect(tuto.etapes.map(schemaEtape)).toContain('siphon');
  });

  it('« Changer une ampoule » commence par la sécurité (pro, disjoncteur, escabeau)', () => {
    const textes = tutos.find((t) => t.id === 'changer-ampoule')!.etapes.map(texteEtape);
    expect(textes[0]).toContain('électricien');
    expect(textes[1]).toContain('disjoncteur');
    expect(textes.join(' ')).toContain('escabeau stable');
  });

  it('« Réarmer un disjoncteur » montre le schéma du disjoncteur', () => {
    const tuto = tutos.find((t) => t.id === 'reparer-disjoncteur')!;
    expect(tuto.etapes.map(schemaEtape)).toContain('disjoncteur');
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

  it('chaque tuto est proposé par au moins un diagnostic', () => {
    const utilises = new Set(
      diagnostics.flatMap((d) => Object.values(d.resultats).map((r) => r.tutoId).filter(Boolean)),
    );
    expect(tutos.map((t) => t.id).filter((id) => !utilises.has(id))).toEqual([]);
  });
});
