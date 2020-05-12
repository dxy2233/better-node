module.exports = {
  env: {
    browser: true,
    es6: true,
    node: true,
  },
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint/eslint-plugin'],
  // extends: ['plugin:@typescript-eslint/recommended', "plugin:prettier/recommended", "airbnb-base"],
  extends: [
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
    'prettier',
    // 'airbnb-base',
  ],
  // globals: {
  //   Atomics: "readonly",
  //   SharedArrayBuffer: "readonly",
  // },
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: "module",
  },
  rules: {
    // "prettier/prettier": "error",
    "no-console": "off",
    "no-bitwise": "off",
  },
};
