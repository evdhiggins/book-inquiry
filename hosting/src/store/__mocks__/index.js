const storeFunctionsFactory = () => ({
  state: {},
  rootState: {},
  getter() {
    return this.state;
  },
  setter(state) {
    this.state = state;
  },
  rootGetter() {
    return this.rootState;
  },
});

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
