module.exports = {
  root: true,
  env: {
    browser: true,
    'jest/globals': true,
  },
  parserOptions: {
    sourceType: 'module',
  },
  plugins: ['html', 'jest'],
  extends: ['airbnb-base'],
  rules: {
    // console.error() is used to log server function errors to StackDriver
    'no-console': 0,

    // underscore dangle is used for private class properties
    'no-underscore-dangle': 0,

    // store modules may not always use `this`
    'class-methods-use-this': 0,

    // no objects are created that do not inherit from the object prototype
    'no-prototype-builtins': 0,
  },
};
