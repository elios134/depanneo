import AsyncStorage from '@react-native-async-storage/async-storage';
import { act, create } from 'react-test-renderer';
import { LogementProvider, useLogement } from './LogementProvider';
import { CLE_LOGEMENT } from './lib/logement';

const mockSupprimes: string[] = [];
let mockCopieEchoue = false;

jest.mock('expo-file-system', () => {
  class File {
    uri: string;
    constructor(...parties: unknown[]) {
      this.uri = parties.map((p) => (typeof p === 'string' ? p : (p as { uri: string }).uri)).join('/');
    }
    get exists() {
      return true;
    }
    delete() {
      mockSupprimes.push(this.uri);
    }
    async copy() {
      if (mockCopieEchoue) throw new Error('copie impossible');
    }
  }
  class Directory {
    uri: string;
    constructor(...parties: unknown[]) {
      this.uri = parties.map((p) => (typeof p === 'string' ? p : (p as { uri: string }).uri)).join('/');
    }
    create() {}
  }
  return { File, Directory, Paths: { document: new Directory('file:///docs') } };
});

jest.mock('@react-native-async-storage/async-storage', () =>
  jest.requireActual('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

const sonde: { ctx: ReturnType<typeof useLogement> } = { ctx: undefined as never };
function Sonde({ rendre }: { rendre: (c: ReturnType<typeof useLogement>) => void }) {
  rendre(useLogement());
  return null;
}

async function monter() {
  await act(async () => {
    create(
      <LogementProvider>
        <Sonde rendre={(c) => Object.assign(sonde, { ctx: c })} />
      </LogementProvider>,
    );
  });
}

beforeEach(async () => {
  mockSupprimes.length = 0;
  mockCopieEchoue = false;
  await AsyncStorage.clear();
  await AsyncStorage.setItem(CLE_LOGEMENT, JSON.stringify({ tableau: { photo: 'file:///docs/logement/ancienne.jpg', note: 'Placard' } }));
});

describe('LogementProvider : fichiers', () => {
  it('copie réussie : enregistre la nouvelle URI puis supprime l’ancienne photo', async () => {
    await monter();
    await act(async () => {
      await sonde.ctx.enregistrer('tableau', { photo: 'file:///cache/x.jpg', note: 'Placard' }, 'image/jpeg');
    });
    const photo = sonde.ctx.logement.tableau?.photo ?? '';
    expect(photo).toMatch(/^file:\/\/\/docs\/logement\/tableau-\d+\.jpg$/);
    expect(JSON.parse((await AsyncStorage.getItem(CLE_LOGEMENT)) ?? '{}').tableau.photo).toBe(photo);
    expect(mockSupprimes).toEqual(['file:///docs/logement/ancienne.jpg']);
  });

  it('copie ratée : erreur remontée, ancienne photo et entrée inchangées', async () => {
    await monter();
    mockCopieEchoue = true;
    await expect(
      act(async () => {
        await sonde.ctx.enregistrer('tableau', { photo: 'file:///cache/x.jpg', note: 'Autre' }, 'image/jpeg');
      }),
    ).rejects.toThrow('copie impossible');
    expect(sonde.ctx.logement.tableau).toEqual({ photo: 'file:///docs/logement/ancienne.jpg', note: 'Placard' });
    expect(mockSupprimes).toEqual([]);
  });
});
