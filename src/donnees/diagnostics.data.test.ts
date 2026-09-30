import { validerDiagnostic } from '@/domaine/validateDiagnostic';
import { diagnostics } from '@/donnees/diagnostics';

describe('données de diagnostics', () => {
  it('contient les 6 diagnostics conservés, sans gaz ni chaudière', () => {
    expect(diagnostics.map((d) => d.id).sort()).toEqual([
      'disjoncteur-saute', 'evier-bouche', 'fuite-eau', 'pas-eau-chaude', 'plus-de-courant', 'wc-bouche',
    ]);
  });

  it.each(diagnostics.map((d) => [d.id, d] as const))(
    'le diagnostic "%s" ne contient aucune branche orpheline',
    (_id, diag) => {
      expect(validerDiagnostic(diag)).toEqual([]);
    }
  );

  it('tout résultat qui renvoie vers le geste "couper-gaz" est rouge avec un numéro utile', () => {
    for (const diag of diagnostics) {
      for (const resultat of Object.values(diag.resultats)) {
        if (resultat.gesteUrgenceId === 'couper-gaz') {
          expect(resultat.verdict).toBe('rouge');
          expect(Boolean(resultat.numeroUtile)).toBe(true);
        }
      }
    }
  });
});
