module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: 'airbnb-base',
  overrides: [
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  rules: {
    camelcase: 'off',
    'linebreak-style': 0,
    'import/no-unresolved': 'off',
    'import/extensions': 'off',
    'import/prefer-default-export': 'off',
    'no-console': 'off',
    'no-unused-vars': 'off',
    'consistent-return': 'off',
    'no-extraneous-dependencies': 'off',
    'no-underscore-dangle': 'off',
  },
};
