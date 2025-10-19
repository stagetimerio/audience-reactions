import eslint from '@eslint/js'
import tseslint from '@typescript-eslint/eslint-plugin'
import tsparser from '@typescript-eslint/parser'
import importPlugin from 'eslint-plugin-import'

export default [
  // Ignore patterns
  {
    ignores: ['lib/**/*', 'generated/**/*', 'eslint.config.js'],
  },

  // Base config for all files
  {
    files: ['**/*.{js,ts}'],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        project: ['./tsconfig.json', './tsconfig.dev.json'],
        sourceType: 'module',
      },
      ecmaVersion: 'latest',
      globals: {
        console: 'readonly',
        process: 'readonly',
        __dirname: 'readonly',
        module: 'readonly',
        require: 'readonly',
        exports: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
      'import': importPlugin,
    },
    rules: {
      // ESLint recommended rules
      ...eslint.configs.recommended.rules,

      // TypeScript ESLint recommended rules
      ...tseslint.configs.recommended.rules,

      // Import plugin rules
      'import/no-unresolved': 'off',

      // Code style rules
      'quotes': ['error', 'single'],
      'semi': ['error', 'never'],
      'object-curly-spacing': ['error', 'always'],
      'indent': ['error', 2],
      'max-len': ['error', { 'code': 120, 'ignoreUrls': true }],
      'operator-linebreak': ['warn', 'before'],

      // TypeScript specific overrides
      '@typescript-eslint/no-explicit-any': 'off',
      'no-unused-vars': 'off', // Disable base rule
      '@typescript-eslint/no-unused-vars': ['error', {
        'argsIgnorePattern': '^_',
        'varsIgnorePattern': '^_',
        'caughtErrorsIgnorePattern': '^_',
      }],

      // Google style guide inspired rules
      'camelcase': 'off', // Disabled because TypeScript handles this
      'valid-jsdoc': 'off',
      'require-jsdoc': 'off',
    },
  },
]
