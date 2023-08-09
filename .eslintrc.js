module.exports = {
  root: true,
  env: {
    node: true,
    es6: true,
  },
  parserOptions: {
    ecmaVersion: 2020,
  },
  plugins: ['no-only-tests'],
  ignorePatterns: ['**/dist/', 'packages/', '*.TEMP.js', '*.OBSOLETE.js'],
  rules: {
    'quotes': ['warn', 'single'],
    'semi': ['warn', 'never'],
    'indent': ['warn', 2, { 'SwitchCase': 1 }],
    'no-console': process.env.NODE_ENV === 'production' ? ['error', { allow: ['info', 'warn', 'error', 'debug'] }] : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'comma-dangle': ['warn', 'always-multiline'],
    'no-unused-vars': process.env.NODE_ENV === 'production' ? 'error' : 'warn',
    'no-unused-expressions': process.env.NODE_ENV === 'production' ? 'error' : 'warn',
    'no-only-tests/no-only-tests': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-unused-vars': ['warn', { 'argsIgnorePattern': '^_' }],
    'space-before-function-paren': ['warn', 'always'],
    'object-curly-spacing': ['warn', 'always'],
  },
}
