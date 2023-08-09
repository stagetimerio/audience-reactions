const INLINE_ELEMENTS = require('eslint-plugin-vue/lib/utils/inline-non-void-elements.json')

module.exports = {
  extends: [
    'plugin:vue/vue3-recommended',
  ],
  rules: {
    'vue/no-unused-components': 'warn',
    'vue/singleline-html-element-content-newline': ['warn', {
      'ignores': ['pre', 'textarea', 'button', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'option', 'router-link', ...INLINE_ELEMENTS],
    }],
    'vue/multiline-html-element-content-newline': 'off',
    'vue/v-slot-style': ['warn', 'longform'],
    'vue/max-attributes-per-line': ['warn', {
      'singleline': 5,
      'multiline': 1,
    }],
    'vue/no-multiple-template-root': 'off',
    'vue/multi-word-component-names': 'off',
  },
}
