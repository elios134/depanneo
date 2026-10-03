// Plugin Expo : désactive l'envoi automatique des source maps vers Sentry au build release.
// Sans cela, `gradlew assembleRelease` échoue faute de compte/jeton Sentry.
// Ajoute à la fin de android/app/build.gradle (à chaque prebuild) un remplacement des réglages de sentry.gradle.
const { withAppBuildGradle } = require('expo/config-plugins');

const MARQUEUR = '// Dépannéo : pas d\'envoi de source maps vers Sentry';
const BLOC = `
${MARQUEUR}
project.ext.shouldSentryAutoUploadGeneral = { -> false }
project.ext.shouldSentryAutoUploadNative = { -> false }
project.ext.shouldSentryAutoUpload = { -> false }
`;

module.exports = function sentrySansEnvoi(config) {
  return withAppBuildGradle(config, (cfg) => {
    if (cfg.modResults.language === 'groovy' && !cfg.modResults.contents.includes(MARQUEUR)) {
      cfg.modResults.contents += BLOC;
    }
    return cfg;
  });
};
