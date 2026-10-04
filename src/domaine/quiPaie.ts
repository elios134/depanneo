import type { QuiPaie } from './types';

export type TonQuiPaie = 'vert' | 'orange' | 'neutre';

type Statut = 'locataire' | 'proprietaire' | 'non-precise';

const A_TA_CHARGE = { titre: 'À ta charge', ton: 'vert' } as const;

/** Titre du bloc « Qui paie ? » selon la panne et le statut de l'utilisateur (null = non précisé). */
export function titreQuiPaie(qui: QuiPaie, statut: Statut | null): { titre: string; ton: TonQuiPaie } {
  const s: Statut = statut ?? 'non-precise';
  switch (qui) {
    case 'autre':
      return { titre: "Un autre organisme s'en occupe", ton: 'neutre' };
    case 'locataire':
      if (s === 'non-precise') return { titre: 'Locataire : entretien courant', ton: 'neutre' };
      return A_TA_CHARGE;
    case 'proprietaire':
      if (s === 'locataire') return { titre: 'À la charge du propriétaire : préviens-le', ton: 'orange' };
      if (s === 'proprietaire') return A_TA_CHARGE;
      return { titre: 'Propriétaire', ton: 'neutre' };
    case 'depend':
      if (s === 'proprietaire') return A_TA_CHARGE;
      return { titre: 'Ça dépend de la cause', ton: 'neutre' };
  }
}
