// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from "eslint-plugin-storybook";

import js from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import reactPlugin from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import prettier from 'eslint-config-prettier';
import globals from 'globals';

export default [{
  ignores: ['dist', 'coverage', 'node_modules'],
}, {
  settings: {
    react: {
      version: '18.0',
    },
  },
}, js.configs.recommended, ...tseslint.configs['flat/recommended'], reactPlugin.configs.flat.recommended, reactHooks.configs.flat.recommended, jsxA11y.flatConfigs.recommended, prettier, {
  files: ['**/*.{ts,tsx,js,jsx}'],
  languageOptions: {
    parser: tsParser,
    parserOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      ecmaFeatures: {
        jsx: true,
      },
    },
    globals: {
      ...globals.browser,
      ...globals.es2021,
      ...globals.node,
    },
  },
  rules: {
    '@typescript-eslint/no-unused-vars': [
      'warn',
      { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
    ],
    'react/react-in-jsx-scope': 'off',
    'react/jsx-uses-react': 'off',
  },
}, {
  files: ['**/__tests__/**', '**/*.test.*'],
  languageOptions: {
    globals: {
      ...globals.jest,
    },
  },
}, ...storybook.configs["flat/recommended"]];
