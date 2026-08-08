import { defineConfig } from 'eslint/config';
import eslint from '@eslint/js';
import vitest from '@vitest/eslint-plugin';
import noSecrets from 'eslint-plugin-no-secrets';
import perfectionist from 'eslint-plugin-perfectionist';
import pluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import html from '@html-eslint/eslint-plugin';

import pluginSecurity from 'eslint-plugin-security';
import { configs as tsEslintConfig } from 'typescript-eslint';

import eslintIgnore from './eslint.ignore.ts';

export default defineConfig(
  eslintIgnore,
  pluginSecurity.configs.recommended,

  // Basis-Regeln für alle Files
  {
    files: ['**/*.ts', '**/*.js'],
    extends: [eslint.configs.recommended, ...tsEslintConfig.recommended, ...tsEslintConfig.stylistic],
    plugins: {
      'no-secrets': noSecrets,
      vitest,
      perfectionist
    },
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module'
    },
    settings: {
      react: {
        pragma: 'h'
      }
    },
    rules: {
      'no-debugger': 'warn',
      'prettier/prettier': 'warn',
      'perfectionist/sort-imports': [
        'off',
        {
          type: 'alphabetical',
          order: 'asc',
          ignoreCase: true,
          internalPattern: ['^@shared/.*'],
          newlinesBetween: 'always',
          maxLineLength: undefined,
          groups: [
            'type',
            ['builtin', 'external'],
            'internal-type',
            'internal',
            ['parent-type', 'sibling-type', 'index-type'],
            ['parent', 'sibling', 'index'],
            'object',
            'unknown'
          ],
          customGroups: { type: {}, value: {} },
          environment: 'node'
        }
      ],
      '@typescript-eslint/consistent-type-imports': ['warn', { prefer: 'type-imports' }]
    }
  },
  {
    files: ['**/packages/**/*.ts', '**/packages/**/*.js'],
    extends: [eslint.configs.recommended, ...tsEslintConfig.recommended, ...tsEslintConfig.stylistic],
    plugins: {
      'no-secrets': noSecrets,
      vitest,
      perfectionist
    },
    rules: {
      'no-debugger': 'warn',
      // START
      '@typescript-eslint/no-require-imports': 'warn',
      'no-empty': 'warn',
      'prefer-const': 'warn',
      '@typescript-eslint/prefer-for-of': 'warn',
      '@typescript-eslint/array-type': 'warn',
      '@typescript-eslint/ban-tslint-comment': 'warn',
      '@typescript-eslint/no-inferrable-types': 'warn',
      '@typescript-eslint/no-empty-function': 'warn',
      '@typescript-eslint/no-wrapper-object-types': 'warn',
      'no-case-declarations': 'warn',
      'no-var': 'warn',
      '@typescript-eslint/no-unused-expressions': 'warn',
      '@typescript-eslint/no-this-alias': 'warn',
      // END

      'prettier/prettier': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          varsIgnorePattern: '^_+$', // Ignore variables with one or more underscores
          argsIgnorePattern: '^_+$' // Ignore arguments with one or more underscores
        }
      ],
      'security/detect-object-injection': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-namespace': 'off',
      '@typescript-eslint/no-unsafe-function-type': 'off',
      '@typescript-eslint/no-empty-object-type': 'off',
      'perfectionist/sort-imports': [
        'warn',
        {
          type: 'alphabetical',
          order: 'asc',
          ignoreCase: true,
          internalPattern: ['^@shared/.*'],
          newlinesBetween: 'always',
          maxLineLength: undefined,
          groups: [
            'type',
            ['builtin', 'external'],
            'internal-type',
            'internal',
            ['parent-type', 'sibling-type', 'index-type'],
            ['parent', 'sibling', 'index'],
            'object',
            'unknown'
          ],
          customGroups: { type: {}, value: {} },
          environment: 'node'
        }
      ]
    }
  },
  {
    files: ['**/*.html'],
    ...html.configs['flat/recommended'],
    rules: {
      '@html-eslint/no-duplicate-class': 'error',
      '@html-eslint/no-duplicate-id': 'error',
      '@html-eslint/no-obsolete-tags': 'warn',
      '@html-eslint/no-obsolete-attrs': 'warn',
      '@html-eslint/require-img-alt': 'warn',
      '@html-eslint/require-button-type': 'warn'
    }
  },
  pluginPrettierRecommended
);
