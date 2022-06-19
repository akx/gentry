module.exports = {
  env: {
    browser: true,
    es6: true,
    node: true,
  },
  extends: ['plugin:@typescript-eslint/recommended', 'plugin:@typescript-eslint/recommended-requiring-type-checking'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    sourceType: 'module',
  },
  plugins: ['eslint-plugin-import', '@typescript-eslint', 'prettier'],
  root: true,
  rules: {
    'prettier/prettier': 'error',
  },
};
