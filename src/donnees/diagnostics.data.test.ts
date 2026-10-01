import type { Diagnostic } from '@/domaine/types';
import { validerDiagnostic, validerRenvois } from '@/domaine/validateDiagnostic';
import { diagnostics } from '@/donnees/diagnostics';
import { gestesUrgence } from '@/donnees/gestesUrgence';

const GRAVITE = { vert: 0, orange: 1, rouge: 2 } as const;

/** Verdict le plus grave qu'on peut atteindre depuis une étape (ou un résultat). */
function graviteMax(diag: Diagnostic, id: string, vus: Set<string> = new Set()): number {
  const resultat = diag.resultats[id];
  if (resultat) return GRAVITE[resultat.verdict];
  const etape = diag.etapes[id];
  if (!etape || vus.has(id)) return 0;
  vus.add(id);
  return Math.max(...etape.reponses.map((r) => graviteMax(diag, r.suite, vus)));
}

// Exception assumée : « Je ne sais pas, il y a de l'eau par terre » exclut une fuite au plafond → orange.
const EXCEPTIONS_PRUDENCE = ['fuite-eau/q1'];

// Les 22 pannes du chantier C (16 plomberie, 6 électricité).
const IDS_ATTENDUS = [
  'disjoncteur-saute', 'evier-bouche', 'fuite-eau', 'pas-eau-chaude', 'plus-de-courant', 'wc-bouche',
  'wc-lent-a-remplir', 'chasse-coule', 'chasse-ne-marche-plus', 'fuite-pied-wc',
  'robinet-dur', 'robinet-goutte', 'pression-faible', 'flexible-douche-fuit', 'bruit-tuyaux',
  'douche-ecoule-mal', 'odeur-egout', 'groupe-securite-goutte',
  'courant-une-piece', 'prise-hs', 'lumiere-hs', 'ampoule-clignote',
];

const tousLesResultats = () =>
  diagnostics.flatMap((d) => Object.entries(d.resultats).map(([id, r]) => ({ diag: d.id, id, r })));

describe('données de diagnostics', () => {
  it('contient exactement les diagnostics de la liste attendue', () => {
    expect(diagnostics.map((d) => d.id).sort()).toEqual([...IDS_ATTENDUS].sort());
  });

  it.each(diagnostics.map((d) => [d.id, d] as const))(
    'le diagnostic "%s" ne contient aucune branche orpheline',
    (_id, diag) => {
      expect(validerDiagnostic(diag)).toEqual([]);
    }
  );

  it('chaque renvoi pointe vers un diagnostic ou un geste existant', () => {
    expect(validerRenvois(diagnostics, gestesUrgence.map((g) => g.id))).toEqual([]);
  });

  it('tout résultat qui renvoie vers le geste "couper-gaz" est rouge avec un numéro utile', () => {
    for (const { r } of tousLesResultats()) {
      if (r.gesteUrgenceId === 'couper-gaz') {
        expect(r.verdict).toBe('rouge');
        expect(Boolean(r.numeroUtile)).toBe(true);
      }
    }
  });

  it('tout résultat qui parle de gaz renvoie vers « Odeur de gaz ? »', () => {
    for (const { diag, id, r } of tousLesResultats()) {
      if (/gaz/i.test(r.conseil)) {
        const cible = r.renvoi?.type === 'urgence' ? r.renvoi.id : r.gesteUrgenceId;
        expect(`${diag}/${id} → ${cible}`).toBe(`${diag}/${id} → couper-gaz`);
      }
    }
  });

  it('un résultat rouge qui renvoie vers « Odeur de gaz ? » donne le numéro d\'urgence gaz', () => {
    for (const { diag, id, r } of tousLesResultats()) {
      if (r.verdict === 'rouge' && r.renvoi?.type === 'urgence' && r.renvoi.id === 'couper-gaz') {
        expect(`${diag}/${id} → ${r.numeroUtile}`).toBe(`${diag}/${id} → 0800 47 33 33`);
      }
    }
  });

  it('chaque réponse « Je ne sais pas » est affichée en pointillé (inconnu)', () => {
    for (const d of diagnostics) {
      for (const [etapeId, etape] of Object.entries(d.etapes)) {
        for (const reponse of etape.reponses) {
          if (reponse.texte.startsWith('Je ne sais pas')) {
            expect(`${d.id}/${etapeId} ${reponse.inconnu}`).toBe(`${d.id}/${etapeId} true`);
          }
        }
      }
    }
  });

  it('« Je ne sais pas » mène au verdict le plus prudent atteignable depuis la question', () => {
    for (const d of diagnostics) {
      for (const [etapeId, etape] of Object.entries(d.etapes)) {
        if (EXCEPTIONS_PRUDENCE.includes(`${d.id}/${etapeId}`)) continue;
        const plusPrudent = graviteMax(d, etapeId);
        for (const reponse of etape.reponses.filter((r) => r.inconnu)) {
          expect(`${d.id}/${etapeId} → ${graviteMax(d, reponse.suite)}`).toBe(`${d.id}/${etapeId} → ${plusPrudent}`);
        }
      }
    }
  });

  it('« Pas d\'eau chaude » demande d\'abord chauffe-eau ou chaudière, et la chaudière renvoie vers le gaz', () => {
    const diag = diagnostics.find((d) => d.id === 'pas-eau-chaude')!;
    expect(diag.etapeInitiale).toBe('q0');
    expect(diag.resultats.resultat_chauffagiste.verdict).toBe('orange');
    expect(diag.resultats.resultat_chauffagiste.renvoi).toEqual({ type: 'urgence', id: 'couper-gaz' });
    expect(diag.resultats.resultat_pro.verdict).toBe('orange');
  });

  it('« Mauvaise odeur d\'égout » pose d\'abord la question du gaz (rouge, numéro, renvoi Urgences)', () => {
    const diag = diagnostics.find((d) => d.id === 'odeur-egout')!;
    expect(diag.etapeInitiale).toBe('q0');
    const gaz = diag.resultats.resultat_gaz;
    expect(gaz.verdict).toBe('rouge');
    expect(gaz.numeroUtile).toBe('0800 47 33 33');
    expect(gaz.renvoi).toEqual({ type: 'urgence', id: 'couper-gaz' });
    expect(gaz.tutoId).toBeUndefined();
  });

  it('compte 16 pannes de plomberie et 6 d\'électricité', () => {
    expect(diagnostics.filter((d) => d.categorie === 'plomberie')).toHaveLength(16);
    expect(diagnostics.filter((d) => d.categorie === 'electricite')).toHaveLength(6);
  });

  it('prise et lumière renvoient vers « Plus de courant dans une seule pièce »', () => {
    for (const id of ['prise-hs', 'lumiere-hs']) {
      const diag = diagnostics.find((d) => d.id === id)!;
      expect(diag.resultats.resultat_piece.renvoi).toEqual({ type: 'diagnostic', id: 'courant-une-piece' });
    }
  });
});
