const storeFunctionsFactory = () => {
  const storeFunctions = {
    state: {},
    rootState: {},
  };
  function setter(state) {
    this.state = state;
  }
  function rootGetter() {
    return this.rootState;
  }
  storeFunctions.setter = setter.bind(storeFunctions);
  storeFunctions.rootGetter = rootGetter.bind(storeFunctions);
  return storeFunctions;
};

// eslint-disable-next-line no-unused-vars
const fetchMockFactory = (httpError = false, serverError = false) => jest.fn(async url => ({
  ok: !httpError,
  json: async () => ({
    error: serverError,
    totalItems: 0,
    items: [],
  }),
}));

const storeFunctions = storeFunctionsFactory();

module.exports = { storeFunctions, fetchMockFactory, storeFunctionsFactory };
