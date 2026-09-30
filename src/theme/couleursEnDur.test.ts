import { readdirSync, readFileSync, statSync } from 'fs';
import { join, relative } from 'path';

const RACINE = join(__dirname, '..', '..');
const DOSSIERS = ['src', 'app'];
const EXCLU = join(RACINE, 'src', 'theme');
const COULEUR = /#[0-9a-fA-F]{3,8}\b|rgba?\(/;

function fichiers(dossier: string): string[] {
  return readdirSync(dossier).flatMap((nom: string) => {
    const chemin = join(dossier, nom);
    if (statSync(chemin).isDirectory()) return chemin.startsWith(EXCLU) ? [] : fichiers(chemin);
    return /\.(ts|tsx)$/.test(nom) && !/\.test\.(ts|tsx)$/.test(nom) ? [chemin] : [];
  });
}

describe('couleurs', () => {
  it("aucune couleur n'est écrite en dur hors de src/theme", () => {
    const fautes = DOSSIERS.flatMap((d: string) => fichiers(join(RACINE, d)))
      .flatMap((f: string) =>
        readFileSync(f, 'utf8')
          .split('\n')
          .map((ligne: string, i: number) => ({ ligne, i }))
          .filter(({ ligne }: { ligne: string }) => COULEUR.test(ligne))
          .map(({ i }: { i: number }) => `${relative(RACINE, f)}:${i + 1}`),
      );
    expect(fautes).toEqual([]);
  });
});
