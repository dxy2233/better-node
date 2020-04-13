module.exports = {
  env: {
    browser: true,
    es6: true,
    node: true,
  },
  parser: '@typescript-eslint/parser',
  extends: ['plugin:@typescript-eslint/recommended', "airbnb-base", "plugin:prettier/recommended"],
  plugins: ['@typescript-eslint'],
  globals: {
    Atomics: "readonly",
    SharedArrayBuffer: "readonly",
  },
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: "module",
  },
  rules: {
    "prettier/prettier": [
      "error",
      {
        semi: false,
        singleQuote: true,
      },
    ],
    semi: [2, "never"],
    "no-console": "off",
    "no-bitwise": "off",
  },
};
