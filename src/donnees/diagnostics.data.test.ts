import { validerDiagnostic } from '@/domaine/validateDiagnostic';
import { diagnostics } from '@/donnees/diagnostics';

describe('données de diagnostics', () => {
  it('contient exactement 8 diagnostics', () => {
    expect(diagnostics.length).toBe(8);
  });

  it.each(diagnostics.map((d) => [d.id, d] as const))(
    'le diagnostic "%s" ne contient aucune branche orpheline',
    (_id, diag) => {
      expect(validerDiagnostic(diag)).toEqual([]);
    }
  );

  it('le diagnostic "odeur-gaz" aboutit toujours à un verdict rouge', () => {
    const diagGaz = diagnostics.find((d) => d.id === 'odeur-gaz');
    expect(diagGaz).toBeDefined();
    const verdicts = Object.values(diagGaz!.resultats).map((r) => r.verdict);
    expect(verdicts.every((v) => v === 'rouge')).toBe(true);
    const numeros = Object.values(diagGaz!.resultats).map((r) => r.numeroUtile);
    expect(numeros.every((n) => Boolean(n))).toBe(true);
  });

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
