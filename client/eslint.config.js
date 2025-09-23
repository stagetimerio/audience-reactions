import globals from 'globals'
import pluginJs from '@eslint/js'
import stylistic from '@stylistic/eslint-plugin'
import pluginVue from 'eslint-plugin-vue'

export default [
  {
    name: 'client/globals',
    plugins: {
      '@stylistic': stylistic,
    },
  },

  ...pluginVue.configs['flat/recommended'],

  // Override some vue plugin rules
  {
    name: 'client/vue',
    files: ['**/*.{js,vue}'],
    languageOptions: {
      globals: globals.browser,
    },
    rules: {
      ...pluginJs.configs.recommended.rules,
      ...stylistic.configs.recommended.rules,
      'no-console': process.env.NODE_ENV === 'production' ? ['error', { allow: ['info', 'warn', 'error', 'debug'] }] : 'off',
      'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
      'no-unused-vars': [process.env.NODE_ENV === 'production' ? 'error' : 'warn', { 'argsIgnorePattern': '^_', 'destructuredArrayIgnorePattern': '^_' }],
      'no-unused-expressions': process.env.NODE_ENV === 'production' ? 'error' : 'warn',
      '@stylistic/quotes': ['warn', 'single'],
      '@stylistic/semi': ['warn', 'never'],
      '@stylistic/indent': ['warn', 2, { 'SwitchCase': 1 }],
      '@stylistic/comma-dangle': ['warn', 'always-multiline'],
      '@stylistic/space-before-function-paren': ['warn', 'always'],
      '@stylistic/object-curly-spacing': ['warn', 'always'],
      '@stylistic/arrow-parens': ['warn', 'always'],
      '@stylistic/brace-style': ['warn', '1tbs'],
      '@stylistic/quote-props': ['warn', 'consistent'],
      'vue/no-unused-components': 'warn',
      'vue/singleline-html-element-content-newline': 'off',
      'vue/multiline-html-element-content-newline': 'off',
      'vue/v-slot-style': ['warn', 'longform'],
      'vue/max-attributes-per-line': ['warn', { 'singleline': 6, 'multiline': 1 }],
      'vue/no-multiple-template-root': 'off',
      'vue/multi-word-component-names': 'off',
    },
  },

  {
    name: 'client/scripts-and-configs',
    files: ['**/*.config.js', 'plugins/*'],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },

  // Global ignore patterns
  {
    name: 'client/ignore',
    ignores: [
      'dist/*',
      '**/*.DEPRECATED.*',
      '**/*.OBSOLETE.*',
      '**/*.TEMP.*',
    ],
  },
]
