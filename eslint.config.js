// Configuration ESLint (règles recommandées par Expo).
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['android/*', 'ios/*', '.expo/*', 'dist/*', 'node_modules/*', 'scripts/*'],
  },
]);
