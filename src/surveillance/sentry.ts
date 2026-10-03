// Suivi des plantages : uniquement en production, et seulement si un DSN est fourni (.env.local).
import * as Sentry from '@sentry/react-native';
import { nettoyerFilAriane } from './filtre';

export function demarrerSurveillance(): void {
  const dsn = process.env.EXPO_PUBLIC_SENTRY_DSN;
  if (__DEV__ || !dsn) return;
  Sentry.init({
    dsn,
    sendDefaultPii: false,
    beforeBreadcrumb: (miette) => nettoyerFilAriane(miette),
  });
}
