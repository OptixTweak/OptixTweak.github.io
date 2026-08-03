// eslint.config.js — Flat Config für ESLint 9.
// Browser- und Node-Umgebungen getrennt, bewusst lockere Regeln für ein Demo-Projekt.
'use strict';

const js = require('@eslint/js');
const globals = require('globals');

module.exports = [
  {
    files: ['**/*.js'],
    ignores: [
      'node_modules/**',
      'standard-integration/**',
      'examples/stripe-checkout/node_modules/**'
    ]
  },
  {
    files: ['src/js/**/*.js', 'js/**/*.js', 'tools/**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'script',
      globals: {
        ...globals.browser,
        ...globals.es2021
      }
    },
    rules: {
      ...js.configs.recommended.rules,
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_', caughtErrors: 'none' }],
      'no-console': 'off'
    }
  },
  {
    files: ['server/**/*.js', 'test/**/*.js', 'tools/generate-sitemap.js', 'examples/stripe-checkout/server.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'commonjs',
      globals: {
        ...globals.node,
        ...globals.es2021
      }
    },
    rules: {
      ...js.configs.recommended.rules,
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_', caughtErrors: 'none' }],
      'no-console': 'off'
    }
  }
];

